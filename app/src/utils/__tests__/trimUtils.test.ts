import { describe, it, expect } from 'vitest'
import {
  validateTrimPoints,
  calculateEffectiveDuration,
  constrainTrimPoint,
  isValidTrim,
  calculateTrimPercentage,
  snapToSecond,
  pixelToTrimPoint,
} from '../trimUtils'

describe('trimUtils', () => {
  describe('validateTrimPoints', () => {
    it('should validate correct trim points', () => {
      const result = validateTrimPoints(5, 15, 30)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject negative trim start', () => {
      const result = validateTrimPoints(-1, 15, 30)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Trim in-point cannot be negative')
    })

    it('should reject trim end exceeding duration', () => {
      const result = validateTrimPoints(5, 35, 30)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Trim out-point cannot exceed clip duration')
    })

    it('should reject trim start >= trim end', () => {
      const result = validateTrimPoints(15, 15, 30)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Trim in-point must be before out-point')
    })

    it('should reject trim start > trim end', () => {
      const result = validateTrimPoints(20, 15, 30)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Trim in-point must be before out-point')
    })
  })

  describe('calculateEffectiveDuration', () => {
    it('should calculate correct duration', () => {
      expect(calculateEffectiveDuration(5, 15)).toBe(10)
    })

    it('should return 0 for invalid trim', () => {
      expect(calculateEffectiveDuration(15, 5)).toBe(0)
    })

    it('should handle zero values', () => {
      expect(calculateEffectiveDuration(0, 10)).toBe(10)
    })
  })

  describe('constrainTrimPoint', () => {
    it('should constrain value within bounds', () => {
      expect(constrainTrimPoint(15, 0, 30)).toBe(15)
    })

    it('should clamp to min', () => {
      expect(constrainTrimPoint(-5, 0, 30)).toBe(0)
    })

    it('should clamp to max', () => {
      expect(constrainTrimPoint(35, 0, 30)).toBe(30)
    })
  })

  describe('isValidTrim', () => {
    it('should return true for valid trim', () => {
      expect(isValidTrim(5, 15, 30)).toBe(true)
    })

    it('should return false for invalid trim', () => {
      expect(isValidTrim(-1, 15, 30)).toBe(false)
      expect(isValidTrim(5, 35, 30)).toBe(false)
      expect(isValidTrim(15, 15, 30)).toBe(false)
    })
  })

  describe('calculateTrimPercentage', () => {
    it('should calculate correct percentage', () => {
      expect(calculateTrimPercentage(5, 15, 30)).toBeCloseTo(33.33, 1)
    })

    it('should handle full clip', () => {
      expect(calculateTrimPercentage(0, 30, 30)).toBe(100)
    })

    it('should handle zero duration', () => {
      expect(calculateTrimPercentage(0, 0, 0)).toBe(0)
    })
  })

  describe('snapToSecond', () => {
    it('should round to nearest second', () => {
      expect(snapToSecond(5.4)).toBe(5)
      expect(snapToSecond(5.6)).toBe(6)
    })

    it('should handle exact seconds', () => {
      expect(snapToSecond(5)).toBe(5)
    })
  })

  describe('pixelToTrimPoint', () => {
    it('should convert pixels to time correctly', () => {
      // 100px = 1s, clip starts at x=0, trimStart=0
      expect(pixelToTrimPoint(500, 0, 100, 0)).toBe(5)
    })

    it('should account for clip start position', () => {
      // Clip starts at x=300, trimStart=0
      expect(pixelToTrimPoint(800, 300, 100, 0)).toBe(5)
    })

    it('should account for existing trim start', () => {
      // Clip starts at x=0, but already trimmed to start at 3s
      expect(pixelToTrimPoint(500, 0, 100, 3)).toBe(8)
    })
  })
})


