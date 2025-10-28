import { dialog } from 'electron'
import { extname } from 'path'

// Supported video formats
const SUPPORTED_FORMATS = ['.mp4', '.mov', '.avi', '.mkv', '.webm']

export interface FileImportResult {
  success: boolean
  filePath?: string
  error?: string
}

export async function openFileDialog(): Promise<FileImportResult> {
  try {
    const result = await dialog.showOpenDialog({
      title: 'Import Video',
      filters: [
        {
          name: 'Videos',
          extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
        },
        {
          name: 'All Files',
          extensions: ['*'],
        },
      ],
      properties: ['openFile'],
    })

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, error: 'No file selected' }
    }

    const filePath = result.filePaths[0]
    const ext = extname(filePath).toLowerCase()

    if (!SUPPORTED_FORMATS.includes(ext)) {
      return {
        success: false,
        error: `Unsupported video format '${ext}'. Please select MP4, MOV, AVI, MKV, or WEBM files.`,
      }
    }

    return { success: true, filePath }
  } catch (error) {
    return {
      success: false,
      error: `Failed to open file dialog: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

export function validateVideoFile(filePath: string): {
  valid: boolean
  error?: string
} {
  const ext = extname(filePath).toLowerCase()

  if (!SUPPORTED_FORMATS.includes(ext)) {
    return {
      valid: false,
      error: `This file format '${ext}' is not supported. Please use MP4, MOV, AVI, MKV, or WEBM files.`,
    }
  }

  return { valid: true }
}

