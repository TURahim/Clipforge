import { describe, it, expect } from 'vitest';
import {
  PIXELS_PER_SECOND,
  calculateClipWidth,
  calculateClipPosition,
  calculateTotalDuration,
  pixelsToSeconds,
  secondsToPixels,
  formatTime,
  generateTimeMarkers,
} from '../timelineUtils';
import type { TimelineClip } from '../../types';

describe('timelineUtils', () => {
  describe('calculateClipWidth', () => {
    it('should calculate width correctly for various durations', () => {
      expect(calculateClipWidth(10)).toBe(1000); // 10s = 1000px
      expect(calculateClipWidth(30)).toBe(3000); // 30s = 3000px
      expect(calculateClipWidth(0.5)).toBe(50);  // 0.5s = 50px
    });

    it('should return 0 for zero duration', () => {
      expect(calculateClipWidth(0)).toBe(0);
    });
  });

  describe('calculateClipPosition', () => {
    const mockClips: TimelineClip[] = [
      {
        id: '1',
        filePath: '/test1.mp4',
        filename: 'test1.mp4',
        duration: 30,
        thumbnail: 'data:image/png;base64,test',
        metadata: { width: 1920, height: 1080, codec: 'h264' },
        startTime: 0,
        trimStart: 0,
        trimEnd: 30,
      },
      {
        id: '2',
        filePath: '/test2.mp4',
        filename: 'test2.mp4',
        duration: 20,
        thumbnail: 'data:image/png;base64,test',
        metadata: { width: 1920, height: 1080, codec: 'h264' },
        startTime: 30,
        trimStart: 0,
        trimEnd: 20,
      },
      {
        id: '3',
        filePath: '/test3.mp4',
        filename: 'test3.mp4',
        duration: 15,
        thumbnail: 'data:image/png;base64,test',
        metadata: { width: 1920, height: 1080, codec: 'h264' },
        startTime: 50,
        trimStart: 0,
        trimEnd: 15,
      },
    ];

    it('should return 0 for first clip', () => {
      expect(calculateClipPosition(mockClips, 0)).toBe(0);
    });

    it('should calculate position for second clip', () => {
      // First clip is 30s, so second clip starts at 30 * 100 = 3000px
      expect(calculateClipPosition(mockClips, 1)).toBe(3000);
    });

    it('should calculate position for third clip', () => {
      // First clip: 30s, second clip: 20s = 50s total * 100 = 5000px
      expect(calculateClipPosition(mockClips, 2)).toBe(5000);
    });

    it('should handle trimmed clips', () => {
      const trimmedClips: TimelineClip[] = [
        {
          ...mockClips[0],
          trimStart: 5,
          trimEnd: 25, // Effective duration: 20s
        },
        {
          ...mockClips[1],
          trimStart: 0,
          trimEnd: 10, // Effective duration: 10s
        },
      ];

      expect(calculateClipPosition(trimmedClips, 1)).toBe(2000); // 20s * 100 = 2000px
    });
  });

  describe('calculateTotalDuration', () => {
    it('should calculate total duration of untrimmed clips', () => {
      const clips: TimelineClip[] = [
        {
          id: '1',
          filePath: '/test1.mp4',
          filename: 'test1.mp4',
          duration: 10,
          thumbnail: '',
          metadata: { width: 1920, height: 1080, codec: 'h264' },
          startTime: 0,
          trimStart: 0,
          trimEnd: 10,
        },
        {
          id: '2',
          filePath: '/test2.mp4',
          filename: 'test2.mp4',
          duration: 15,
          thumbnail: '',
          metadata: { width: 1920, height: 1080, codec: 'h264' },
          startTime: 10,
          trimStart: 0,
          trimEnd: 15,
        },
      ];

      expect(calculateTotalDuration(clips)).toBe(25); // 10 + 15 = 25s
    });

    it('should calculate total duration with trimmed clips', () => {
      const clips: TimelineClip[] = [
        {
          id: '1',
          filePath: '/test1.mp4',
          filename: 'test1.mp4',
          duration: 30,
          thumbnail: '',
          metadata: { width: 1920, height: 1080, codec: 'h264' },
          startTime: 0,
          trimStart: 5,
          trimEnd: 15, // Effective: 10s
        },
        {
          id: '2',
          filePath: '/test2.mp4',
          filename: 'test2.mp4',
          duration: 20,
          thumbnail: '',
          metadata: { width: 1920, height: 1080, codec: 'h264' },
          startTime: 10,
          trimStart: 2,
          trimEnd: 12, // Effective: 10s
        },
      ];

      expect(calculateTotalDuration(clips)).toBe(20); // 10 + 10 = 20s
    });

    it('should return 0 for empty timeline', () => {
      expect(calculateTotalDuration([])).toBe(0);
    });
  });

  describe('pixelsToSeconds', () => {
    it('should convert pixels to seconds correctly', () => {
      expect(pixelsToSeconds(100)).toBe(1);
      expect(pixelsToSeconds(500)).toBe(5);
      expect(pixelsToSeconds(1000)).toBe(10);
      expect(pixelsToSeconds(50)).toBe(0.5);
    });
  });

  describe('secondsToPixels', () => {
    it('should convert seconds to pixels correctly', () => {
      expect(secondsToPixels(1)).toBe(100);
      expect(secondsToPixels(5)).toBe(500);
      expect(secondsToPixels(10)).toBe(1000);
      expect(secondsToPixels(0.5)).toBe(50);
    });
  });

  describe('formatTime', () => {
    it('should format time as MM:SS', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(5)).toBe('0:05');
      expect(formatTime(59)).toBe('0:59');
      expect(formatTime(60)).toBe('1:00');
      expect(formatTime(90)).toBe('1:30');
      expect(formatTime(125)).toBe('2:05');
      expect(formatTime(3661)).toBe('61:01');
    });

    it('should handle fractional seconds', () => {
      expect(formatTime(5.7)).toBe('0:05');
      expect(formatTime(90.9)).toBe('1:30');
    });
  });

  describe('generateTimeMarkers', () => {
    it('should generate markers at 5-second intervals', () => {
      const markers = generateTimeMarkers(20);
      expect(markers).toEqual([0, 5, 10, 15, 20]);
    });

    it('should handle durations not divisible by 5', () => {
      const markers = generateTimeMarkers(17);
      expect(markers).toEqual([0, 5, 10, 15]);
    });

    it('should handle zero duration', () => {
      const markers = generateTimeMarkers(0);
      expect(markers).toEqual([0]);
    });

    it('should handle very long durations', () => {
      const markers = generateTimeMarkers(60);
      expect(markers).toEqual([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]);
    });
  });
});

