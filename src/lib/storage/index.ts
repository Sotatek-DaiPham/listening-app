import { StorageProvider } from "./types"
import { promises as fs } from "fs"
import path from "path"

export class LocalStorageProvider implements StorageProvider {
  private baseUploadDir = path.join(process.cwd(), "public", "uploads")

  async uploadFile(data: Buffer, filename: string, mimeType: string): Promise<string> {
    // Ensure the uploads directory exists
    await fs.mkdir(this.baseUploadDir, { recursive: true })
    
    // Create the full physical path
    const filePath = path.join(this.baseUploadDir, filename)
    
    // Write buffer to disk
    await fs.writeFile(filePath, data)
    
    // Return relative URL for web front-end access (since it's inside /public)
    return `/uploads/${filename}`
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // If it's a URL like /uploads/filename.mp3, strip the prefix
    const relativePath = fileUrl.startsWith('/uploads/') 
      ? fileUrl.substring('/uploads/'.length) 
      : fileUrl

    // Normalize and join to get absolute path
    const filePath = path.join(this.baseUploadDir, relativePath)

    // Security: Ensure the file is actually inside the baseUploadDir
    if (!filePath.startsWith(this.baseUploadDir)) {
      console.warn(`[Storage] Attempted to delete file outside upload directory: ${filePath}`)
      return
    }

    try {
      await fs.unlink(filePath)
      console.log(`[Storage] Deleted file: ${filePath}`)
    } catch (e: any) {
      // Ignore "no such file" errors
      if (e.code !== 'ENOENT') throw e;
    }
  }

  async getFileUrl(filename: string): Promise<string> {
    return `/uploads/${filename}`
  }
}

export function getStorageProvider(): StorageProvider {
  // In production, instantiate an S3StorageProvider if AWS credentials exist.
  // For Phase 5 we default to LocalStorageProvider.
  return new LocalStorageProvider()
}
