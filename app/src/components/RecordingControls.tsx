import { useState, useRef, useEffect } from 'react'
import { Monitor, Video, Circle, Square, Loader2, Combine } from 'lucide-react'
import { SourcePicker } from './SourcePicker'
import { startScreenRecording, startWebcamRecording, startPiPRecording, stopRecording, saveRecording, formatRecordingTime } from '../utils/recording'
import { useStore } from '../store/useStore'
import Toast from './ui/Toast'

type RecordingMode = 'screen' | 'webcam' | 'both' | null

export function RecordingControls() {
  const { addClip } = useStore()
  
  const [mode, setMode] = useState<RecordingMode>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [showSourcePicker, setShowSourcePicker] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const secondRecorderRef = useRef<MediaRecorder | null>(null) // For PiP mode
  const webcamStreamRef = useRef<MediaStream | null>(null)
  const previewVideoRef = useRef<HTMLVideoElement>(null)
  const screenPreviewVideoRef = useRef<HTMLVideoElement>(null)
  const timerIntervalRef = useRef<number | null>(null)
  
  // Update preview when webcam stream changes
  useEffect(() => {
    if (previewVideoRef.current && webcamStreamRef.current) {
      previewVideoRef.current.srcObject = webcamStreamRef.current
    }
  }, [webcamStreamRef.current])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])
  
  const startTimer = () => {
    setRecordingTime(0)
    timerIntervalRef.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1)
    }, 1000)
  }
  
  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
  }
  
  const handleStartScreenRecording = () => {
    setMode('screen')
    setShowSourcePicker(true)
  }
  
  const handleStartBothRecording = () => {
    setMode('both')
    setShowSourcePicker(true)
  }
  
  const handleStartWebcamRecording = async () => {
    try {
      setError(null)
      setMode('webcam')
      setIsProcessing(true)
      
      const { mediaRecorder, stream } = await startWebcamRecording(true)
      
      mediaRecorderRef.current = mediaRecorder
      webcamStreamRef.current = stream
      
      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
      startTimer()
      setIsProcessing(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start webcam recording'
      setError(errorMessage)
      setMode(null)
      setIsProcessing(false)
      
      // Check for permission errors
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        setError('Camera or microphone permission denied. Please grant access in System Preferences.')
      }
    }
  }
  
  const handleSourceSelected = async (sourceId: string) => {
    try {
      setError(null)
      setShowSourcePicker(false)
      setIsProcessing(true)
      
      if (mode === 'both') {
        // Start both screen and webcam recording (PiP)
        const { screenRecorder, webcamRecorder, webcamStream } = await startPiPRecording(sourceId)
        
        mediaRecorderRef.current = screenRecorder
        secondRecorderRef.current = webcamRecorder
        webcamStreamRef.current = webcamStream
        
        // Start both recordings
        screenRecorder.start()
        webcamRecorder.start()
        setIsRecording(true)
        startTimer()
        setIsProcessing(false)
      } else {
        // Start screen recording only
        const mediaRecorder = await startScreenRecording(sourceId)
        
        mediaRecorderRef.current = mediaRecorder
        
        // Start recording
        mediaRecorder.start()
        setIsRecording(true)
        startTimer()
        setIsProcessing(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start screen recording'
      setError(errorMessage)
      setMode(null)
      setIsProcessing(false)
      
      // Check for permission errors
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        setError('Screen recording permission denied. Please grant access in System Preferences > Privacy & Security > Screen Recording.')
      }
    }
  }
  
  const handleStopRecording = async () => {
    if (!mediaRecorderRef.current) return
    
    try {
      setIsProcessing(true)
      stopTimer()
      
      if (mode === 'both' && secondRecorderRef.current) {
        // Stop both recordings (PiP mode)
        const [screenBlob, webcamBlob] = await Promise.all([
          stopRecording(mediaRecorderRef.current),
          stopRecording(secondRecorderRef.current)
        ])
        
        // Stop webcam stream
        if (webcamStreamRef.current) {
          webcamStreamRef.current.getTracks().forEach(track => track.stop())
          webcamStreamRef.current = null
        }
        
        const timestamp = Date.now()
        
        // Save both recordings
        const screenFilePath = await saveRecording(screenBlob, `screen-recording-${timestamp}.webm`)
        const webcamFilePath = await saveRecording(webcamBlob, `webcam-recording-${timestamp}.webm`)
        
        // Import both recordings
        const [screenResult, webcamResult] = await Promise.all([
          window.electron.invoke('import-video', screenFilePath),
          window.electron.invoke('import-video', webcamFilePath)
        ]) as Array<{
          success: boolean
          data?: {
            filePath: string
            metadata: { duration: number; width: number; height: number }
            thumbnail: string
          }
          error?: string
        }>
        
        // Add both clips
        if (screenResult.success && screenResult.data) {
          const screenClip = {
            id: `clip-${timestamp}-screen`,
            filePath: screenResult.data.filePath,
            filename: screenResult.data.filePath.split('/').pop() || 'screen-recording.webm',
            duration: screenResult.data.metadata.duration,
            thumbnail: screenResult.data.thumbnail,
            metadata: screenResult.data.metadata,
          }
          addClip(screenClip)
        }
        
        if (webcamResult.success && webcamResult.data) {
          const webcamClip = {
            id: `clip-${timestamp}-webcam`,
            filePath: webcamResult.data.filePath,
            filename: webcamResult.data.filePath.split('/').pop() || 'webcam-recording.webm',
            duration: webcamResult.data.metadata.duration,
            thumbnail: webcamResult.data.thumbnail,
            metadata: webcamResult.data.metadata,
          }
          addClip(webcamClip)
        }
        
        setSuccess('Screen and webcam recordings saved! Drag them to the timeline for PiP editing.')
        
        // Reset state
        mediaRecorderRef.current = null
        secondRecorderRef.current = null
      } else {
        // Single recording (screen or webcam)
        const blob = await stopRecording(mediaRecorderRef.current)
        
        // Stop webcam stream if active
        if (webcamStreamRef.current) {
          webcamStreamRef.current.getTracks().forEach(track => track.stop())
          webcamStreamRef.current = null
        }
        
        // Save to disk
        const filename = `${mode}-recording-${Date.now()}.webm`
        const filePath = await saveRecording(blob, filename)
        
        // Import the recording
        const result = await window.electron.invoke('import-video', filePath) as {
          success: boolean
          data?: {
            filePath: string
            metadata: {
              duration: number
              width: number
              height: number
            }
            thumbnail: string
          }
          error?: string
        }
        
        if (result.success && result.data) {
          // Create clip object matching the Clip interface
          const clip = {
            id: `clip-${Date.now()}`,
            filePath: result.data.filePath,
            filename: result.data.filePath.split('/').pop() || `${mode}-recording.webm`,
            duration: result.data.metadata.duration,
            thumbnail: result.data.thumbnail,
            metadata: result.data.metadata,
          }
          
          addClip(clip)
          setSuccess(`Recording saved and imported: ${clip.filename}`)
        } else {
          throw new Error(result.error || 'Failed to import recording')
        }
        
        // Reset state
        mediaRecorderRef.current = null
      }
      
      setIsRecording(false)
      setMode(null)
      setRecordingTime(0)
      setIsProcessing(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save recording'
      setError(errorMessage)
      setIsRecording(false)
      setMode(null)
      setRecordingTime(0)
      setIsProcessing(false)
    }
  }
  
  const handleCancelPicker = () => {
    setShowSourcePicker(false)
    setMode(null)
  }
  
  return (
    <>
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isRecording && !isProcessing && (
              <>
                <button
                  onClick={handleStartScreenRecording}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                  title="Record screen"
                >
                  <Monitor className="w-5 h-5" />
                  <span>Screen</span>
                </button>
                
                <button
                  onClick={handleStartWebcamRecording}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
                  title="Record webcam"
                >
                  <Video className="w-5 h-5" />
                  <span>Webcam</span>
                </button>
                
                <button
                  onClick={handleStartBothRecording}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
                  title="Record screen and webcam simultaneously (PiP)"
                >
                  <Combine className="w-5 h-5" />
                  <span>Both (PiP)</span>
                </button>
              </>
            )}
            
            {isProcessing && (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Starting recording...</span>
              </div>
            )}
            
            {isRecording && (
              <>
                <div className="flex items-center gap-2 text-red-500 animate-pulse">
                  <Circle className="w-5 h-5 fill-current" />
                  <span className="font-semibold">Recording {mode}</span>
                </div>
                
                <div className="text-white font-mono text-lg">
                  {formatRecordingTime(recordingTime)}
                </div>
                
                <button
                  onClick={handleStopRecording}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                  title="Stop recording"
                >
                  <Square className="w-5 h-5" />
                  <span>Stop</span>
                </button>
              </>
            )}
          </div>
          
          {/* Preview section */}
          {mode === 'webcam' && webcamStreamRef.current && (
            <div className="relative">
              <video
                ref={previewVideoRef}
                autoPlay
                muted
                className="w-40 h-24 bg-black rounded border border-gray-600"
              />
              {isRecording && (
                <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
          )}
          
          {/* Both mode previews */}
          {mode === 'both' && webcamStreamRef.current && (
            <div className="flex gap-3 items-center">
              <div className="text-gray-400 text-sm">
                <Monitor className="w-4 h-4 inline mr-1" />
                Screen
              </div>
              <div className="relative">
                <video
                  ref={previewVideoRef}
                  autoPlay
                  muted
                  className="w-40 h-24 bg-black rounded border border-gray-600"
                />
                {isRecording && (
                  <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
                <div className="absolute bottom-1 left-1 text-xs text-white bg-black/70 px-2 py-0.5 rounded">
                  Webcam
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Source picker modal */}
      {showSourcePicker && (
        <SourcePicker 
          onSelectSource={handleSourceSelected}
          onCancel={handleCancelPicker}
        />
      )}
      
      {/* Error toast */}
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
      
      {/* Success toast */}
      {success && (
        <Toast
          message={success}
          type="success"
          onClose={() => setSuccess(null)}
        />
      )}
    </>
  )
}

