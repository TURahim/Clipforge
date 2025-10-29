import { Scissors, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'

export function TimelineToolbar() {
  const selectedClipId = useStore((state) => state.selectedClipId)
  const splitClipAtPlayhead = useStore((state) => state.splitClipAtPlayhead)
  const deleteClip = useStore((state) => state.deleteClip)
  const timelineClips = useStore((state) => state.timelineClips)
  const playheadPosition = useStore((state) => state.playheadPosition)
  
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
      
      {selectedClip && (
        <div className="ml-auto text-sm text-gray-400">
          Selected: <span className="text-white font-medium">{selectedClip.filename}</span>
        </div>
      )}
    </div>
  )
}

