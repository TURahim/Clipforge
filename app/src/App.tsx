import { useEffect } from 'react'
import MediaLibrary from './components/MediaLibrary'
import ExportControls from './components/ExportControls'
import Timeline from './components/Timeline'
import VideoPlayer from './components/VideoPlayer'
import { RecordingControls } from './components/RecordingControls'
import { useStore } from './store/useStore'

function App() {
  const isPlaying = useStore((state) => state.isPlaying)
  const setPlaying = useStore((state) => state.setPlaying)
  const selectedClipId = useStore((state) => state.selectedClipId)
  const deleteClip = useStore((state) => state.deleteClip)
  const splitClipAtPlayhead = useStore((state) => state.splitClipAtPlayhead)
  const zoomIn = useStore((state) => state.zoomIn)
  const zoomOut = useStore((state) => state.zoomOut)
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }
      
      // Space = play/pause
      if (e.code === 'Space') {
        e.preventDefault()
        setPlaying(!isPlaying)
      }
      
      // S = split clip at playhead
      if ((e.code === 'KeyS') && selectedClipId) {
        e.preventDefault()
        splitClipAtPlayhead(selectedClipId)
      }
      
      // Delete/Backspace = delete selected clip from timeline
      if ((e.code === 'Delete' || e.code === 'Backspace') && selectedClipId) {
        e.preventDefault()
        deleteClip(selectedClipId)
      }
      
      // + or = key = zoom in
      if (e.code === 'Equal' || e.code === 'NumpadAdd') {
        e.preventDefault()
        zoomIn()
      }
      
      // - or _ key = zoom out
      if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
        e.preventDefault()
        zoomOut()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying, selectedClipId, setPlaying, splitClipAtPlayhead, deleteClip, zoomIn, zoomOut])
  
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">ClipForge</h1>
          <p className="text-xs text-gray-400">Video Editor MVP</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-500">
            <span className="font-mono bg-gray-700 px-2 py-1 rounded">Space</span> Play/Pause •
            <span className="font-mono bg-gray-700 px-2 py-1 rounded ml-2">S</span> Split •
            <span className="font-mono bg-gray-700 px-2 py-1 rounded ml-2">Del</span> Delete •
            <span className="font-mono bg-gray-700 px-2 py-1 rounded ml-2">+/-</span> Zoom
          </div>
          <div className="text-sm text-gray-400">
            PR #16: Timeline Zoom & Snap ✓
          </div>
        </div>
      </header>

      {/* Recording Controls */}
      <RecordingControls />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Media Library Sidebar */}
        <div className="w-80">
          <MediaLibrary />
        </div>

        {/* Main Area (Timeline + Player) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Video Player */}
          <div className="flex-1 min-h-0">
            <VideoPlayer />
          </div>

          {/* Timeline */}
          <div className="h-48 bg-gray-800 border-t border-gray-700 flex-shrink-0">
            <Timeline />
          </div>

          {/* Export Controls */}
          <div className="flex-shrink-0">
            <ExportControls />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
