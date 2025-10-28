/**
 * VideoController - Abstraction layer for HTML5 video element
 * Keeps UI components dumb by centralizing video logic
 */
export class VideoController {
  private videoElement: HTMLVideoElement
  private onTimeUpdateCallback?: (time: number) => void
  private onEndedCallback?: () => void

  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement
    this.setupEventListeners()
  }

  private setupEventListeners() {
    // Time update event
    this.videoElement.addEventListener('timeupdate', () => {
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.videoElement.currentTime)
      }
    })

    // Ended event
    this.videoElement.addEventListener('ended', () => {
      if (this.onEndedCallback) {
        this.onEndedCallback()
      }
    })
  }

  /**
   * Load video source
   * @param src - File path or URL
   * @returns Promise that resolves when video metadata is loaded
   */
  load(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.videoElement.src = src
      
      const handleLoadedMetadata = () => {
        this.videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
        this.videoElement.removeEventListener('error', handleError)
        resolve()
      }
      
      const handleError = (e: Event) => {
        this.videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
        this.videoElement.removeEventListener('error', handleError)
        reject(new Error('Failed to load video'))
      }
      
      this.videoElement.addEventListener('loadedmetadata', handleLoadedMetadata)
      this.videoElement.addEventListener('error', handleError)
    })
  }

  /**
   * Play video
   * @returns Promise that resolves when playback starts
   */
  play(): Promise<void> {
    return this.videoElement.play()
  }

  /**
   * Pause video
   */
  pause(): void {
    this.videoElement.pause()
  }

  /**
   * Seek to specific time
   * @param seconds - Time in seconds
   */
  seek(seconds: number): void {
    this.videoElement.currentTime = seconds
  }

  /**
   * Get current playback time
   * @returns Current time in seconds
   */
  getCurrentTime(): number {
    return this.videoElement.currentTime
  }

  /**
   * Get total video duration
   * @returns Duration in seconds
   */
  getDuration(): number {
    return this.videoElement.duration
  }

  /**
   * Check if video is currently playing
   * @returns True if playing, false otherwise
   */
  isPlaying(): boolean {
    return !this.videoElement.paused && !this.videoElement.ended
  }

  /**
   * Register callback for time updates
   * @param callback - Function to call with current time
   */
  onUpdate(callback: (time: number) => void): void {
    this.onTimeUpdateCallback = callback
  }

  /**
   * Register callback for video ended event
   * @param callback - Function to call when video ends
   */
  onEnded(callback: () => void): void {
    this.onEndedCallback = callback
  }

  /**
   * Set playback volume
   * @param volume - Volume level (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.videoElement.volume = Math.max(0, Math.min(1, volume))
  }

  /**
   * Get current volume
   * @returns Volume level (0.0 to 1.0)
   */
  getVolume(): number {
    return this.videoElement.volume
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.pause()
    this.videoElement.src = ''
    this.onTimeUpdateCallback = undefined
    this.onEndedCallback = undefined
  }
}

