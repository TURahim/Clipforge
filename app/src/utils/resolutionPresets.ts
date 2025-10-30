export interface ResolutionPreset {
  label: string
  value: string
  width: number | null
  height: number | null
}

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { label: 'Source (Original)', value: 'source', width: null, height: null },
  { label: '4K (3840×2160)', value: '4k', width: 3840, height: 2160 },
  { label: '1080p (1920×1080)', value: '1080p', width: 1920, height: 1080 },
  { label: '720p (1280×720)', value: '720p', width: 1280, height: 720 },
  { label: '480p (854×480)', value: '480p', width: 854, height: 480 },
]

