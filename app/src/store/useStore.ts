import { create } from 'zustand'
import type { Clip, TimelineClip, ExportProgress } from '../types'

interface AppState {
  // Clips
  clips: Clip[]
  timelineClips: TimelineClip[]
  selectedClipId: string | null
  
  // Playback
  isPlaying: boolean
  playheadPosition: number
  
  // Export
  exportProgress: ExportProgress
  
  // Actions
  addClip: (clip: Clip) => void
  removeClip: (id: string) => void
  addToTimeline: (clip: Clip) => void
  removeFromTimeline: (id: string) => void
  selectClip: (id: string | null) => void
  setPlayheadPosition: (position: number) => void
  setPlaying: (isPlaying: boolean) => void
  updateClipTrim: (id: string, trimStart: number, trimEnd: number) => void
  setExportProgress: (progress: Partial<ExportProgress>) => void
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  clips: [],
  timelineClips: [],
  selectedClipId: null,
  isPlaying: false,
  playheadPosition: 0,
  exportProgress: {
    percentage: 0,
    currentTime: 0,
    totalDuration: 0,
    isExporting: false,
  },
  
  // Actions
  addClip: (clip) =>
    set((state) => ({
      clips: [...state.clips, clip],
    })),
  
  removeClip: (id) =>
    set((state) => ({
      clips: state.clips.filter((c) => c.id !== id),
      timelineClips: state.timelineClips.filter((c) => c.id !== id),
      selectedClipId: state.selectedClipId === id ? null : state.selectedClipId,
    })),
  
  addToTimeline: (clip) =>
    set((state) => {
      // Calculate start time based on existing clips
      const startTime = state.timelineClips.reduce(
        (total, c) => total + (c.trimEnd - c.trimStart),
        0
      )
      
      const timelineClip: TimelineClip = {
        ...clip,
        startTime,
        trimStart: 0,
        trimEnd: clip.duration,
      }
      
      return {
        timelineClips: [...state.timelineClips, timelineClip],
      }
    }),
  
  removeFromTimeline: (id) =>
    set((state) => ({
      timelineClips: state.timelineClips.filter((c) => c.id !== id),
      selectedClipId: state.selectedClipId === id ? null : state.selectedClipId,
    })),
  
  selectClip: (id) =>
    set({ selectedClipId: id }),
  
  setPlayheadPosition: (position) =>
    set({ playheadPosition: position }),
  
  setPlaying: (isPlaying) =>
    set({ isPlaying }),
  
  updateClipTrim: (id, trimStart, trimEnd) =>
    set((state) => ({
      timelineClips: state.timelineClips.map((clip) =>
        clip.id === id ? { ...clip, trimStart, trimEnd } : clip
      ),
    })),
  
  setExportProgress: (progress) =>
    set((state) => ({
      exportProgress: { ...state.exportProgress, ...progress },
    })),
}))

