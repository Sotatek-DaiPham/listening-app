import { getStorageProvider } from '../storage'
import { parseSrtContent } from './srt-parser'
import { sliceAudioSegment } from './ffmpeg'
import prisma from '../prisma'
import path from 'path'
import os from 'os'
import fs from 'fs'

export interface ProcessMediaResult {
  success: boolean
  segmentsProcessed: number
  error?: string
}

/**
 * The Core Media Processing Engine.
 * Takes an existing Media DB record and processes its source audio/SRT to create segments.
 */
async function updateMediaProgress(mediaId: string, data: any) {
  try {
    // Attempt standard update
    // @ts-ignore
    await (prisma.media || prisma['media']).update({
      where: { id: mediaId },
      data
    })
  } catch (err) {
    console.warn(`[Processor] Prisma client update failed for ${mediaId}, falling back to raw SQL.`)
    // Fallback to raw SQL for status/progress updates
    const sets: string[] = []
    if (data.status) sets.push(`"status" = '${data.status}'`)
    if (data.totalSegments !== undefined) sets.push(`"totalSegments" = ${data.totalSegments}`)
    if (data.processedSegments !== undefined) sets.push(`"processedSegments" = ${data.processedSegments}`)
    if (data.errorMessage) sets.push(`"errorMessage" = '${data.errorMessage.replace(/'/g, "''")}'`)
    
    if (sets.length > 0) {
      await prisma.$executeRawUnsafe(
        `UPDATE "Media" SET ${sets.join(', ')}, "updatedAt" = NOW() WHERE id = '${mediaId}'`
      )
    }
  }
}

export async function processMediaAudio(mediaId: string): Promise<ProcessMediaResult> {
  try {
    // We use raw query for initial fetch if prisma.media is missing
    let media: any = null
    try {
      // @ts-ignore
      media = await (prisma.media || prisma['media']).findUnique({ where: { id: mediaId } })
    } catch (e) {
      const raw: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "Media" WHERE id = '${mediaId}' LIMIT 1`)
      media = raw[0]
    }

    if (!media) throw new Error('Media not found in DB')
    
    // 1. Mark as Processing
    console.log(`[Processor] Starting media processing for ID: ${mediaId}`)
    await updateMediaProgress(mediaId, { status: 'PROCESSING' })

    const physicalSrtPath = media.srtUrl ? path.join(process.cwd(), 'public', media.srtUrl) : ''
    console.log(`[Processor] Reading SRT from: ${physicalSrtPath}`)
    const srtContent = physicalSrtPath ? fs.readFileSync(physicalSrtPath, 'utf-8') : ''
    if (!srtContent) throw new Error('SRT content is empty or unreadable')

    const subtitles = parseSrtContent(srtContent)
    console.log(`[Processor] Parsed ${subtitles.length} subtitle segments.`)
    if (subtitles.length === 0) throw new Error('No subtitle cues found')

    // 2. Set Total Segments
    await updateMediaProgress(mediaId, { totalSegments: subtitles.length })

    // Clean up any existing segments for this media to avoid duplication (e.g. on retry)
    try {
      // @ts-ignore
      await (prisma.segment || prisma['segment']).deleteMany({ 
        where: { mediaId: media.id } 
      })
      console.log(`[Processor] Cleaned up existing segments for media: ${mediaId}`)
    } catch (e) {
      console.warn(`[Processor] Segment cleanup failed (likely no segments existed):`, e)
    }

    const storage = getStorageProvider()
    let processedCount = 0

    const tempDir = os.tmpdir()
    const physicalSourcePath = path.join(process.cwd(), 'public', media.sourceUrl)
    console.log(`[Processor] Source audio path: ${physicalSourcePath}`)

    for (const sub of subtitles) {
      const durationMs = sub.endTime - sub.startTime
      if (durationMs < 100) {
        console.warn(`[Processor] Skipping very short segment: ${sub.startTime}ms`)
        continue 
      }
      
      const chunkFilename = `chunk_${media.id}_${sub.startTime}.mp3`
      const tempOutputPath = path.join(tempDir, chunkFilename)

      console.log(`[Processor] Slicing segment ${processedCount + 1}/${subtitles.length} at ${sub.startTime}ms to ${tempOutputPath}`)
      try {
        await sliceAudioSegment({
          inputPath: physicalSourcePath,
          outputPath: tempOutputPath,
          startTimeMs: sub.startTime,
          durationMs: durationMs
        })
        console.log(`[Processor] Slice SUCCESS for segment ${processedCount + 1}`)
      } catch (err) {
        console.error(`[Processor] Slice FAILED for segment ${processedCount + 1}:`, err)
        throw err
      }

      console.log(`[Processor] Reading chunk buffer and uploading...`)
      const chunkBuffer = fs.readFileSync(tempOutputPath)
      const finalUrl = await storage.uploadFile(chunkBuffer, chunkFilename, 'audio/mpeg')
      fs.unlinkSync(tempOutputPath)

      // Segments should still work because the table existed in the old schema
      // @ts-ignore
      await (prisma.segment || prisma['segment']).create({
        data: {
          mediaId: media.id,
          startTime: sub.startTime,
          endTime: sub.endTime,
          text: sub.text,
          audioUrl: finalUrl
        }
      })
      
      processedCount++
      
      // 3. Update Progress
      await updateMediaProgress(mediaId, { processedSegments: processedCount })
    }

    // 4. Mark as Completed
    console.log(`[Processor] Successfully processed ${processedCount} segments. Setting status to COMPLETED.`)
    await updateMediaProgress(mediaId, { status: 'COMPLETED' })

    return { success: true, segmentsProcessed: processedCount }

  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[Processor] CRITICAL FAILURE:', error)
    
    // 5. Mark as Failed
    await updateMediaProgress(mediaId, { 
      status: 'FAILED',
      errorMessage: message
    }).catch(err => console.error('[Processor] Failed to persist error state to DB:', err))

    return { success: false, segmentsProcessed: 0, error: message }
  }
}
