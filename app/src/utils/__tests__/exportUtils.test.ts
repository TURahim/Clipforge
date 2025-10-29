import { describe, it, expect } from 'vitest'
import {
  buildSingleClipExportCommand,
  buildConcatExportCommand,
  generateFilelistContent,
  parseExportProgress,
  calculateTotalExportDuration,
  validateExportClips,
} from '../exportUtils'
import type { TimelineClip } from '../../types'

const createMockClip = (overrides?: Partial<TimelineClip>): TimelineClip => ({
  id: '1',
  filePath: '/path/to/video.mp4',
  filename: 'video.mp4',
  duration: 30,
  startTime: 0,
  trimStart: 0,
  trimEnd: 30,
  ...overrides,
})

describe('exportUtils', () => {
  describe('buildSingleClipExportCommand', () => {
    it('should build command for untrimmed clip', () => {
      const clip = createMockClip()
      const args = buildSingleClipExportCommand(clip, '/output.mp4')

      expect(args).toContain('-i')
      expect(args).toContain('/path/to/video.mp4')
      expect(args).toContain('-c:v')
      expect(args).toContain('libx264')
      expect(args).toContain('-c:a')
      expect(args).toContain('aac')
      expect(args).toContain('/output.mp4')
    })

    it('should add trim start for trimmed clip', () => {
      const clip = createMockClip({ trimStart: 5, trimEnd: 25 })
      const args = buildSingleClipExportCommand(clip, '/output.mp4')

      expect(args).toContain('-ss')
      expect(args).toContain('5')
      expect(args).toContain('-t')
      expect(args).toContain('20') // duration
    })

    it('should add duration for end-trimmed clip', () => {
      const clip = createMockClip({ trimStart: 0, trimEnd: 20 })
      const args = buildSingleClipExportCommand(clip, '/output.mp4')

      expect(args).toContain('-t')
      expect(args).toContain('20')
    })

    it('should include quality settings', () => {
      const clip = createMockClip()
      const args = buildSingleClipExportCommand(clip, '/output.mp4')

      expect(args).toContain('-preset')
      expect(args).toContain('medium')
      expect(args).toContain('-crf')
      expect(args).toContain('23')
    })
  })

  describe('buildConcatExportCommand', () => {
    it('should build concat command', () => {
      const args = buildConcatExportCommand('/tmp/filelist.txt', '/output.mp4')

      expect(args).toContain('-f')
      expect(args).toContain('concat')
      expect(args).toContain('-safe')
      expect(args).toContain('0')
      expect(args).toContain('-i')
      expect(args).toContain('/tmp/filelist.txt')
      expect(args).toContain('/output.mp4')
    })
  })

  describe('generateFilelistContent', () => {
    it('should generate filelist for multiple clips', () => {
      const clips = [
        createMockClip({ id: '1', filePath: '/path/video1.mp4' }),
        createMockClip({ id: '2', filePath: '/path/video2.mp4' }),
        createMockClip({ id: '3', filePath: '/path/video3.mp4' }),
      ]

      const content = generateFilelistContent(clips)

      expect(content).toBe(
        "file '/path/video1.mp4'\n" +
        "file '/path/video2.mp4'\n" +
        "file '/path/video3.mp4'"
      )
    })

    it('should handle single clip', () => {
      const clips = [createMockClip({ filePath: '/video.mp4' })]
      const content = generateFilelistContent(clips)

      expect(content).toBe("file '/video.mp4'")
    })
  })

  describe('parseExportProgress', () => {
    it('should parse progress from FFmpeg output', () => {
      const stderr = 'frame=  123 fps= 30 q=28.0 size=    1024kB time=00:00:10.50 bitrate= 798.5kbits/s speed=1.2x'
      const totalDuration = 30

      const progress = parseExportProgress(stderr, totalDuration)

      expect(progress).toBe(35) // 10.5 / 30 = 0.35 = 35%
    })

    it('should handle hours in time', () => {
      const stderr = 'time=01:30:45.00'
      const totalDuration = 7200 // 2 hours

      const progress = parseExportProgress(stderr, totalDuration)

      expect(progress).toBe(76) // 5445 / 7200 = 0.756 = 76%
    })

    it('should return 0 for invalid output', () => {
      const stderr = 'no time information here'
      const totalDuration = 30

      const progress = parseExportProgress(stderr, totalDuration)

      expect(progress).toBe(0)
    })

    it('should return 0 for zero duration', () => {
      const stderr = 'time=00:00:10.00'
      const totalDuration = 0

      const progress = parseExportProgress(stderr, totalDuration)

      expect(progress).toBe(0)
    })

    it('should cap progress at 100%', () => {
      const stderr = 'time=00:00:35.00'
      const totalDuration = 30

      const progress = parseExportProgress(stderr, totalDuration)

      expect(progress).toBe(100)
    })
  })

  describe('calculateTotalExportDuration', () => {
    it('should calculate total duration of untrimmed clips', () => {
      const clips = [
        createMockClip({ duration: 10, trimStart: 0, trimEnd: 10 }),
        createMockClip({ duration: 20, trimStart: 0, trimEnd: 20 }),
        createMockClip({ duration: 30, trimStart: 0, trimEnd: 30 }),
      ]

      const total = calculateTotalExportDuration(clips)

      expect(total).toBe(60)
    })

    it('should respect trim points', () => {
      const clips = [
        createMockClip({ duration: 10, trimStart: 2, trimEnd: 8 }), // 6s
        createMockClip({ duration: 20, trimStart: 5, trimEnd: 15 }), // 10s
      ]

      const total = calculateTotalExportDuration(clips)

      expect(total).toBe(16)
    })

    it('should handle empty array', () => {
      const total = calculateTotalExportDuration([])
      expect(total).toBe(0)
    })
  })

  describe('validateExportClips', () => {
    it('should validate correct clips', () => {
      const clips = [
        createMockClip(),
        createMockClip({ id: '2' }),
      ]

      const result = validateExportClips(clips)

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject empty clips array', () => {
      const result = validateExportClips([])

      expect(result.valid).toBe(false)
      expect(result.error).toBe('No clips to export')
    })

    it('should reject clip without file path', () => {
      const clips = [createMockClip({ filePath: '' })]

      const result = validateExportClips(clips)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('has no file path')
    })

    it('should reject clip with invalid trim', () => {
      const clips = [createMockClip({ trimStart: 10, trimEnd: 5 })]

      const result = validateExportClips(clips)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('invalid trim')
    })

    it('should reject clip with zero duration trim', () => {
      const clips = [createMockClip({ trimStart: 10, trimEnd: 10 })]

      const result = validateExportClips(clips)

      expect(result.valid).toBe(false)
      expect(result.error).toContain('invalid trim')
    })
  })
})


