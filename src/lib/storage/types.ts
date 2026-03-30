export interface StorageProvider {
  /**
   * Uploads a file to the storage provider
   * @param buffer The file content as a Buffer
   * @param filename The desired name of the file
   * @param contentType The MIME type of the file
   * @returns The URL or accessible path to the uploaded file
   */
  uploadFile(buffer: Buffer, filename: string, contentType: string): Promise<string>

  /**
   * Deletes a file from the storage provider
   * @param fileUrl The URL or path of the file to delete
   */
  deleteFile(fileUrl: string): Promise<void>

  /**
   * Gets a signed URL or direct URL for file access
   * @param fileUrl The internal path or URL
   */
  getFileUrl(fileUrl: string): Promise<string>
}
