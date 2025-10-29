import { Scissors, Trash2, ZoomIn, ZoomOut, Grid3x3 } from 'lucide-react'
import { useStore } from '../store/useStore'

export function TimelineToolbar() {
  const selectedClipId = useStore((state) => state.selectedClipId)
  const splitClipAtPlayhead = useStore((state) => state.splitClipAtPlayhead)
  const deleteClip = useStore((state) => state.deleteClip)
  const timelineClips = useStore((state) => state.timelineClips)
  const playheadPosition = useStore((state) => state.playheadPosition)
  const zoomLevel = useStore((state) => state.zoomLevel)
  const snapEnabled = useStore((state) => state.snapEnabled)
  const setZoomLevel = useStore((state) => state.setZoomLevel)
  const zoomIn = useStore((state) => state.zoomIn)
  const zoomOut = useStore((state) => state.zoomOut)
  const toggleSnap = useStore((state) => state.toggleSnap)
  
  const selectedClip = timelineClips.find((c) => c.id === selectedClipId)
  
  // Check if playhead is within the selected clip
  const canSplit = selectedClip && 
    playheadPosition > selectedClip.startTime && 
    playheadPosition < selectedClip.startTime + (selectedClip.trimEnd - selectedClip.trimStart)
  
  const handleSplit = () => {
    if (selectedClipId && canSplit) {
      splitClipAtPlayhead(selectedClipId)
    }
  }
  
  const handleDelete = () => {
    if (selectedClipId) {
      deleteClip(selectedClipId)
    }
  }
  
  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center gap-2">
      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mr-3">
        Timeline Tools
      </div>
      
      <button
        onClick={handleSplit}
        disabled={!canSplit}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded transition text-sm
          ${canSplit
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }
        `}
        title={canSplit ? 'Split clip at playhead (S)' : 'Move playhead within a clip to split'}
      >
        <Scissors className="w-4 h-4" />
        <span>Split</span>
        <span className="text-xs opacity-75">S</span>
      </button>
      
      <button
        onClick={handleDelete}
        disabled={!selectedClipId}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded transition text-sm
          ${selectedClipId
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }
        `}
        title={selectedClipId ? 'Delete selected clip (Del)' : 'Select a clip to delete'}
      >
        <Trash2 className="w-4 h-4" />
        <span>Delete</span>
        <span className="text-xs opacity-75">Del</span>
      </button>
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Zoom Controls */}
      <div className="flex items-center gap-2 border-l border-gray-700 pl-4 ml-4">
        <button
          onClick={zoomOut}
          disabled={zoomLevel <= 0.25}
          className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4 text-gray-300" />
        </button>
        
        <input
          type="range"
          min="0.25"
          max="4"
          step="0.25"
          value={zoomLevel}
          onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
          className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          title="Zoom Level"
        />
        
        <button
          onClick={zoomIn}
          disabled={zoomLevel >= 4.0}
          className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4 text-gray-300" />
        </button>
        
        <span className="text-xs text-gray-400 font-mono w-12 text-center">
          {Math.round(zoomLevel * 100)}%
        </span>
        
        <button
          onClick={toggleSnap}
          className={`
            p-1.5 rounded transition
            ${snapEnabled
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-400'
            }
          `}
          title={snapEnabled ? 'Snap Enabled' : 'Snap Disabled'}
        >
          <Grid3x3 className="w-4 h-4" />
        </button>
      </div>
      
      {selectedClip && (
        <div className="text-sm text-gray-400 border-l border-gray-700 pl-4 ml-4">
          Selected: <span className="text-white font-medium">{selectedClip.filename}</span>
        </div>
      )}
    </div>
  )
}

