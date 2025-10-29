import { useState, useRef, useEffect } from 'react'
import { Monitor, Video, Circle, Square, Loader2 } from 'lucide-react'
import { SourcePicker } from './SourcePicker'
import { startScreenRecording, startWebcamRecording, stopRecording, saveRecording, formatRecordingTime } from '../utils/recording'
import { useStore } from '../store/useStore'
import Toast from './ui/Toast'

type RecordingMode = 'screen' | 'webcam' | null

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
  const webcamStreamRef = useRef<MediaStream | null>(null)
  const previewVideoRef = useRef<HTMLVideoElement>(null)
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
      
      const mediaRecorder = await startScreenRecording(sourceId)
      
      mediaRecorderRef.current = mediaRecorder
      
      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
      startTimer()
      setIsProcessing(false)
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
          
          {/* Webcam preview */}
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

