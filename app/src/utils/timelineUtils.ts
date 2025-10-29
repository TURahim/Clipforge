import type { TimelineClip } from '../types';

export const BASE_PIXELS_PER_SECOND = 100; // 100px = 1 second at 1.0 zoom
export const MAX_ZOOM = 4.0; // Maximum zoom level
export const MIN_ZOOM = 0.25; // Minimum zoom level

/**
 * Calculate effective pixels per second based on zoom level
 */
export function getEffectivePPS(zoomLevel: number): number {
  return BASE_PIXELS_PER_SECOND * zoomLevel;
}
export const TIMELINE_HEIGHT = 100; // Height of each track in pixels
export const TRACK_HEIGHT = 80; // Height of individual track
export const TRACK_GAP = 10; // Gap between tracks
export const NUM_TRACKS = 2; // Number of tracks (0 = main, 1 = overlay)

/**
 * Safely extract duration from a clip, handling missing or invalid values
 */
export function safeDuration(c: { trimStart?: number; trimEnd?: number; duration?: number }): number {
  const start = Number.isFinite(c?.trimStart) ? Number(c.trimStart) : 0;
  const end = Number.isFinite(c?.trimEnd)
    ? Number(c.trimEnd)
    : Number.isFinite(c?.duration) ? Number(c.duration) : 0;
  return Math.max(0, end - start);
}

/**
 * Calculate the width of a clip in pixels based on its duration
 * Now NaN-safe
 */
export function calculateClipWidth(duration: number): number {
  const safeDur = Number.isFinite(duration) ? Number(duration) : 0;
  return Math.max(0, safeDur) * BASE_PIXELS_PER_SECOND;
}

/**
 * Calculate the X position of a clip on the timeline based on its index
 * Clips are placed sequentially, taking into account trim points
 * Now NaN-safe using safeDuration
 */
export function calculateClipPosition(clips: TimelineClip[], index: number): number {
  if (index === 0) return 0;
  
  let total = 0;
  for (let i = 0; i < index; i++) {
    total += safeDuration(clips[i]);
  }
  
  return secondsToPixels(total);
}

/**
 * Calculate the total duration of all clips on the timeline
 * Takes into account trim points for each clip
 * Now NaN-safe using safeDuration
 */
export function calculateTotalDuration(clips: TimelineClip[]): number {
  return clips.reduce((total, clip) => {
    return total + safeDuration(clip);
  }, 0);
}

/**
 * Convert pixels to seconds based on the timeline scale
 */
export function pixelsToSeconds(pixels: number): number {
  return pixels / BASE_PIXELS_PER_SECOND;
}

/**
 * Convert seconds to pixels based on the timeline scale
 */
export function secondsToPixels(seconds: number): number {
  return seconds * BASE_PIXELS_PER_SECOND;
}

/**
 * Format seconds as MM:SS for display
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generate time markers for the timeline (every 5 seconds)
 */
export function generateTimeMarkers(totalDuration: number): number[] {
  const markers: number[] = [];
  const interval = 5; // Show marker every 5 seconds
  
  for (let i = 0; i <= totalDuration; i += interval) {
    markers.push(i);
  }
  
  return markers;
}

/**
 * Calculate Y position for a given track number
 */
export function getTrackY(trackNumber: number): number {
  return trackNumber * (TRACK_HEIGHT + TRACK_GAP);
}

/**
 * Calculate track number from Y position
 */
export function getTrackFromY(y: number): number {
  const track = Math.floor(y / (TRACK_HEIGHT + TRACK_GAP));
  return Math.max(0, Math.min(NUM_TRACKS - 1, track));
}

