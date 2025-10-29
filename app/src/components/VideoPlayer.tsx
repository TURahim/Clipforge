import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'
import { VideoController } from '../utils/VideoController'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { formatTime } from '../utils/timelineUtils'

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controllerRef = useRef<VideoController>()
  
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
  
  // Use ref to prevent double transitions (race condition between onUpdate and onEnded)
  const isTransitioningRef = useRef(false)
  
  const [currentClipIndex, setCurrentClipIndex] = useState<number>(-1)
  const [volume, setVolume] = useState<number>(1)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize VideoController
  useEffect(() => {
    if (videoRef.current && !controllerRef.current) {
      controllerRef.current = new VideoController(videoRef.current)
    }
    
    return () => {
      if (controllerRef.current) {
        controllerRef.current.destroy()
        controllerRef.current = undefined
      }
    }
  }, [])
  
  // Update video controller callbacks when dependencies change
  useEffect(() => {
    if (!controllerRef.current) return
    
    // Register time update callback with current values
    controllerRef.current.onUpdate((time) => {
      // Calculate global timeline position
      if (currentClipIndex >= 0 && currentClipIndex < timelineClips.length) {
        const clip = timelineClips[currentClipIndex]
        
        // Check if we've reached the trim end point
        if (time >= clip.trimEnd) {
          // Prevent double transitions
          if (isTransitioningRef.current) {
            return
          }
          
          // Move to next clip or stop playback
          if (currentClipIndex < timelineClips.length - 1) {
            console.log('[VideoPlayer] Transitioning to next clip:', currentClipIndex + 1)
            isTransitioningRef.current = true
            loadClipAtIndex(currentClipIndex + 1, true) // Auto-play next clip
          } else {
            console.log('[VideoPlayer] Reached end of timeline')
            setPlaying(false)
            controllerRef.current?.pause()
          }
          return
        }
        
        const clipTimelineStart = clip.startTime
        const clipLocalTime = time - clip.trimStart
        const globalTime = clipTimelineStart + clipLocalTime
        setPlayheadPosition(globalTime)
      }
    })
    
    // Register ended callback
    controllerRef.current.onEnded(() => {
      // Prevent double transitions
      if (isTransitioningRef.current) {
        return
      }
      
      // Move to next clip or stop
      if (currentClipIndex < timelineClips.length - 1) {
        console.log('[VideoPlayer] Clip ended, loading next clip:', currentClipIndex + 1)
        isTransitioningRef.current = true
        loadClipAtIndex(currentClipIndex + 1, true) // Auto-play next clip
      } else {
        console.log('[VideoPlayer] All clips finished')
        setPlaying(false)
        setPlayheadPosition(0)
      }
    })
  }, [currentClipIndex, timelineClips, setPlayheadPosition, setPlaying])

  // Load clip at specific index
  const loadClipAtIndex = async (index: number, shouldAutoPlay: boolean = false) => {
    if (index < 0 || index >= timelineClips.length || !controllerRef.current) {
      console.warn('[VideoPlayer] Cannot load clip - invalid index or no controller')
      return
    }
    
    const clip = timelineClips[index]
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('[VideoPlayer] Loading clip:', {
        index,
        filename: clip.filename,
        filePath: clip.filePath,
        trimStart: clip.trimStart,
        trimEnd: clip.trimEnd,
        shouldAutoPlay
      })
      
      // Use custom clipforge:// protocol to serve local video files
      const videoUrl = `clipforge://video/${encodeURIComponent(clip.filePath)}`
      await controllerRef.current.load(videoUrl)
      
      console.log('[VideoPlayer] Video loaded, setting clip index and seeking to', clip.trimStart)
      setCurrentClipIndex(index)
      
      // Small delay to ensure video is truly ready for seeking
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Seek to trim start point
      controllerRef.current.seek(clip.trimStart)
      console.log('[VideoPlayer] Seeked to', clip.trimStart)
      
      // Resume playback if requested (for clip transitions)
      if (shouldAutoPlay && isPlayingRef.current) {
        console.log('[VideoPlayer] Auto-playing clip after load')
        await controllerRef.current.play()
      }
      
      setIsLoading(false)
      isTransitioningRef.current = false // Clear transition lock
      console.log('[VideoPlayer] Clip loaded successfully')
    } catch (err) {
      console.error('[VideoPlayer] Failed to load clip:', err, {
        index,
        filename: clip.filename,
        filePath: clip.filePath
      })
      setError('Failed to load video clip')
      setIsLoading(false)
      setPlaying(false) // Stop playback on error
      isTransitioningRef.current = false // Clear transition lock on error
    }
  }

  // Determine which clip should be playing based on playhead position
  const getClipAtPlayheadPosition = (position: number): number => {
    for (let i = 0; i < timelineClips.length; i++) {
      const clip = timelineClips[i]
      const clipDuration = clip.trimEnd - clip.trimStart
      const clipEnd = clip.startTime + clipDuration
      
      if (position >= clip.startTime && position < clipEnd) {
        return i
      }
    }
    return -1
  }

  // Sync video with playhead position changes
  useEffect(() => {
    if (!controllerRef.current || timelineClips.length === 0) return
    
    const targetClipIndex = getClipAtPlayheadPosition(playheadPosition)
    
    if (targetClipIndex === -1) {
      // Playhead is outside all clips
      return
    }
    
    // Load new clip if needed (happens when scrubbing across clip boundaries)
    if (targetClipIndex !== currentClipIndex) {
      console.log('[VideoPlayer] Scrubbing to different clip:', targetClipIndex)
      loadClipAtIndex(targetClipIndex, isPlaying) // Maintain playback state
      return
    }
    
    // Update video time based on playhead position
    const clip = timelineClips[targetClipIndex]
    const clipLocalPosition = playheadPosition - clip.startTime
    const videoTime = clip.trimStart + clipLocalPosition
    
    // Only seek if there's a significant difference (avoid constant seeking)
    const currentVideoTime = controllerRef.current.getCurrentTime()
    if (Math.abs(currentVideoTime - videoTime) > 0.1) {
      controllerRef.current.seek(videoTime)
    }
  }, [playheadPosition, timelineClips, currentClipIndex])

  // Handle play/pause state changes
  useEffect(() => {
    if (!controllerRef.current) return
    
    if (isPlaying) {
      // Ensure we have a clip loaded
      if (currentClipIndex === -1 && timelineClips.length > 0) {
        loadClipAtIndex(0)
      } else {
        controllerRef.current.play().catch((err) => {
          console.error('[VideoPlayer] Failed to play:', err)
          setPlaying(false)
        })
      }
    } else {
      controllerRef.current.pause()
    }
  }, [isPlaying])

  // Load first clip when timeline clips change
  useEffect(() => {
    if (timelineClips.length > 0 && currentClipIndex === -1) {
      loadClipAtIndex(0)
    }
  }, [timelineClips])

  // Handle volume changes
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setVolume(isMuted ? 0 : volume)
    }
  }, [volume, isMuted])

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
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <video
          ref={videoRef}
          className="max-w-full max-h-full object-contain"
        />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-white text-lg">Loading video...</div>
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
        {!isLoading && !error && timelineClips.length === 0 && (
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
          {currentClipIndex >= 0 && currentClipIndex < timelineClips.length && (
            <div className="text-xs text-gray-400">
              <span>Clip {currentClipIndex + 1} of {timelineClips.length}</span>
              <span className="mx-2">•</span>
              <span>{timelineClips[currentClipIndex].filename}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

