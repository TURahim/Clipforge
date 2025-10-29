/**
 * Recording utilities for screen and webcam recording
 */

export interface DesktopSource {
  id: string
  name: string
  thumbnail: string
  display_id?: string
  appIcon?: string | null
}

export interface RecordingOptions {
  sourceId?: string
  audioEnabled?: boolean
  videoWidth?: number
  videoHeight?: number
}

/**
 * Start screen recording with a specific desktop source
 */
export async function startScreenRecording(sourceId: string): Promise<MediaRecorder> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        // @ts-expect-error - chromeMediaSource is Electron-specific
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId,
          minWidth: 1280,
          maxWidth: 1920,
          minHeight: 720,
          maxHeight: 1080
        }
      }
    })
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000
    })
    
    return mediaRecorder
  } catch (error) {
    console.error('[Recording] Failed to start screen recording:', error)
    throw error
  }
}

/**
 * Start webcam recording
 */
export async function startWebcamRecording(audioEnabled = true): Promise<{ mediaRecorder: MediaRecorder; stream: MediaStream }> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: audioEnabled ? {
        echoCancellation: true,
        noiseSuppression: true
      } : false
    })
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000
    })
    
    return { mediaRecorder, stream }
  } catch (error) {
    console.error('[Recording] Failed to start webcam recording:', error)
    throw error
  }
}

/**
 * Stop recording and return the recorded blob
 */
export function stopRecording(mediaRecorder: MediaRecorder): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const chunks: Blob[] = []
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      resolve(blob)
    }
    
    mediaRecorder.onerror = (event) => {
      reject(new Error(`Recording error: ${event}`))
    }
    
    try {
      mediaRecorder.stop()
      
      // Stop all tracks
      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop())
      }
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Save recording blob to disk via IPC
 */
export async function saveRecording(blob: Blob, filename: string): Promise<string> {
  const buffer = await blob.arrayBuffer()
  const uint8Array = new Uint8Array(buffer)
  
  const result = await window.electron.invoke('save-recording', uint8Array, filename) as { success: boolean; filePath?: string; error?: string }
  
  if (!result.success || !result.filePath) {
    throw new Error(result.error || 'Failed to save recording')
  }
  
  return result.filePath
}

/**
 * Start both screen and webcam recording simultaneously (PiP)
 */
export async function startPiPRecording(screenSourceId: string): Promise<{
  screenRecorder: MediaRecorder
  webcamRecorder: MediaRecorder
  webcamStream: MediaStream
}> {
  try {
    // Start screen recording
    const screenStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        // @ts-expect-error - chromeMediaSource is Electron-specific
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: screenSourceId,
          minWidth: 1280,
          maxWidth: 1920,
          minHeight: 720,
          maxHeight: 1080
        }
      }
    })
    
    // Start webcam recording
    const webcamStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: true
    })
    
    const screenRecorder = new MediaRecorder(screenStream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000
    })
    
    const webcamRecorder = new MediaRecorder(webcamStream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000
    })
    
    return { screenRecorder, webcamRecorder, webcamStream }
  } catch (error) {
    console.error('[Recording] Failed to start PiP recording:', error)
    throw error
  }
}

/**
 * Format recording duration (seconds to MM:SS)
 */
export function formatRecordingTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}


