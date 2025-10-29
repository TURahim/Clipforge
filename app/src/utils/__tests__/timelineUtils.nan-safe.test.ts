import { describe, it, expect } from 'vitest'
import {
  safeDuration,
  calculateClipPosition,
  calculateClipWidth,
} from '../timelineUtils'
import { TimelineClip } from '../../types'

describe('timelineUtils - NaN-safe functions', () => {
  describe('safeDuration', () => {
    it('should return correct duration with valid trimStart and trimEnd', () => {
      const clip = { trimStart: 5, trimEnd: 15, duration: 20 }
      expect(safeDuration(clip)).toBe(10)
    })

    it('should handle missing trimStart (default to 0)', () => {
      const clip = { trimEnd: 10, duration: 20 }
      expect(safeDuration(clip)).toBe(10)
    })

    it('should handle missing trimEnd (use duration)', () => {
      const clip = { trimStart: 5, duration: 20 }
      expect(safeDuration(clip)).toBe(15)
    })

    it('should handle completely missing trim values (use duration)', () => {
      const clip = { duration: 30 } as { duration: number; trimStart?: number; trimEnd?: number }
      expect(safeDuration(clip)).toBe(30)
    })

    it('should handle NaN values in trimStart', () => {
      const clip = { trimStart: NaN, trimEnd: 10, duration: 20 }
      expect(safeDuration(clip)).toBe(10)
    })

    it('should handle NaN values in trimEnd', () => {
      const clip = { trimStart: 5, trimEnd: NaN, duration: 20 }
      expect(safeDuration(clip)).toBe(15)
    })

    it('should handle undefined values', () => {
      const clip = { trimStart: undefined, trimEnd: undefined, duration: 25 }
      expect(safeDuration(clip)).toBe(25)
    })

    it('should return 0 when all values are missing', () => {
      const clip = {} as { duration?: number; trimStart?: number; trimEnd?: number }
      expect(safeDuration(clip)).toBe(0)
    })

    it('should return 0 when trimEnd < trimStart', () => {
      const clip = { trimStart: 15, trimEnd: 5, duration: 20 }
      expect(safeDuration(clip)).toBe(0) // Math.max(0, ...)
    })

    it('should handle negative values gracefully', () => {
      const clip = { trimStart: -5, trimEnd: 10, duration: 20 }
      // -5 is finite, so it should be used, but Math.max(0, ...) ensures non-negative
      expect(safeDuration(clip)).toBe(15)
    })
  })

  describe('calculateClipWidth', () => {
    it('should return correct width for valid duration', () => {
      expect(calculateClipWidth(10)).toBe(1000) // 10s * 100px/s
    })

    it('should handle NaN duration', () => {
      expect(calculateClipWidth(NaN)).toBe(0)
    })

    it('should handle undefined duration', () => {
      expect(calculateClipWidth(undefined as unknown as number)).toBe(0)
    })

    it('should handle negative duration (return 0)', () => {
      expect(calculateClipWidth(-5)).toBe(0) // Math.max(0, ...)
    })

    it('should handle Infinity', () => {
      // Infinity is finite check will fail
      expect(calculateClipWidth(Infinity)).toBe(0)
    })
  })

  describe('calculateClipPosition', () => {
    const createMockClip = (id: string, trimStart: number, trimEnd: number, duration: number): TimelineClip => ({
      id,
      filePath: `/path/${id}.mp4`,
      filename: `${id}.mp4`,
      duration,
      thumbnail: '',
      metadata: { width: 1920, height: 1080, codec: 'h264' },
      startTime: 0,
      trimStart,
      trimEnd,
    })

    it('should return 0 for first clip (index 0)', () => {
      const clips = [createMockClip('1', 0, 10, 10)]
      expect(calculateClipPosition(clips, 0)).toBe(0)
    })

    it('should calculate correct position for second clip', () => {
      const clips = [
        createMockClip('1', 0, 10, 10),
        createMockClip('2', 0, 5, 5),
      ]
      expect(calculateClipPosition(clips, 1)).toBe(1000) // 10s * 100px/s
    })

    it('should handle clips with missing trimStart/trimEnd', () => {
      const clips = [
        createMockClip('1', NaN, NaN, 10), // Will use safeDuration → 10s
        createMockClip('2', 0, 5, 5),
      ]
      expect(calculateClipPosition(clips, 1)).toBe(1000) // safeDuration returns 10
    })

    it('should handle clips with partial trim', () => {
      const clips = [
        createMockClip('1', 2, 12, 15), // effectiveDuration = 10
        createMockClip('2', 0, 5, 5),
      ]
      expect(calculateClipPosition(clips, 1)).toBe(1000)
    })

    it('should accumulate positions correctly for multiple clips', () => {
      const clips = [
        createMockClip('1', 0, 5, 10),   // 5s
        createMockClip('2', 0, 10, 10),  // 10s
        createMockClip('3', 0, 8, 8),    // 8s
      ]
      expect(calculateClipPosition(clips, 0)).toBe(0)
      expect(calculateClipPosition(clips, 1)).toBe(500)   // 5s
      expect(calculateClipPosition(clips, 2)).toBe(1500)  // 5s + 10s
    })

    it('should handle clips with all NaN values gracefully', () => {
      const badClip: TimelineClip = {
        id: '1',
        filePath: '/path.mp4',
        filename: 'bad.mp4',
        duration: NaN,
        thumbnail: '',
        metadata: { width: 1920, height: 1080, codec: 'h264' },
        startTime: NaN,
        trimStart: NaN,
        trimEnd: NaN,
      }
      const clips = [badClip, createMockClip('2', 0, 5, 5)]
      expect(calculateClipPosition(clips, 1)).toBe(0) // First clip has 0 duration (NaN-safe)
    })
  })
})

