import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { VideoController } from '../utils/VideoController'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { formatTime } from '../utils/timelineUtils'
import type { TimelineClip, Caption } from '../types'

export default function VideoPlayer() {
  // Video element refs for both tracks
  const mainVideoRef = useRef<HTMLVideoElement>(null)
  const overlayVideoRef = useRef<HTMLVideoElement>(null)
  const mainControllerRef = useRef<VideoController>()
  const overlayControllerRef = useRef<VideoController>()
  
  const timelineClips = useStore((state) => state.timelineClips)
  const playheadPosition = useStore((state) => state.playheadPosition)
  const isPlaying = useStore((state) => state.isPlaying)
  const setPlayheadPosition = useStore((state) => state.setPlayheadPosition)
  const setPlaying = useStore((state) => state.setPlaying)
  
  // Use ref to track playing state for callbacks (avoid stale closures)
  const isPlayingRef = useRef(isPlaying)
  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])
  
  // Track currently loaded clips for each track
  const [currentMainClip, setCurrentMainClip] = useState<string | null>(null) // clip.id
  const [currentOverlayClip, setCurrentOverlayClip] = useState<string | null>(null) // clip.id
  const [volume, setVolume] = useState<number>(1)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [currentMainCaption, setCurrentMainCaption] = useState<Caption | null>(null)
  const [currentOverlayCaption, setCurrentOverlayCaption] = useState<Caption | null>(null)
  
  // Debug: Track overlay clip state changes
  useEffect(() => {
    console.log('[VideoPlayer] 🎬 currentOverlayClip changed to:', currentOverlayClip)
  }, [currentOverlayClip])

  // Helper function to get active clip for a specific track at current playhead position
  const getActiveClipForTrack = useCallback((track: number, position: number) => {
    const clipsOnTrack = timelineClips.filter(c => c.track === track)
    for (const clip of clipsOnTrack) {
      const clipEnd = clip.startTime + (clip.trimEnd - clip.trimStart)
      if (position >= clip.startTime && position < clipEnd) {
        return clip
      }
    }
    return null
  }, [timelineClips])

  // Initialize VideoControllers for both tracks
  useEffect(() => {
    if (mainVideoRef.current && !mainControllerRef.current) {
      mainControllerRef.current = new VideoController(mainVideoRef.current)
    }
    
    if (overlayVideoRef.current && !overlayControllerRef.current) {
      overlayControllerRef.current = new VideoController(overlayVideoRef.current)
    }
    
    return () => {
      if (mainControllerRef.current) {
        mainControllerRef.current.destroy()
        mainControllerRef.current = undefined
      }
      if (overlayControllerRef.current) {
        overlayControllerRef.current.destroy()
        overlayControllerRef.current = undefined
      }
    }
  }, [])
  
  // Register callbacks for main video (drives playhead position)
  useEffect(() => {
    if (!mainControllerRef.current) return
    
    // Main video updates playhead position
    mainControllerRef.current.onUpdate((time) => {
      const mainClip = getActiveClipForTrack(0, playheadPosition)
      if (mainClip && mainClip.id === currentMainClip) {
        // Calculate global timeline position from video time
        const clipLocalTime = time - mainClip.trimStart
        const globalTime = mainClip.startTime + clipLocalTime
        setPlayheadPosition(globalTime)
        
        // Stop playback if we've reached the clip's trim end
        if (time >= mainClip.trimEnd) {
          const nextClip = getActiveClipForTrack(0, globalTime + 0.1)
          if (!nextClip) {
            console.log('[VideoPlayer] Main track ended')
            setPlaying(false)
          }
        }
      }
    })
    
    mainControllerRef.current.onEnded(() => {
      console.log('[VideoPlayer] Main video ended')
      // Check if there's another clip ahead
      const nextClip = getActiveClipForTrack(0, playheadPosition + 0.1)
      if (!nextClip) {
        setPlaying(false)
      }
    })
  }, [currentMainClip, playheadPosition, setPlayheadPosition, setPlaying, getActiveClipForTrack])
  
  // Register callbacks for overlay video (follows playhead)
  useEffect(() => {
    if (!overlayControllerRef.current) return
    
    // Overlay video doesn't update playhead, just handles its own ended event
    overlayControllerRef.current.onUpdate(() => {
      // No-op: overlay follows main track's playhead
    })
    
    overlayControllerRef.current.onEnded(() => {
      console.log('[VideoPlayer] Overlay video ended')
      // Overlay ending doesn't stop playback
    })
  }, [currentOverlayClip])

  // Load a clip into the main video player
  const loadMainClip = useCallback(async (clip: TimelineClip) => {
    if (!mainControllerRef.current) return
    
    try {
      console.log('[VideoPlayer] Loading main clip:', clip.filename)
      const videoUrl = `clipforge://video/${encodeURIComponent(clip.filePath)}`
      await mainControllerRef.current.load(videoUrl)
      
      // Calculate video time from playhead position
      const clipLocalPosition = playheadPosition - clip.startTime
      const videoTime = clip.trimStart + clipLocalPosition
      
      await new Promise(resolve => setTimeout(resolve, 50))
      mainControllerRef.current.seek(Math.max(clip.trimStart, Math.min(clip.trimEnd, videoTime)))
      
      setCurrentMainClip(clip.id)
      
      if (isPlayingRef.current) {
        await mainControllerRef.current.play()
      }
      
      console.log('[VideoPlayer] Main clip loaded:', clip.filename)
    } catch (err) {
      console.error('[VideoPlayer] Failed to load main clip:', err)
      setError('Failed to load video clip')
    }
  }, [playheadPosition])
  
  // Load a clip into the overlay video player
  const loadOverlayClip = useCallback(async (clip: TimelineClip) => {
    if (!overlayControllerRef.current) {
      console.warn('[VideoPlayer] No overlay controller ref!')
      return
    }
    
    try {
      console.log('[VideoPlayer] Loading overlay clip:', clip.filename)
      const videoUrl = `clipforge://video/${encodeURIComponent(clip.filePath)}`
      await overlayControllerRef.current.load(videoUrl)
      
      // Calculate video time from playhead position
      const clipLocalPosition = playheadPosition - clip.startTime
      const videoTime = clip.trimStart + clipLocalPosition
      
      await new Promise(resolve => setTimeout(resolve, 50))
      overlayControllerRef.current.seek(Math.max(clip.trimStart, Math.min(clip.trimEnd, videoTime)))
      
      console.log('[VideoPlayer] Setting currentOverlayClip to:', clip.id)
      setCurrentOverlayClip(clip.id)
      
      if (isPlayingRef.current) {
        console.log('[VideoPlayer] Auto-playing overlay')
        await overlayControllerRef.current.play()
      }
      
      console.log('[VideoPlayer] Overlay clip loaded successfully:', clip.filename)
    } catch (err) {
      console.error('[VideoPlayer] Failed to load overlay clip:', err)
    }
  }, [playheadPosition])

  // Sync both videos with playhead position changes
  useEffect(() => {
    if (timelineClips.length === 0) return
    
    // Debug: Log all clips and their tracks
    console.log('[VideoPlayer] Syncing at playhead:', playheadPosition)
    console.log('[VideoPlayer] Timeline clips:', timelineClips.map(c => ({ id: c.id, track: c.track, startTime: c.startTime, filename: c.filename })))
    
    // Determine active clips for both tracks at current playhead
    const mainClip = getActiveClipForTrack(0, playheadPosition)
    const overlayClip = getActiveClipForTrack(1, playheadPosition)
    
    console.log('[VideoPlayer] Active clips - Main:', mainClip?.filename, 'Overlay:', overlayClip?.filename)
    
    // Handle main track
    if (mainClip) {
      if (mainClip.id !== currentMainClip) {
        // Load new main clip
        console.log('[VideoPlayer] Loading new main clip at playhead:', mainClip.filename)
        loadMainClip(mainClip)
      } else if (mainControllerRef.current) {
        // Update seek position for current clip
        const clipLocalPosition = playheadPosition - mainClip.startTime
        const videoTime = mainClip.trimStart + clipLocalPosition
        const currentVideoTime = mainControllerRef.current.getCurrentTime()
        
        if (Math.abs(currentVideoTime - videoTime) > 0.1) {
          mainControllerRef.current.seek(videoTime)
        }
      }
    } else if (currentMainClip) {
      // No main clip at playhead, clear it
      console.log('[VideoPlayer] No main clip at playhead, clearing')
      setCurrentMainClip(null)
      if (mainVideoRef.current) {
        mainVideoRef.current.src = ''
      }
    }
    
    // Handle overlay track
    if (overlayClip) {
      if (overlayClip.id !== currentOverlayClip) {
        // Load new overlay clip
        console.log('[VideoPlayer] Loading new overlay clip at playhead:', overlayClip.filename)
        loadOverlayClip(overlayClip)
      } else if (overlayControllerRef.current) {
        // Update seek position for current clip
        const clipLocalPosition = playheadPosition - overlayClip.startTime
        const videoTime = overlayClip.trimStart + clipLocalPosition
        const currentVideoTime = overlayControllerRef.current.getCurrentTime()
        
        if (Math.abs(currentVideoTime - videoTime) > 0.1) {
          overlayControllerRef.current.seek(videoTime)
        }
      }
    } else if (currentOverlayClip) {
      // No overlay clip at playhead, clear it
      console.log('[VideoPlayer] No overlay clip at playhead, clearing')
      setCurrentOverlayClip(null)
      if (overlayVideoRef.current) {
        overlayVideoRef.current.src = ''
      }
    }
  }, [playheadPosition, timelineClips, currentMainClip, currentOverlayClip, getActiveClipForTrack, loadMainClip, loadOverlayClip])

  // Handle play/pause state changes for both tracks
  useEffect(() => {
    if (isPlaying) {
      // Play both videos if they're loaded
      if (mainControllerRef.current && currentMainClip) {
        mainControllerRef.current.play().catch((err) => {
          console.error('[VideoPlayer] Failed to play main:', err)
          setPlaying(false)
        })
      }
      
      if (overlayControllerRef.current && currentOverlayClip) {
        overlayControllerRef.current.play().catch((err) => {
          console.error('[VideoPlayer] Failed to play overlay:', err)
        })
      }
    } else {
      // Pause both videos
      if (mainControllerRef.current) {
        mainControllerRef.current.pause()
      }
      
      if (overlayControllerRef.current) {
        overlayControllerRef.current.pause()
      }
    }
  }, [isPlaying, currentMainClip, currentOverlayClip, setPlaying])

  // Reset players when timeline becomes empty
  useEffect(() => {
    if (timelineClips.length === 0) {
      console.log('[VideoPlayer] Timeline empty, resetting both players')
      setCurrentMainClip(null)
      setCurrentOverlayClip(null)
      setPlaying(false)
      setError(null)
      
      // Clear both video sources
      if (mainVideoRef.current) {
        mainVideoRef.current.src = ''
        mainVideoRef.current.load()
      }
      
      if (overlayVideoRef.current) {
        overlayVideoRef.current.src = ''
        overlayVideoRef.current.load()
      }
      
      // Pause both controllers
      if (mainControllerRef.current) {
        mainControllerRef.current.pause()
      }
      
      if (overlayControllerRef.current) {
        overlayControllerRef.current.pause()
      }
    }
  }, [timelineClips.length, setPlaying])

  // Handle volume changes for both videos
  useEffect(() => {
    const volumeLevel = isMuted ? 0 : volume
    
    if (mainControllerRef.current) {
      mainControllerRef.current.setVolume(volumeLevel)
    }
    
    if (overlayControllerRef.current) {
      overlayControllerRef.current.setVolume(volumeLevel)
    }
  }, [volume, isMuted])

  // Sync main track captions with playhead position
  useEffect(() => {
    if (!currentMainClip) {
      setCurrentMainCaption(null)
      return
    }
    
    const clip = timelineClips.find(c => c.id === currentMainClip)
    if (!clip?.captions || clip.captions.length === 0) {
      setCurrentMainCaption(null)
      return
    }
    
    // Calculate local time within clip
    const localTime = playheadPosition - clip.startTime + clip.trimStart
    
    // Find caption at current time
    const caption = clip.captions.find(
      c => localTime >= c.start && localTime <= c.end
    )
    
    if (caption && caption !== currentMainCaption) {
      console.log('[Captions] Main track caption:', caption.text)
    }
    
    setCurrentMainCaption(caption || null)
  }, [playheadPosition, currentMainClip, timelineClips, currentMainCaption])

  // Sync overlay track captions with playhead position
  useEffect(() => {
    if (!currentOverlayClip) {
      setCurrentOverlayCaption(null)
      return
    }
    
    const clip = timelineClips.find(c => c.id === currentOverlayClip)
    if (!clip?.captions || clip.captions.length === 0) {
      setCurrentOverlayCaption(null)
      return
    }
    
    // Calculate local time within clip
    const localTime = playheadPosition - clip.startTime + clip.trimStart
    
    // Find caption at current time
    const caption = clip.captions.find(
      c => localTime >= c.start && localTime <= c.end
    )
    
    if (caption && caption !== currentOverlayCaption) {
      console.log('[Captions] Overlay track caption:', caption.text)
    }
    
    setCurrentOverlayCaption(caption || null)
  }, [playheadPosition, currentOverlayClip, timelineClips, currentOverlayCaption])

  const handlePlayPause = () => {
    setPlaying(!isPlaying)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const totalDuration = timelineClips.reduce((sum, clip) => {
    return sum + (clip.trimEnd - clip.trimStart)
  }, 0)

  return (
    <div className="h-full bg-black flex flex-col">
      {/* Video Display */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-black">
        {/* Main Track Video - Full Size */}
        <video
          ref={mainVideoRef}
          className="max-w-full max-h-full object-contain"
        />
        
        {/* Overlay Track Video - PiP Inset (always rendered, hidden when not active) */}
        <video
          ref={overlayVideoRef}
          className="absolute bottom-4 right-4 w-1/4 h-auto rounded-lg shadow-lg border-2 border-gray-600 z-10"
          style={{ 
            maxWidth: '300px', 
            minWidth: '200px',
            display: currentOverlayClip ? 'block' : 'none'
          }}
        />
        
        {/* Debug: Show overlay status */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          <div>Main: {currentMainClip ? '✓' : '✗'}</div>
          <div>Overlay: {currentOverlayClip ? '✓' : '✗'}</div>
        </div>
        
        {/* Main Track Caption (Bottom) */}
        {currentMainCaption && (
          <div className="absolute bottom-4 left-0 right-0 text-center px-4 pointer-events-none z-20">
            <span className="inline-block bg-black bg-opacity-90 text-white text-lg font-semibold px-4 py-2 rounded shadow-lg max-w-4xl">
              {currentMainCaption.text}
            </span>
          </div>
        )}
        
        {/* Overlay Track Caption (Top) */}
        {currentOverlayCaption && (
          <div className="absolute top-16 left-0 right-0 text-center px-4 pointer-events-none z-20">
            <span className="inline-block bg-gradient-to-r from-purple-900 to-pink-900 bg-opacity-90 text-white text-lg font-semibold px-4 py-2 rounded shadow-lg max-w-4xl border-2 border-purple-400">
              {currentOverlayCaption.text}
            </span>
          </div>
        )}
        
        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
            <div className="text-center">
              <p className="text-red-500 text-lg mb-2">⚠️ {error}</p>
              <button
                onClick={() => setError(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {!error && timelineClips.length === 0 && (
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">No clips on timeline</p>
            <p className="text-sm">Add clips to the timeline to preview</p>
          </div>
        )}
      </div>
      
      {/* Playback Controls */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            disabled={timelineClips.length === 0}
            className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" fill="white" />
            ) : (
              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
            )}
          </button>
          
          {/* Time Display */}
          <div className="text-sm text-gray-300 font-mono">
            <span>{formatTime(playheadPosition)}</span>
            <span className="text-gray-500 mx-1">/</span>
            <span>{formatTime(totalDuration)}</span>
          </div>
          
          {/* Spacer */}
          <div className="flex-1" />
          
          {/* Volume Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
              }}
            />
          </div>
          
          {/* Current Clip Info */}
          {(currentMainClip || currentOverlayClip) && (
            <div className="text-xs text-gray-400">
              {currentMainClip && (
                <>
                  <span>Main: {timelineClips.find(c => c.id === currentMainClip)?.filename}</span>
                </>
              )}
              {currentMainClip && currentOverlayClip && <span className="mx-2">•</span>}
              {currentOverlayClip && (
                <>
                  <span>PiP: {timelineClips.find(c => c.id === currentOverlayClip)?.filename}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

