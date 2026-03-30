import { parseSync, Node } from 'subtitle'

export interface ParsedSubtitle {
  id: string
  startTime: number // ms
  endTime: number // ms
  text: string
}

/**
 * Parses raw SRT string content into structured JSON segment objects
 */
export function parseSrtContent(srtContent: string): ParsedSubtitle[] {
  try {
    const nodes: Node[] = parseSync(srtContent)
    
    // Filter out comments/headers and strictly just map dialog cues
    return nodes
      .filter((node) => node.type === 'cue')
      .map((node, index) => {
        const cue = node.data
        return {
          id: `seg-${index}-${Date.now()}`,
          startTime: cue.start,
          endTime: cue.end,
          // Strip out HTML markup sometimes found in SRTs (like <i>, <b>)
          text: cue.text.replace(/<[^>]*>?/gm, '').trim()
        }
      })
  } catch (error) {
    console.error('Failed to parse SRT content:', error)
    throw new Error('Invalid SRT format')
  }
}
