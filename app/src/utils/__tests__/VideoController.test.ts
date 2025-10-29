import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VideoController } from '../VideoController'

// Mock HTMLVideoElement
class MockVideoElement {
  src = ''
  currentTime = 0
  duration = 100
  paused = true
  ended = false
  volume = 1
  
  private listeners: { [key: string]: ((data?: unknown) => void)[] } = {}
  
  addEventListener(event: string, handler: (data?: unknown) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(handler)
  }
  
  removeEventListener(event: string, handler: (data?: unknown) => void) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(h => h !== handler)
    }
  }
  
  trigger(event: string, data?: unknown) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(handler => handler(data))
    }
  }
  
  play() {
    this.paused = false
    return Promise.resolve()
  }
  
  pause() {
    this.paused = true
  }
}

describe('VideoController', () => {
  let videoElement: MockVideoElement
  let controller: VideoController
  
  beforeEach(() => {
    videoElement = new MockVideoElement()
    controller = new VideoController(videoElement as unknown as HTMLVideoElement)
  })
  
  describe('load', () => {
    it('should load video source and resolve on loadedmetadata', async () => {
      const loadPromise = controller.load('/path/to/video.mp4')
      
      // Simulate metadata loaded
      videoElement.trigger('loadedmetadata')
      
      await expect(loadPromise).resolves.toBeUndefined()
      expect(videoElement.src).toBe('/path/to/video.mp4')
    })
    
    it('should reject on video load error', async () => {
      const loadPromise = controller.load('/path/to/invalid.mp4')
      
      // Simulate error
      videoElement.trigger('error')
      
      await expect(loadPromise).rejects.toThrow('Failed to load video')
    })
  })
  
  describe('play', () => {
    it('should start video playback', async () => {
      await controller.play()
      expect(videoElement.paused).toBe(false)
    })
  })
  
  describe('pause', () => {
    it('should pause video playback', async () => {
      await controller.play()
      controller.pause()
      expect(videoElement.paused).toBe(true)
    })
  })
  
  describe('seek', () => {
    it('should seek to specified time', () => {
      controller.seek(50)
      expect(videoElement.currentTime).toBe(50)
    })
    
    it('should handle negative seek values', () => {
      controller.seek(-10)
      expect(videoElement.currentTime).toBe(-10) // Browser handles clamping
    })
  })
  
  describe('getCurrentTime', () => {
    it('should return current playback time', () => {
      videoElement.currentTime = 42.5
      expect(controller.getCurrentTime()).toBe(42.5)
    })
  })
  
  describe('getDuration', () => {
    it('should return video duration', () => {
      videoElement.duration = 120
      expect(controller.getDuration()).toBe(120)
    })
  })
  
  describe('isPlaying', () => {
    it('should return true when video is playing', async () => {
      await controller.play()
      expect(controller.isPlaying()).toBe(true)
    })
    
    it('should return false when video is paused', () => {
      controller.pause()
      expect(controller.isPlaying()).toBe(false)
    })
    
    it('should return false when video has ended', () => {
      videoElement.paused = false
      videoElement.ended = true
      expect(controller.isPlaying()).toBe(false)
    })
  })
  
  describe('onUpdate', () => {
    it('should call callback on timeupdate event', () => {
      const callback = vi.fn()
      controller.onUpdate(callback)
      
      videoElement.currentTime = 10.5
      videoElement.trigger('timeupdate')
      
      expect(callback).toHaveBeenCalledWith(10.5)
    })
    
    it('should update callback when called multiple times', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      
      controller.onUpdate(callback1)
      controller.onUpdate(callback2)
      
      videoElement.currentTime = 5
      videoElement.trigger('timeupdate')
      
      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).toHaveBeenCalledWith(5)
    })
  })
  
  describe('onEnded', () => {
    it('should call callback when video ends', () => {
      const callback = vi.fn()
      controller.onEnded(callback)
      
      videoElement.trigger('ended')
      
      expect(callback).toHaveBeenCalled()
    })
  })
  
  describe('setVolume', () => {
    it('should set video volume', () => {
      controller.setVolume(0.5)
      expect(videoElement.volume).toBe(0.5)
    })
    
    it('should clamp volume to 0-1 range', () => {
      controller.setVolume(1.5)
      expect(videoElement.volume).toBe(1)
      
      controller.setVolume(-0.5)
      expect(videoElement.volume).toBe(0)
    })
  })
  
  describe('getVolume', () => {
    it('should return current volume', () => {
      videoElement.volume = 0.75
      expect(controller.getVolume()).toBe(0.75)
    })
  })
  
  describe('destroy', () => {
    it('should clean up video resources', () => {
      controller.destroy()
      
      expect(videoElement.paused).toBe(true)
      expect(videoElement.src).toBe('')
    })
    
    it('should clear callbacks after destroy', () => {
      const callback = vi.fn()
      controller.onUpdate(callback)
      controller.destroy()
      
      videoElement.trigger('timeupdate')
      expect(callback).not.toHaveBeenCalled()
    })
  })
})

