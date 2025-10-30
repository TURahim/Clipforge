import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect, Line, Text, Group } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { useStore } from '../store/useStore'
import Toast from './ui/Toast'
import { TimelineToolbar } from './TimelineToolbar'
import {
  getEffectivePPS,
  TRACK_HEIGHT,
  TRACK_GAP,
  NUM_TRACKS,
  calculateTotalDuration,
  formatTime,
  generateTimeMarkers,
  secondsToPixels,
  getTrackY,
  getTrackFromY,
} from '../utils/timelineUtils'
import { constrainTrimPoint } from '../utils/trimUtils'

export default function Timeline() {
  const timelineClips = useStore((state) => state.timelineClips)
  const selectedClipId = useStore((state) => state.selectedClipId)
  const playheadPosition = useStore((state) => state.playheadPosition)
  const zoomLevel = useStore((state) => state.zoomLevel)
  const setSelectedClip = useStore((state) => state.selectClip)
  const setPlayheadPosition = useStore((state) => state.setPlayheadPosition)
  const addToTimeline = useStore((state) => state.addToTimeline)
  const updateClipTrim = useStore((state) => state.updateClipTrim)
  const updateClipTrack = useStore((state) => state.updateClipTrack)
  const updateClipStartTime = useStore((state) => state.updateClipStartTime)
  
  // Calculate effective pixels per second based on zoom level
  const PIXELS_PER_SECOND = getEffectivePPS(zoomLevel)

  // Diagnostic logging
  console.log('[Timeline] typeof addToTimeline =', typeof addToTimeline)
  console.log('[Timeline] store keys:', Object.keys(useStore.getState()))

  const containerRef = useRef<HTMLDivElement>(null)
  
  // Calculate canvas height based on number of tracks
  const canvasHeight = NUM_TRACKS * (TRACK_HEIGHT + TRACK_GAP) + 60 // +60 for time markers at top and extra spacing
  
  const [containerSize, setContainerSize] = useState({ width: 800, height: canvasHeight })
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [hoveredClipId, setHoveredClipId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  // Responsive canvas sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: canvasHeight,
        })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [canvasHeight])

  const totalDuration = calculateTotalDuration(timelineClips)
  const timelineWidth = Math.max(containerSize.width, secondsToPixels(totalDuration) + 200)
  const timeMarkers = generateTimeMarkers(totalDuration)

  const handleClipClick = (clipId: string) => {
    setSelectedClip(clipId)
  }

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    // Deselect if clicking on empty area
    if (e.target === e.target.getStage()) {
      setSelectedClip(null)
    }
  }

  const handleTimelineClick = (e: KonvaEventObject<MouseEvent>) => {
    // Click on timeline to move playhead
    const stage = e.target.getStage()
    if (!stage) return
    const pointerPosition = stage.getPointerPosition()
    if (pointerPosition) {
      const seconds = pointerPosition.x / PIXELS_PER_SECOND
      setPlayheadPosition(Math.max(0, Math.min(totalDuration, seconds)))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
    setIsDraggingOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)

    console.log('[Timeline] Drop event triggered')

    try {
      const clipData = e.dataTransfer.getData('application/clipforge-clip')
      console.log('[Timeline] Clip data received:', clipData ? 'YES' : 'NO')
      
      if (clipData) {
        const raw = JSON.parse(clipData)
        console.log('[Timeline] Parsed raw clip:', raw.filename, 'duration:', raw.duration)
        
        // Detect which track the drop occurred on based on Y position
        const rect = (e.target as HTMLElement).getBoundingClientRect()
        const dropY = e.clientY - rect.top
        
        // Account for time markers (30px) and Group offset
        const relativeY = dropY - 30
        const detectedTrack = getTrackFromY(relativeY)
        
        console.log('[Timeline] Drop position:', {
          clientY: e.clientY,
          rectTop: rect.top,
          dropY,
          relativeY,
          detectedTrack
        })
        
        // Harden clip data with safe defaults before passing to store
        const clip = {
          ...raw,
          trimStart: Number.isFinite(raw?.trimStart) ? Number(raw.trimStart) : 0,
          trimEnd: Number.isFinite(raw?.trimEnd)
            ? Number(raw.trimEnd)
            : Number.isFinite(raw?.duration) ? Number(raw.duration) : 0,
          duration: Number.isFinite(raw?.duration)
            ? Number(raw.duration)
            : Math.max(0, (Number(raw?.trimEnd) || 0) - (Number(raw?.trimStart) || 0)),
        }
        
        console.log('[Timeline] Coerced clip:', {
          filename: clip.filename,
          duration: clip.duration,
          trimStart: clip.trimStart,
          trimEnd: clip.trimEnd,
        })
        
        // Add to timeline with detected track
        addToTimeline(clip, detectedTrack)
        const trackName = detectedTrack === 0 ? 'Main Track' : 'Overlay Track'
        console.log('[Timeline] Clip added to', trackName)
        setToast({ message: `Clip "${clip.filename}" added to ${trackName}`, type: 'success' })
      } else {
        console.warn('[Timeline] No clip data in drop event')
      }
    } catch (error) {
      console.error('[Timeline] Failed to parse dropped clip data:', error)
      setToast({ message: 'Failed to add clip to timeline', type: 'error' })
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Timeline Toolbar */}
      <TimelineToolbar />
      
      {/* Timeline Canvas */}
    <div
      ref={containerRef}
        className={`flex-1 overflow-x-auto overflow-y-hidden ${
        isDraggingOver ? 'ring-2 ring-blue-500 ring-inset' : ''
      }`}
      style={{ position: 'relative' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Stage 
        width={Math.max(containerSize.width, timelineWidth)} 
        height={containerSize.height} 
        onClick={handleStageClick}
        onDrop={handleDrop as unknown as (e: KonvaEventObject<DragEvent>) => void}
        onDragOver={handleDragOver as unknown as (e: KonvaEventObject<DragEvent>) => void}
        onDragLeave={handleDragLeave as unknown as (e: KonvaEventObject<DragEvent>) => void}
      >
        <Layer>
          {/* Timeline background */}
          <Rect
            x={0}
            y={0}
            width={timelineWidth}
            height={containerSize.height}
            fill="#1f2937"
            onClick={handleTimelineClick}
          />

          {/* Time markers */}
          {timeMarkers.map((time) => {
            const x = secondsToPixels(time)
            return (
              <Group key={`marker-${time}`}>
                <Line
                  points={[x, 0, x, 20]}
                  stroke="#6b7280"
                  strokeWidth={1}
                />
                <Text
                  x={x + 5}
                  y={5}
                  text={formatTime(time)}
                  fontSize={12}
                  fill="#9ca3af"
                />
              </Group>
            )
          })}

          {/* Multi-Track Timeline */}
          <Group y={30}>
            {/* Render track backgrounds and labels */}
            {Array.from({ length: NUM_TRACKS }).map((_, trackIndex) => {
              const trackY = getTrackY(trackIndex)
              const trackLabel = trackIndex === 0 ? 'Main Track' : 'Overlay Track'
              const trackColor = trackIndex === 0 ? '#1f2937' : '#111827'
              
              return (
                <Group key={`track-${trackIndex}`}>
                  {/* Track background */}
                  <Rect
                    x={0}
                    y={trackY}
                    width={timelineWidth}
                    height={TRACK_HEIGHT}
                    fill={trackColor}
                    stroke="#374151"
                    strokeWidth={1}
                  />
                  
                  {/* Track label */}
                  <Text
                    x={10}
                    y={trackY + 8}
                    text={trackLabel}
                    fontSize={11}
                    fill="#6b7280"
                    fontStyle="bold"
                  />
                </Group>
              )
            })}
            
            {/* Render clips on their respective tracks */}
            {timelineClips.map((clip) => {
              // Calculate clip X position based on startTime
              const clipX = clip.startTime * PIXELS_PER_SECOND
              
              // Calculate Y position based on track
              const trackY = getTrackY(clip.track || 0)
              
              // NaN-safe width calculation (active/visible portion only)
              const clipWidth = Math.max(0, (Number(clip.trimEnd) - Number(clip.trimStart))) * PIXELS_PER_SECOND
              const isSelected = clip.id === selectedClipId

              return (
                <Group key={clip.id}>
                  {/* Active/visible region (no dark trim overlays - cleaner UI for split clips) */}
                  <Rect
                    x={clipX}
                    y={trackY}
                    width={clipWidth}
                    height={TRACK_HEIGHT}
                    fill={isSelected ? '#3b82f6' : (hoveredClipId === clip.id ? '#5A9FE2' : '#4a90e2')}
                    stroke={isSelected ? '#60a5fa' : '#10b981'}
                    strokeWidth={isSelected ? 3 : 2}
                    cornerRadius={4}
                    shadowBlur={isSelected ? 10 : 5}
                    shadowColor={isSelected ? '#3b82f6' : '#000000'}
                    shadowOpacity={0.5}
                    onClick={() => handleClipClick(clip.id)}
                    onMouseEnter={() => setHoveredClipId(clip.id)}
                    onMouseLeave={() => setHoveredClipId(null)}
                    draggable
                    dragBoundFunc={(pos) => {
                      // Allow both horizontal and vertical movement
                      // Constrain Y to valid track range (coordinates are relative to Group)
                      const minY = getTrackY(0)
                      const maxY = getTrackY(NUM_TRACKS - 1) + TRACK_HEIGHT
                      // Constrain X to stay within timeline (don't allow negative)
                      const minX = 0
                      return {
                        x: Math.max(minX, pos.x),
                        y: Math.max(minY, Math.min(maxY, pos.y))
                      }
                    }}
                    onDragEnd={(e: KonvaEventObject<DragEvent>) => {
                      // Get new position (relative to Group)
                      const newX = e.target.x()
                      const newY = e.target.y()
                      
                      // Calculate new track
                      const newTrack = getTrackFromY(newY)
                      
                      // Calculate new startTime from X position (no offset needed)
                      const newStartTime = newX / PIXELS_PER_SECOND
                      
                      console.log('[Timeline] Drag ended:', {
                        newX,
                        newY,
                        newStartTime,
                        newTrack,
                        currentTrack: clip.track
                      })
                      
                      // Update track if changed
                      if (newTrack !== clip.track) {
                        console.log('[Timeline] Moving clip from track', clip.track, 'to track', newTrack)
                        updateClipTrack(clip.id, newTrack)
                      }
                      
                      // Update startTime if changed
                      if (Math.abs(newStartTime - clip.startTime) > 0.01) {
                        console.log('[Timeline] Moving clip from', clip.startTime, 'to', newStartTime)
                        updateClipStartTime(clip.id, newStartTime)
                      }
                      
                      // Snap to correct position
                      const targetTrackY = getTrackY(newTrack)
                      const targetX = Math.max(0, newStartTime) * PIXELS_PER_SECOND
                      e.target.position({ x: targetX, y: targetTrackY })
                    }}
                    onMouseDown={(e) => {
                      const container = e.target.getStage()?.container()
                      if (container) container.style.cursor = 'move'
                    }}
                    onMouseUp={(e) => {
                      const container = e.target.getStage()?.container()
                      if (container) container.style.cursor = 'default'
                    }}
                  />

                  {/* Left trim handle (in-point) */}
                  {isSelected && (
                    <Rect
                      x={clipX - 5}
                      y={trackY}
                      width={10}
                      height={TRACK_HEIGHT}
                      fill="#FFA500"
                      cornerRadius={2}
                      draggable
                      dragBoundFunc={(pos) => {
                        // Constrain to clip bounds
                        const minX = clipX
                        const maxX = clipX + clipWidth - 10
                        return {
                          x: Math.max(minX, Math.min(maxX, pos.x)),
                          y: trackY, // Keep on same y level relative to Group
                        }
                      }}
                      onDragEnd={(e: KonvaEventObject<DragEvent>) => {
                        const handleX = e.target.x()
                        const offsetInClip = (handleX - clipX) / PIXELS_PER_SECOND
                        const newTrimStart = clip.trimStart + offsetInClip
                        const constrained = constrainTrimPoint(newTrimStart, clip.trimStart, clip.trimEnd - 0.5)
                        updateClipTrim(clip.id, constrained, clip.trimEnd)
                      }}
                      onMouseEnter={(e) => {
                        const container = e.target.getStage()?.container()
                        if (container) container.style.cursor = 'ew-resize'
                      }}
                      onMouseLeave={(e) => {
                        const container = e.target.getStage()?.container()
                        if (container) container.style.cursor = 'default'
                      }}
                    />
                  )}

                  {/* Right trim handle (out-point) */}
                  {isSelected && (
                    <Rect
                      x={clipX + clipWidth - 5}
                      y={trackY}
                      width={10}
                      height={TRACK_HEIGHT}
                      fill="#FFA500"
                      cornerRadius={2}
                      draggable
                      dragBoundFunc={(pos) => {
                        const minX = clipX + 10
                        const maxX = clipX + (clip.duration - clip.trimStart) * PIXELS_PER_SECOND
                        return {
                          x: Math.max(minX, Math.min(maxX, pos.x)),
                          y: trackY, // Keep on same y level relative to Group
                        }
                      }}
                      onDragEnd={(e: KonvaEventObject<DragEvent>) => {
                        const handleX = e.target.x()
                        const offsetInClip = (handleX - clipX) / PIXELS_PER_SECOND
                        const newTrimEnd = clip.trimStart + offsetInClip
                        const constrained = constrainTrimPoint(newTrimEnd, clip.trimStart + 0.5, clip.duration)
                        updateClipTrim(clip.id, clip.trimStart, constrained)
                      }}
                      onMouseEnter={(e) => {
                        const container = e.target.getStage()?.container()
                        if (container) container.style.cursor = 'ew-resize'
                      }}
                      onMouseLeave={(e) => {
                        const container = e.target.getStage()?.container()
                        if (container) container.style.cursor = 'default'
                      }}
                    />
                  )}

                  {/* Clip label */}
                  <Text
                    x={clipX + 10}
                    y={trackY + 25}
                    text={clip.filename}
                    fontSize={12}
                    fill="white"
                    width={Math.max(0, clipWidth - 20)}
                    ellipsis={true}
                    onClick={() => handleClipClick(clip.id)}
                  />

                  {/* Duration label */}
                  <Text
                    x={clipX + 10}
                    y={trackY + TRACK_HEIGHT - 15}
                    text={formatTime(Number(clip.trimEnd) - Number(clip.trimStart))}
                    fontSize={10}
                    fill="#e5e7eb"
                    onClick={() => handleClipClick(clip.id)}
                  />
                </Group>
              )
            })}
          </Group>

          {/* Playhead */}
          {totalDuration > 0 && (
            <Group>
              {/* Playhead line */}
              <Line
                points={[
                  secondsToPixels(playheadPosition),
                  0,
                  secondsToPixels(playheadPosition),
                  containerSize.height,
                ]}
                stroke="#ef4444"
                strokeWidth={2}
                listening={false}
              />

              {/* Playhead handle (top) - DRAGGABLE */}
              <Rect
                x={secondsToPixels(playheadPosition) - 8}
                y={0}
                width={16}
                height={20}
                fill="#ef4444"
                cornerRadius={4}
                draggable
                dragBoundFunc={(pos) => {
                  // Constrain to timeline bounds
                  const minX = 0
                  const maxX = secondsToPixels(totalDuration)
                  return {
                    x: Math.max(minX, Math.min(maxX, pos.x + 8)) - 8, // +8 to account for handle offset
                    y: 0, // Keep at top
                  }
                }}
                onDragMove={(e: KonvaEventObject<DragEvent>) => {
                  const handleX = e.target.x() + 8 // Center of handle
                  const newTime = handleX / PIXELS_PER_SECOND
                  const constrainedTime = Math.max(0, Math.min(totalDuration, newTime))
                  setPlayheadPosition(constrainedTime)
                }}
                onMouseEnter={(e) => {
                  const container = e.target.getStage()?.container()
                  if (container) container.style.cursor = 'grab'
                }}
                onMouseDown={(e) => {
                  const container = e.target.getStage()?.container()
                  if (container) container.style.cursor = 'grabbing'
                }}
                onMouseUp={(e) => {
                  const container = e.target.getStage()?.container()
                  if (container) container.style.cursor = 'grab'
                }}
                onMouseLeave={(e) => {
                  const container = e.target.getStage()?.container()
                  if (container) container.style.cursor = 'default'
                }}
              />

              {/* Playhead time display */}
              <Text
                x={secondsToPixels(playheadPosition) + 10}
                y={5}
                text={formatTime(playheadPosition)}
                fontSize={12}
                fill="#fecaca"
                fontStyle="bold"
                listening={false}
              />
            </Group>
          )}
        </Layer>
      </Stage>

      {/* Empty state */}
      {timelineClips.length === 0 && !isDraggingOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">Timeline is empty</p>
            <p className="text-sm">Drag clips from media library or click to add</p>
          </div>
        </div>
      )}
      
      {/* Drag overlay */}
      {isDraggingOver && timelineClips.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-blue-500/10">
          <div className="text-center">
            <p className="text-xl text-blue-400 font-semibold mb-2">Drop clip here</p>
            <p className="text-sm text-blue-300">Add to timeline</p>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      </div>
    </div>
  )
}

