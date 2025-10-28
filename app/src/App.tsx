import MediaLibrary from './components/MediaLibrary'
import ExportControls from './components/ExportControls'
import Timeline from './components/Timeline'

function App() {
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">ClipForge</h1>
          <p className="text-xs text-gray-400">Video Editor MVP</p>
        </div>
        <div className="text-sm text-gray-400">
          PR #4: Timeline UI ✓
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Media Library Sidebar */}
        <div className="w-80">
          <MediaLibrary />
        </div>

        {/* Main Area (Timeline + Player will go here) */}
        <div className="flex-1 flex flex-col">
          {/* Placeholder for Video Player */}
          <div className="flex-1 bg-black flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">Video Player</p>
              <p className="text-sm">(Coming in PR #5)</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="h-48 bg-gray-800 border-t border-gray-700">
            <Timeline />
          </div>

          {/* Export Controls */}
          <ExportControls />
        </div>
      </div>
    </div>
  )
}

export default App
