/**
 * Trim Utilities - Functions for handling video clip trimming
 */

export interface TrimValidationResult {
  valid: boolean
  trimStart: number
  trimEnd: number
  error?: string
}

/**
 * Validate trim points against clip duration
 */
export function validateTrimPoints(
  trimStart: number,
  trimEnd: number,
  clipDuration: number
): TrimValidationResult {
  // Check for negative trim start
  if (trimStart < 0) {
    return {
      valid: false,
      trimStart,
      trimEnd,
      error: 'Trim in-point cannot be negative',
    }
  }

  // Check if trim end exceeds duration
  if (trimEnd > clipDuration) {
    return {
      valid: false,
      trimStart,
      trimEnd,
      error: 'Trim out-point cannot exceed clip duration',
    }
  }

  // Check if in-point is after out-point
  if (trimStart >= trimEnd) {
    return {
      valid: false,
      trimStart,
      trimEnd,
      error: 'Trim in-point must be before out-point',
    }
  }

  return { valid: true, trimStart, trimEnd }
}

/**
 * Calculate effective duration after trimming
 */
export function calculateEffectiveDuration(trimStart: number, trimEnd: number): number {
  const duration = trimEnd - trimStart
  return duration > 0 ? duration : 0
}

/**
 * Constrain a trim point to valid bounds
 */
export function constrainTrimPoint(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Check if trim is valid without returning full result
 */
export function isValidTrim(trimStart: number, trimEnd: number, clipDuration: number): boolean {
  return validateTrimPoints(trimStart, trimEnd, clipDuration).valid
}

/**
 * Calculate trim percentage (how much of clip is trimmed)
 */
export function calculateTrimPercentage(trimStart: number, trimEnd: number, clipDuration: number): number {
  const effectiveDuration = calculateEffectiveDuration(trimStart, trimEnd)
  return clipDuration > 0 ? (effectiveDuration / clipDuration) * 100 : 0
}

/**
 * Snap trim point to nearest second (for UI convenience)
 */
export function snapToSecond(value: number): number {
  return Math.round(value)
}

/**
 * Convert pixel position on timeline to time value
 */
export function pixelToTrimPoint(
  pixelX: number,
  clipStartX: number,
  pixelsPerSecond: number,
  clipTrimStart: number
): number {
  const relativePixels = pixelX - clipStartX
  const relativeSeconds = relativePixels / pixelsPerSecond
  return clipTrimStart + relativeSeconds
}

