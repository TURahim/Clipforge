import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import ProgressBar from './ui/ProgressBar'
import Toast from './ui/Toast'

interface ToastState {
  message: string
  type: 'success' | 'error' | 'info'
}

export default function ExportControls() {
  const timelineClips = useStore((state) => state.timelineClips)
  const exportProgress = useStore((state) => state.exportProgress)
  const setExportProgress = useStore((state) => state.setExportProgress)
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = (message: string, type: ToastState['type']) => {
    setToast({ message, type })
  }

  // Listen for export progress updates
  useEffect(() => {
    // Check if electron API is available
    if (!window.electron) {
      console.warn('Electron API not available')
      return
    }

    const handleProgress = (data: {
      percentage: number
      currentTime: number
      totalDuration: number
    }) => {
      setExportProgress({
        percentage: data.percentage,
        currentTime: data.currentTime,
        totalDuration: data.totalDuration,
      })
    }

    try {
      window.electron.on('export-progress', handleProgress)

      return () => {
        if (window.electron?.removeListener) {
          window.electron.removeListener('export-progress', handleProgress)
        }
      }
    } catch (error) {
      console.error('Failed to set up export progress listener:', error)
    }
  }, [setExportProgress])

  const handleExport = async () => {
    if (timelineClips.length === 0) {
      showToast('No clips on timeline to export', 'error')
      return
    }

    try {
      // Show save dialog
      const saveResult = await window.electron.invoke('save-file-dialog')

      if (!saveResult.success) {
        return // User canceled
      }

      // Start export
      setExportProgress({
        isExporting: true,
        percentage: 0,
        currentTime: 0,
        totalDuration: timelineClips.reduce(
          (sum, clip) => sum + (clip.trimEnd - clip.trimStart),
          0
        ),
      })

      const exportResult = await window.electron.invoke(
        'export-video',
        timelineClips,
        saveResult.filePath
      )

      if (exportResult.success) {
        showToast('Export completed successfully!', 'success')
        setExportProgress({
          isExporting: false,
          percentage: 100,
        })
      } else {
        showToast(exportResult.error || 'Export failed', 'error')
        setExportProgress({
          isExporting: false,
          percentage: 0,
        })
      }
    } catch (error) {
      showToast(
        `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      )
      setExportProgress({
        isExporting: false,
        percentage: 0,
      })
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const totalDuration = timelineClips.reduce(
    (sum, clip) => sum + (clip.trimEnd - clip.trimStart),
    0
  )

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-6">
          {/* Timeline Info */}
          <div className="flex-1">
            <div className="text-sm text-gray-400 mb-1">
              {timelineClips.length} clip{timelineClips.length !== 1 ? 's' : ''} on timeline
            </div>
            <div className="text-lg font-semibold">
              Duration: {formatTime(totalDuration)}
            </div>
          </div>

          {/* Export Progress */}
          {exportProgress.isExporting && (
            <div className="flex-1">
              <ProgressBar
                percentage={exportProgress.percentage}
                label={`Exporting... ${formatTime(exportProgress.currentTime)} / ${formatTime(exportProgress.totalDuration)}`}
              />
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={timelineClips.length === 0 || exportProgress.isExporting}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-8 rounded-lg font-semibold transition-colors"
          >
            {exportProgress.isExporting ? 'Exporting...' : 'Export Video'}
          </button>
        </div>
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

