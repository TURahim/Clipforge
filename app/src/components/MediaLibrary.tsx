import { useState } from 'react'
import { useStore } from '../store/useStore'
import Toast from './ui/Toast'
import type { Clip } from '../types'

interface ToastState {
  message: string
  type: 'success' | 'error' | 'info'
}

export default function MediaLibrary() {
  const clips = useStore((state) => state.clips)
  const addClip = useStore((state) => state.addClip)
  const addToTimeline = useStore((state) => state.addToTimeline)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const showToast = (message: string, type: ToastState['type']) => {
    setToast({ message, type })
  }

  const importVideo = async (filePath: string) => {
    setIsImporting(true)

    try {
      const result = await window.electron.invoke('import-video', filePath)

      if (!result.success) {
        showToast(result.error || 'Failed to import video', 'error')
        return
      }

      // Create clip object
      const clip: Clip = {
        id: `clip-${Date.now()}`,
        filePath: result.data.filePath,
        filename: result.data.filePath.split('/').pop() || 'Unknown',
        duration: result.data.metadata.duration,
        thumbnail: result.data.thumbnail,
        metadata: result.data.metadata,
      }

      addClip(clip)
      showToast(`Imported ${clip.filename}`, 'success')
    } catch (error) {
      showToast(
        `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      )
    } finally {
      setIsImporting(false)
    }
  }

  const handleImportClick = async () => {
    console.log('Import button clicked')
    
    if (!window.electron) {
      showToast('Electron API not available', 'error')
      console.error('window.electron is not defined')
      return
    }

    console.log('Calling open-file-dialog...')
    try {
      const result = await window.electron.invoke('open-file-dialog')
      console.log('Dialog result:', result)

      if (result.success && result.filePath) {
        await importVideo(result.filePath)
      } else if (result.error && !result.error.includes('No file selected')) {
        showToast(result.error, 'error')
      }
    } catch (error) {
      showToast(
        `Failed to open file dialog: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      )
      console.error('File dialog error:', error)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)

    for (const file of files) {
      if (file.type.startsWith('video/')) {
        await importVideo(file.path)
      } else {
        showToast(
          `"${file.name}" is not a video file`,
          'error'
        )
      }
    }
  }

  const handleAddToTimeline = (clip: Clip) => {
    addToTimeline(clip)
    showToast(`Added "${clip.filename}" to timeline`, 'success')
  }

  const handleDragStart = (e: React.DragEvent, clip: Clip) => {
    console.log('[MediaLibrary] Drag started for:', clip.filename)
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('application/clipforge-clip', JSON.stringify(clip))
    e.dataTransfer.setData('text/plain', clip.filename)
    console.log('[MediaLibrary] Drag data set successfully')
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="h-full bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold mb-3">Media Library</h2>
        <button
          onClick={handleImportClick}
          disabled={isImporting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
          title="Import video file (MP4, MOV, AVI, MKV, WEBM)"
        >
          {isImporting ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Importing...
            </>
          ) : '+ Import Video'}
        </button>
      </div>

      {/* Drop Zone / Clips List */}
      <div
        className="flex-1 overflow-y-auto p-4"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="border-2 border-dashed border-blue-500 bg-blue-500/10 rounded-lg p-8 text-center mb-4">
            <p className="text-blue-400 text-lg">Drop video files here</p>
          </div>
        )}

        {clips.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p className="mb-2">No clips imported</p>
            <p className="text-sm">
              Click "Import Video" or drag files here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {clips.map((clip) => (
              <div
                key={clip.id}
                draggable
                onDragStart={(e) => handleDragStart(e, clip)}
                className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors cursor-grab active:cursor-grabbing group"
                onClick={() => handleAddToTimeline(clip)}
              >
                {/* Thumbnail */}
                {clip.thumbnail && (
                  <div className="aspect-video bg-black">
                    <img
                      src={clip.thumbnail}
                      alt={clip.filename}
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium truncate mb-1">
                    {clip.filename}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{formatTime(clip.duration)}</span>
                    {clip.metadata && (
                      <span>
                        {clip.metadata.width}×{clip.metadata.height}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click or drag to timeline
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  )
}

