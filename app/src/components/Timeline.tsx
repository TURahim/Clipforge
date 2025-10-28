import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect, Line, Text, Group } from 'react-konva'
import { useStore } from '../store/useStore'
import Toast from './ui/Toast'
import {
  PIXELS_PER_SECOND,
  TIMELINE_HEIGHT,
  calculateClipPosition,
  calculateTotalDuration,
  formatTime,
  generateTimeMarkers,
  secondsToPixels,
  safeDuration,
} from '../utils/timelineUtils'

export default function Timeline() {
  const timelineClips = useStore((state) => state.timelineClips)
  const selectedClipId = useStore((state) => state.selectedClipId)
  const playheadPosition = useStore((state) => state.playheadPosition)
  const setSelectedClip = useStore((state) => state.selectClip)
  const setPlayheadPosition = useStore((state) => state.setPlayheadPosition)
  const addToTimeline = useStore((state) => state.addToTimeline)

  // Diagnostic logging
  console.log('[Timeline] typeof addToTimeline =', typeof addToTimeline)
  console.log('[Timeline] store keys:', Object.keys(useStore.getState()))

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 800, height: 200 })
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  // Responsive canvas sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: 200,
        })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const totalDuration = calculateTotalDuration(timelineClips)
  const timelineWidth = Math.max(containerSize.width, secondsToPixels(totalDuration) + 200)
  const timeMarkers = generateTimeMarkers(totalDuration)

  const handleClipClick = (clipId: string) => {
    setSelectedClip(clipId)
  }

  const handleStageClick = (e: any) => {
    // Deselect if clicking on empty area
    if (e.target === e.target.getStage()) {
      setSelectedClip(null)
    }
  }

  const handleTimelineClick = (e: any) => {
    // Click on timeline to move playhead
    const stage = e.target.getStage()
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
        
        addToTimeline(clip)
        console.log('[Timeline] Clip added to timeline successfully')
        setToast({ message: `Clip "${clip.filename}" added to timeline`, type: 'success' })
      } else {
        console.warn('[Timeline] No clip data in drop event')
      }
    } catch (error) {
      console.error('[Timeline] Failed to parse dropped clip data:', error)
      setToast({ message: 'Failed to add clip to timeline', type: 'error' })
    }
  }

  return (
    <div
      ref={containerRef}
      className={`h-full bg-gray-800 overflow-x-auto overflow-y-hidden ${
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
        // @ts-expect-error: DOM event passthrough for better cross-platform DnD support
        onDrop={handleDrop as any}
        // @ts-expect-error: DOM event passthrough
        onDragOver={handleDragOver as any}
        // @ts-expect-error: DOM event passthrough
        onDragLeave={handleDragLeave as any}
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

          {/* Timeline clips track */}
          <Group y={40}>
            {timelineClips.map((clip, index) => {
              const clipX = calculateClipPosition(timelineClips, index)
              // NaN-safe width calculation
              const clipWidth = Math.max(0, (Number(clip.trimEnd) - Number(clip.trimStart))) * PIXELS_PER_SECOND
              const isSelected = clip.id === selectedClipId
              
              // Diagnostic logging for clip rendering
              if (index === timelineClips.length - 1) {
                // Log last clip only to avoid spam
                console.log('[Timeline Render] Last clip:', {
                  filename: clip.filename,
                  clipX,
                  clipWidth,
                  trimStart: clip.trimStart,
                  trimEnd: clip.trimEnd,
                  isValid: Number.isFinite(clipX) && Number.isFinite(clipWidth) && clipWidth > 0,
                })
                
                if (!Number.isFinite(clipX) || !Number.isFinite(clipWidth) || clipWidth <= 0) {
                  console.warn('[Timeline Render] ⚠️ Invalid clip dimensions detected!')
                }
              }

              return (
                <Group key={clip.id}>
                  {/* Clip rectangle */}
                  <Rect
                    x={clipX}
                    y={0}
                    width={clipWidth}
                    height={TIMELINE_HEIGHT}
                    fill={isSelected ? '#3b82f6' : '#4a90e2'}
                    stroke={isSelected ? '#60a5fa' : '#10b981'}
                    strokeWidth={isSelected ? 3 : 2}
                    cornerRadius={4}
                    shadowBlur={isSelected ? 10 : 5}
                    shadowColor={isSelected ? '#3b82f6' : '#000000'}
                    shadowOpacity={0.5}
                    onClick={() => handleClipClick(clip.id)}
                  />

                  {/* Clip label */}
                  <Text
                    x={clipX + 10}
                    y={10}
                    text={clip.filename}
                    fontSize={14}
                    fill="white"
                    width={Math.max(0, clipWidth - 20)}
                    ellipsis={true}
                    onClick={() => handleClipClick(clip.id)}
                  />

                  {/* Duration label */}
                  <Text
                    x={clipX + 10}
                    y={TIMELINE_HEIGHT - 25}
                    text={formatTime(Number(clip.trimEnd) - Number(clip.trimStart))}
                    fontSize={12}
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
              />

              {/* Playhead handle (top) */}
              <Rect
                x={secondsToPixels(playheadPosition) - 8}
                y={0}
                width={16}
                height={20}
                fill="#ef4444"
                cornerRadius={4}
              />

              {/* Playhead time display */}
              <Text
                x={secondsToPixels(playheadPosition) + 10}
                y={5}
                text={formatTime(playheadPosition)}
                fontSize={12}
                fill="#fecaca"
                fontStyle="bold"
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
  )
}

