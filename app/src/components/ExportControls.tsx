import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { Scissors, RotateCcw } from 'lucide-react'
import ProgressBar from './ui/ProgressBar'
import Toast from './ui/Toast'
import { RESOLUTION_PRESETS } from '../utils/resolutionPresets'

interface ToastState {
  message: string
  type: 'success' | 'error' | 'info'
}

export default function ExportControls() {
  const timelineClips = useStore((state) => state.timelineClips)
  const selectedClipId = useStore((state) => state.selectedClipId)
  const playheadPosition = useStore((state) => state.playheadPosition)
  const exportProgress = useStore((state) => state.exportProgress)
  const setExportProgress = useStore((state) => state.setExportProgress)
  const updateClipTrim = useStore((state) => state.updateClipTrim)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [selectedResolution, setSelectedResolution] = useState<string>('source')
  
  const selectedClip = timelineClips.find(c => c.id === selectedClipId)
  
  // Debug: Log selectedClip changes
  useEffect(() => {
    console.log('[ExportControls] selectedClip changed:', { 
      selectedClipId, 
      selectedClip: selectedClip ? { id: selectedClip.id, filename: selectedClip.filename } : null,
      timelineClipsCount: timelineClips.length 
    })
  }, [selectedClipId, selectedClip, timelineClips.length])

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

    const handleProgress = (data: unknown) => {
      const progressData = data as {
        percentage: number
        currentTime: number
        totalDuration: number
      }
      setExportProgress({
        percentage: progressData.percentage,
        currentTime: progressData.currentTime,
        totalDuration: progressData.totalDuration,
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
      const saveResult = await window.electron.invoke('save-file-dialog') as {
        success: boolean
        filePath?: string
      }

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

      // Get resolution preset
      const resolutionPreset = RESOLUTION_PRESETS.find(p => p.value === selectedResolution)
      
      const exportResult = await window.electron.invoke(
        'export-video',
        timelineClips,
        saveResult.filePath,
        resolutionPreset
      ) as { success: boolean; error?: string }

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
  
  const handleSetInPoint = () => {
    console.log('[ExportControls] handleSetInPoint called:', { 
      selectedClip, 
      playheadPosition, 
      selectedClipId 
    })
    
    if (!selectedClip) {
      console.warn('[ExportControls] No selected clip for Set In')
      showToast('No clip selected', 'error')
      return
    }
    
    // Calculate the time within the selected clip
    const clipLocalTime = playheadPosition - selectedClip.startTime
    const newTrimStart = Math.max(0, Math.min(clipLocalTime, selectedClip.trimEnd - 0.5))
    
    console.log('[ExportControls] Setting in-point:', {
      clipLocalTime,
      newTrimStart,
      currentTrimStart: selectedClip.trimStart,
      currentTrimEnd: selectedClip.trimEnd
    })
    
    updateClipTrim(selectedClip.id, newTrimStart, selectedClip.trimEnd)
    showToast('In-point set', 'success')
  }
  
  const handleSetOutPoint = () => {
    console.log('[ExportControls] handleSetOutPoint called:', { 
      selectedClip, 
      playheadPosition, 
      selectedClipId 
    })
    
    if (!selectedClip) {
      console.warn('[ExportControls] No selected clip for Set Out')
      showToast('No clip selected', 'error')
      return
    }
    
    const clipLocalTime = playheadPosition - selectedClip.startTime
    const newTrimEnd = Math.max(selectedClip.trimStart + 0.5, Math.min(clipLocalTime, selectedClip.duration))
    
    console.log('[ExportControls] Setting out-point:', {
      clipLocalTime,
      newTrimEnd,
      currentTrimStart: selectedClip.trimStart,
      currentTrimEnd: selectedClip.trimEnd
    })
    
    updateClipTrim(selectedClip.id, selectedClip.trimStart, newTrimEnd)
    showToast('Out-point set', 'success')
  }
  
  const handleResetTrim = () => {
    console.log('[ExportControls] handleResetTrim called:', { selectedClip, selectedClipId })
    
    if (!selectedClip) {
      console.warn('[ExportControls] No selected clip for Reset Trim')
      showToast('No clip selected', 'error')
      return
    }
    
    updateClipTrim(selectedClip.id, 0, selectedClip.duration)
    showToast('Trim reset to full clip', 'success')
  }

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Trim Controls - Show when clip is selected */}
        {selectedClip && (
          <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <div className="flex items-center justify-between gap-6">
              {/* Clip Info */}
              <div className="flex-1">
                <div className="text-xs text-gray-400 mb-1">Selected Clip</div>
                <div className="font-semibold text-white mb-1">{selectedClip.filename}</div>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2 text-gray-300">
                    <span className="text-gray-400">Original:</span>
                    <span>{formatTime(selectedClip.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-400">
                    <Scissors className="w-3 h-3" />
                    <span className="text-gray-400">Trimmed:</span>
                    <span className="font-semibold">{formatTime(selectedClip.trimEnd - selectedClip.trimStart)}</span>
                    {(selectedClip.trimStart > 0 || selectedClip.trimEnd < selectedClip.duration) && (
                      <span className="text-xs text-gray-500">
                        ({formatTime(selectedClip.trimStart)} - {formatTime(selectedClip.trimEnd)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Trim Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSetInPoint}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium"
                  title="Set trim in-point at playhead position"
                >
                  <span>[ Set In</span>
                </button>
                <button
                  onClick={handleSetOutPoint}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium"
                  title="Set trim out-point at playhead position"
                >
                  <span>Set Out ]</span>
                </button>
                <button
                  onClick={handleResetTrim}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors text-sm"
                  title="Reset trim to full clip"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Export Controls */}
        <div className="flex items-center justify-between gap-6">
          {/* Timeline Info */}
          <div className="flex-1">
            <div className="text-sm text-gray-400 mb-1">
              {timelineClips.length} clip{timelineClips.length !== 1 ? 's' : ''} on timeline
            </div>
            <div className="text-lg font-semibold">
              Total Duration: {formatTime(totalDuration)}
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

          {/* Resolution Selection */}
          {!exportProgress.isExporting && (
            <div className="flex flex-col gap-1">
              <label htmlFor="resolution-select" className="text-xs text-gray-400">
                Export Resolution
              </label>
              <select
                id="resolution-select"
                value={selectedResolution}
                onChange={(e) => setSelectedResolution(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {RESOLUTION_PRESETS.map(preset => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
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

