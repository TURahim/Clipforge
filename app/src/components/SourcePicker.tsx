import { useEffect, useState } from 'react'
import type { DesktopSource } from '../utils/recording'

interface SourcePickerProps {
  onSelectSource: (sourceId: string) => void
  onCancel: () => void
}

export function SourcePicker({ onSelectSource, onCancel }: SourcePickerProps) {
  const [sources, setSources] = useState<DesktopSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  
  useEffect(() => {
    loadSources()
  }, [])
  
  const loadSources = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await window.electron.invoke('get-desktop-sources') as { 
        success: boolean
        sources?: DesktopSource[]
        error?: string 
      }
      
      if (!result.success || !result.sources) {
        throw new Error(result.error || 'Failed to get desktop sources')
      }
      
      setSources(result.sources)
      
      // Auto-select first screen source
      const firstScreen = result.sources.find(s => s.id.startsWith('screen'))
      if (firstScreen) {
        setSelectedId(firstScreen.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sources')
      console.error('[SourcePicker] Error loading sources:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSelect = () => {
    if (selectedId) {
      onSelectSource(selectedId)
    }
  }
  
  // Separate screens and windows
  const screens = sources.filter(s => s.id.startsWith('screen'))
  const windows = sources.filter(s => !s.id.startsWith('screen'))
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Select Screen or Window</h2>
          <p className="text-gray-400 mt-1">Choose what you want to record</p>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-4 text-gray-400">Loading sources...</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={loadSources}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
              >
                Try Again
              </button>
            </div>
          )}
          
          {!loading && !error && (
            <>
              {/* Screens */}
              {screens.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Screens</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {screens.map(source => (
                      <button
                        key={source.id}
                        onClick={() => setSelectedId(source.id)}
                        className={`
                          relative rounded-lg overflow-hidden border-2 transition
                          ${selectedId === source.id 
                            ? 'border-blue-500 ring-2 ring-blue-500/50' 
                            : 'border-gray-700 hover:border-gray-600'
                          }
                        `}
                      >
                        <img 
                          src={source.thumbnail} 
                          alt={source.name}
                          className="w-full h-auto"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <p className="text-white text-sm font-medium truncate">
                            {source.name}
                          </p>
                        </div>
                        {selectedId === source.id && (
                          <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Windows */}
              {windows.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Windows</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {windows.map(source => (
                      <button
                        key={source.id}
                        onClick={() => setSelectedId(source.id)}
                        className={`
                          relative rounded-lg overflow-hidden border-2 transition
                          ${selectedId === source.id 
                            ? 'border-blue-500 ring-2 ring-blue-500/50' 
                            : 'border-gray-700 hover:border-gray-600'
                          }
                        `}
                      >
                        <img 
                          src={source.thumbnail} 
                          alt={source.name}
                          className="w-full h-auto"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          {source.appIcon && (
                            <img 
                              src={source.appIcon} 
                              alt=""
                              className="w-5 h-5 mb-1"
                            />
                          )}
                          <p className="text-white text-sm font-medium truncate">
                            {source.name}
                          </p>
                        </div>
                        {selectedId === source.id && (
                          <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedId}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Recording
          </button>
        </div>
      </div>
    </div>
  )
}

