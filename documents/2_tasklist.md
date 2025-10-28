# ClipForge - Day 2 MVP Core Features

## Context Capsule

**ClipForge** is a desktop video editing application built with Electron, React, and TypeScript. This document covers **Day 2 (Tuesday, Oct 28)** MVP core features including the canvas-based timeline, video player, trim functionality, export pipeline, and app packaging.

**What This Document Contains:**
- PR #4: Timeline UI with React-Konva (canvas timeline with drag-and-drop)
- PR #5: Video Player & Playback Controls (HTML5 video with sync)
- PR #6: Trim Functionality (drag handles + Set In/Out buttons)
- PR #7: Export Pipeline with Progress (single/multiple clips, FFmpeg concat)
- PR #8: App Packaging & MVP Testing (electron-builder, distributable creation)

**Prerequisites:** Complete Day 1 setup (PR #1-3) from [1_tasklist.md](./1_tasklist.md) before starting Day 2.

**Key Technologies:**
- React-Konva for canvas-based timeline
- HTML5 video with custom VideoController class
- FFmpeg for export pipeline with progress tracking
- Electron-builder for packaging

**Cross-References:**
- [1_tasklist.md](./1_tasklist.md) - Day 1 Foundation & Setup
- [3_tasklist.md](./3_tasklist.md) - Day 3 Polish & Final Submission
- [4_tasklist.md](./4_tasklist.md) - Additional Resources & Workflow

**MVP Deadline:** Tuesday, Oct 28 at 10:59 PM CT

---

## Day 2 - MVP Core Features (Tuesday, Oct 28)

### PR #4: Timeline UI with React-Konva
**Branch:** `feat/timeline`  
**Priority:** Critical (MVP Required)  
**Estimated Time:** 3-4 hours  
**Status:** [ ] Not Started

**Description:** Build interactive timeline using React-Konva canvas. Support dragging clips from media library onto timeline.

#### Tasks:
- [ ] Create Timeline component with Konva Stage
- [ ] Define PIXELS_PER_SECOND constant (e.g., 100 px/s)
- [ ] Define MAX_ZOOM constant for Day 2 (e.g., 2x)
- [ ] Add time markers (0s, 5s, 10s, etc.)
- [ ] Create clip rectangles on canvas with width = duration * PPS
- [ ] Implement drag-and-drop from MediaLibrary to Timeline
- [ ] Implement clip selection (click to select)
- [ ] Add playhead line (vertical indicator)
- [ ] Calculate clip positions based on time
- [ ] Handle multiple clips in sequence
- [ ] Add visual feedback (hover, selected states)
- [ ] Store timeline clips in Zustand
- [ ] **Avoid implementing zoom/scroll for MVP** (Day 3 feature)
- [ ] Keep timeline fixed scale for Day 2

#### Files Created:
```
📄 src/components/Timeline.tsx
📄 src/components/ui/Button.tsx
📄 src/utils/timelineUtils.ts
📄 src/utils/__tests__/timeline.test.ts
```

#### Files Modified:
```
📝 src/store/useStore.ts (add timeline state and actions)
📝 src/types/index.ts (add TimelineClip type)
📝 src/App.tsx (add Timeline component)
```

#### Key Features:
- [ ] Horizontal timeline with time axis
- [ ] Drag clip from library → drop on timeline
- [ ] Clips appear as rectangles with correct duration
- [ ] Click clip to select (highlight)
- [ ] Multiple clips arrange sequentially
- [ ] Playhead visible at current time position

#### Timeline Constants & Width Calculation:

**Define constants:**
```typescript
// src/components/Timeline.tsx
const PIXELS_PER_SECOND = 100; // 100px = 1 second
const MAX_ZOOM = 2; // For future zoom feature (Day 3)
const TIMELINE_HEIGHT = 100; // px
```

**Calculate clip width:**
```typescript
// Clip width based on duration
const clipWidth = clip.duration * PIXELS_PER_SECOND;

// Example: 30s clip = 30 * 100 = 3000px wide
```

**Calculate clip position:**
```typescript
// Clips are placed sequentially
let xPosition = 0;
timelineClips.forEach((clip, index) => {
  if (index > 0) {
    const prevClip = timelineClips[index - 1];
    const prevDuration = prevClip.trimEnd - prevClip.trimStart;
    xPosition += prevDuration * PIXELS_PER_SECOND;
  }
  
  clip.x = xPosition;
});
```

**Note:** Zoom and horizontal scroll are intentionally **not implemented for MVP**. Timeline is fixed scale at 100px/s. These can be added on Day 3 if time permits.

#### Validation:
- [ ] Import 3 clips
- [ ] Drag first clip onto timeline
- [ ] Drag second clip onto timeline (appears after first)
- [ ] Drag third clip onto timeline
- [ ] Click each clip - selection highlights correctly
- [ ] Timeline shows correct total duration
- [ ] **Run unit tests: `pnpm test timeline`**

---

### Unit Tests for PR #4

Create test file: `src/utils/__tests__/timeline.test.ts`

**What to test:**
1. **Clip width calculation** - duration × PPS
2. **Clip position calculation** - Sequential positioning
3. **Total timeline duration** - Sum of all clip durations
4. **Pixels to time conversion** - For playhead positioning

**Implementation file:** `src/utils/timelineUtils.ts`

```typescript
// src/utils/timelineUtils.ts
import type { TimelineClip } from '../types';

export const PIXELS_PER_SECOND = 100;
export const MAX_ZOOM = 2; // For future use

export function calculateClipWidth(duration: number): number {
  return duration * PIXELS_PER_SECOND;
}

export function calculateClipPosition(clips: TimelineClip[], index: number): number {
  if (index === 0) return 0;
  
  let position = 0;
  for (let i = 0; i < index; i++) {
    const clip = clips[i];
    const effectiveDuration = clip.trimEnd - clip.trimStart;
    position += effectiveDuration * PIXELS_PER_SECOND;
  }
  
  return position;
}

export function calculateTotalDuration(clips: TimelineClip[]): number {
  return clips.reduce((total, clip) => {
    const effectiveDuration = clip.trimEnd - clip.trimStart;
    return total + effectiveDuration;
  }, 0);
}

export function pixelsToSeconds(pixels: number): number {
  return pixels / PIXELS_PER_SECOND;
}

export function secondsToPixels(seconds: number): number {
  return seconds * PIXELS_PER_SECOND;
}
```

**Run tests:**
```bash
pnpm test timeline
```

**Why these tests matter:**
- Wrong clip width calculation = visual timeline bugs
- Wrong positioning = clips overlap or have gaps
- These are pure functions (easy to test, no side effects)
- Catch off-by-one errors in pixel/time conversions

---

### PR #5: Video Player & Playback Controls
**Branch:** `feat/video-player`  
**Priority:** Critical (MVP Required)  
**Estimated Time:** 2-3 hours  
**Status:** [ ] Not Started

**Description:** Implement HTML5 video player with play/pause controls. Sync playhead with video playback.

#### Tasks:
- [ ] Create VideoPlayer component (dumb UI)
- [ ] Create VideoController abstraction class
- [ ] Implement VideoController.load(src: string)
- [ ] Implement VideoController.play()
- [ ] Implement VideoController.pause()
- [ ] Implement VideoController.seek(seconds: number)
- [ ] Implement VideoController.getCurrentTime()
- [ ] Sync video currentTime with playhead position in store
- [ ] Update playhead on timeupdate event
- [ ] Handle video src switching for different clips
- [ ] Display current time and total duration
- [ ] Handle end of video playback
- [ ] Implement basic playback UI controls (play/pause button)

#### Files Created:
```
📄 src/components/VideoPlayer.tsx
📄 src/utils/VideoController.ts
📄 src/utils/__tests__/VideoController.test.ts
```

#### Files Modified:
```
📝 src/store/useStore.ts (add playback state)
📝 src/App.tsx (add VideoPlayer component)
📝 src/components/Timeline.tsx (sync with playhead)
```

#### Key Features:
- [ ] Video preview window
- [ ] Play button starts playback
- [ ] Pause button stops playback
- [ ] Video syncs with timeline playhead
- [ ] Playhead moves during playback
- [ ] Audio plays synchronized with video
- [ ] Displays current time (MM:SS)

#### VideoController Interface:

**Keep UI dumb** - All video logic lives in VideoController class:

```typescript
// src/utils/VideoController.ts
export class VideoController {
  private videoElement: HTMLVideoElement;
  private onTimeUpdate: (time: number) => void;
  
  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
  }
  
  // Load video source
  load(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.videoElement.src = src;
      this.videoElement.onloadedmetadata = () => resolve();
      this.videoElement.onerror = reject;
    });
  }
  
  // Play video
  play(): Promise<void> {
    return this.videoElement.play();
  }
  
  // Pause video
  pause(): void {
    this.videoElement.pause();
  }
  
  // Seek to specific time (seconds)
  seek(seconds: number): void {
    this.videoElement.currentTime = seconds;
  }
  
  // Get current playback time
  getCurrentTime(): number {
    return this.videoElement.currentTime;
  }
  
  // Get total duration
  getDuration(): number {
    return this.videoElement.duration;
  }
  
  // Register time update callback
  onUpdate(callback: (time: number) => void): void {
    this.onTimeUpdate = callback;
    this.videoElement.ontimeupdate = () => {
      callback(this.videoElement.currentTime);
    };
  }
}
```

**Usage in VideoPlayer component:**
```typescript
// src/components/VideoPlayer.tsx
const videoRef = useRef<HTMLVideoElement>(null);
const controllerRef = useRef<VideoController>();
const setPlayheadPosition = useStore(state => state.setPlayheadPosition);

useEffect(() => {
  if (videoRef.current) {
    controllerRef.current = new VideoController(videoRef.current);
    controllerRef.current.onUpdate((time) => {
      setPlayheadPosition(time); // Update Zustand store
    });
  }
}, []);

const handlePlay = () => controllerRef.current?.play();
const handlePause = () => controllerRef.current?.pause();
```

**Why this matters:**
- Video logic is isolated and testable
- UI component stays simple (just buttons and display)
- Easy to swap video implementations later
- Playhead sync is centralized in one place

#### Validation:
- [ ] Import clip and add to timeline
- [ ] Click play - video plays
- [ ] Playhead moves smoothly during playback
- [ ] Click pause - video stops
- [ ] Audio is synchronized
- [ ] Click different position on timeline - video seeks
- [ ] Playback works with multiple clips in sequence
- [ ] **Run unit tests: `pnpm test VideoController`**

---

### PR #6: Trim Functionality
**Branch:** `feat/trim`  
**Priority:** Critical (MVP Required)  
**Estimated Time:** 2-3 hours  
**Status:** [ ] Not Started

**Description:** Implement trim functionality with in/out points. Allow users to set start and end points for clips.

#### Tasks:
- [ ] Add trim UI controls (Set In / Set Out buttons for keyboard-free users)
- [ ] Add drag handles on Konva clip rectangles (left/right edges)
- [ ] Update store to track trim points per clip (trimStart, trimEnd)
- [ ] Implement drag handle interaction on Konva
- [ ] Add visual trim indicators on timeline (darkened regions)
- [ ] Update playback to respect trim points
- [ ] Display trimmed duration vs original duration
- [ ] Handle edge cases (in > out, invalid points)
- [ ] Update preview to show trimmed portion only
- [ ] Add reset trim functionality
- [ ] Sync trim handles with Set In/Out buttons

#### Files Created:
```
📄 src/components/TrimControls.tsx (or add to ExportControls)
📄 src/utils/trimUtils.ts
📄 src/utils/__tests__/trim.test.ts
```

#### Files Modified:
```
📝 src/store/useStore.ts (add trim points to TimelineClip)
📝 src/types/index.ts (update TimelineClip interface)
📝 src/components/Timeline.tsx (render trim markers)
📝 src/components/VideoPlayer.tsx (respect trim bounds)
📝 src/utils/VideoController.ts (handle trim logic)
```

#### Key Features:
- [ ] Select clip on timeline
- [ ] **Method 1 (Drag handles):** Drag left edge to set in-point, drag right edge to set out-point
- [ ] **Method 2 (Buttons):** Move playhead, click "Set In" or "Set Out" button
- [ ] Timeline shows trim indicators (darkened/grayed out trimmed portions)
- [ ] Preview plays only trimmed portion
- [ ] Display: "Original: 30s | Trimmed: 10s"

#### Trim Implementation: Drag Handles on Konva

**Visual design:**
```
┌────────────────────────────────────┐
│▓▓▓▓│   Visible Clip   │▓▓▓▓▓▓▓▓▓▓│  <- Timeline clip rectangle
│    │                  │            │
│ In │    (Play zone)   │   Out      │  <- Trim handles
│Handle                 Handle       │
└────────────────────────────────────┘
```

**Konva implementation:**
```typescript
// src/components/Timeline.tsx
import { Rect, Group } from 'react-konva';

// Clip rectangle with trim handles
<Group>
  {/* Trimmed-out region (left) */}
  <Rect
    x={clip.x}
    y={trackY}
    width={clip.trimStart * PIXELS_PER_SECOND}
    height={TIMELINE_HEIGHT}
    fill="rgba(0,0,0,0.5)"  // Darkened
  />
  
  {/* Active/visible region */}
  <Rect
    x={clip.x + (clip.trimStart * PIXELS_PER_SECOND)}
    y={trackY}
    width={(clip.trimEnd - clip.trimStart) * PIXELS_PER_SECOND}
    height={TIMELINE_HEIGHT}
    fill="#4A90E2"
    onClick={() => selectClip(clip.id)}
  />
  
  {/* Trimmed-out region (right) */}
  <Rect
    x={clip.x + (clip.trimEnd * PIXELS_PER_SECOND)}
    y={trackY}
    width={(clip.duration - clip.trimEnd) * PIXELS_PER_SECOND}
    height={TIMELINE_HEIGHT}
    fill="rgba(0,0,0,0.5)"  // Darkened
  />
  
  {/* Left trim handle (in-point) */}
  <Rect
    x={clip.x + (clip.trimStart * PIXELS_PER_SECOND) - 5}
    y={trackY}
    width={10}
    height={TIMELINE_HEIGHT}
    fill="#FFA500"
    draggable
    dragBoundFunc={(pos) => {
      // Constrain to clip bounds
      const minX = clip.x;
      const maxX = clip.x + (clip.trimEnd * PIXELS_PER_SECOND) - 10;
      return { x: Math.max(minX, Math.min(maxX, pos.x)), y: pos.y };
    }}
    onDragEnd={(e) => {
      const newTrimStart = (e.target.x() - clip.x) / PIXELS_PER_SECOND;
      updateClipTrim(clip.id, { trimStart: newTrimStart });
    }}
  />
  
  {/* Right trim handle (out-point) */}
  <Rect
    x={clip.x + (clip.trimEnd * PIXELS_PER_SECOND) - 5}
    y={trackY}
    width={10}
    height={TIMELINE_HEIGHT}
    fill="#FFA500"
    draggable
    dragBoundFunc={(pos) => {
      const minX = clip.x + (clip.trimStart * PIXELS_PER_SECOND) + 10;
      const maxX = clip.x + (clip.duration * PIXELS_PER_SECOND);
      return { x: Math.max(minX, Math.min(maxX, pos.x)), y: pos.y };
    }}
    onDragEnd={(e) => {
      const newTrimEnd = (e.target.x() - clip.x) / PIXELS_PER_SECOND;
      updateClipTrim(clip.id, { trimEnd: newTrimEnd });
    }}
  />
</Group>
```

**Button method (for keyboard-free users):**
```typescript
// Buttons in ExportControls or TrimControls
<button onClick={() => {
  const playheadTime = playheadPosition;
  const clipStartTime = clip.startTime; // Position on timeline
  const trimPoint = playheadTime - clipStartTime;
  updateClipTrim(selectedClipId, { trimStart: trimPoint });
}}>
  Set In Point
</button>

<button onClick={() => {
  const playheadTime = playheadPosition;
  const clipStartTime = clip.startTime;
  const trimPoint = playheadTime - clipStartTime;
  updateClipTrim(selectedClipId, { trimEnd: trimPoint });
}}>
  Set Out Point
</button>
```

**Why both methods?**
- Drag handles: Fast, visual, intuitive for mouse users
- Set In/Out buttons: Precise, accessible, works for keyboard users
- Both methods update the same Zustand state

#### Validation:
- [ ] Import 30s video
- [ ] Add to timeline
- [ ] Set in-point at 5s (using drag handle or button)
- [ ] Set out-point at 15s (using drag handle or button)
- [ ] Preview plays 10s trimmed clip (5s-15s)
- [ ] Timeline visually shows trim region
- [ ] Export will use trimmed portion
- [ ] **Run unit tests: `pnpm test trim`**

---

### Unit Tests for PR #6

Create test file: `src/utils/__tests__/trim.test.ts`

**Implementation file:** `src/utils/trimUtils.ts`

```typescript
// src/utils/trimUtils.ts
export interface TrimValidationResult {
  valid: boolean;
  trimStart: number;
  trimEnd: number;
  error?: string;
}

export function validateTrimPoints(
  trimStart: number,
  trimEnd: number,
  clipDuration: number
): TrimValidationResult {
  if (trimStart < 0) {
    return {
      valid: false,
      trimStart,
      trimEnd,
      error: 'Trim in-point cannot be negative'
    };
  }
  
  if (trimEnd > clipDuration) {
    return {
      valid: false,
      trimStart,
      trimEnd,
      error: 'Trim out-point cannot exceed clip duration'
    };
  }
  
  if (trimStart >= trimEnd) {
    return {
      valid: false,
      trimStart,
      trimEnd,
      error: 'Trim in-point must be before out-point'
    };
  }
  
  return { valid: true, trimStart, trimEnd };
}

export function calculateEffectiveDuration(trimStart: number, trimEnd: number): number {
  const duration = trimEnd - trimStart;
  return duration > 0 ? duration : 0;
}

export function constrainTrimPoint(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function isValidTrim(trimStart: number, trimEnd: number, clipDuration: number): boolean {
  return validateTrimPoints(trimStart, trimEnd, clipDuration).valid;
}
```

**Run tests:**
```bash
pnpm test trim
```

**Why these tests matter:**
- Trim validation prevents invalid states (in > out, negative values)
- Edge cases are critical (what if user drags handle past bounds?)
- Tests document valid trim behavior
- Prevents bugs in timeline rendering (invalid trim = visual glitches)

---

### PR #7: Export Pipeline with Progress
**Branch:** `feat/export`  
**Priority:** Critical (MVP Required)  
**Estimated Time:** 2-3 hours  
**Status:** [ ] Not Started

**Description:** Implement full export pipeline. Handle single and multiple clips with trim points. Show real-time progress.

#### Tasks:
- [ ] Create ExportControls component
- [ ] **Phase 1:** Build FFmpeg command for single-clip trimmed export
- [ ] Test single-clip trimmed export thoroughly
- [ ] **Phase 2:** Build FFmpeg command for multiple-clip concatenation
- [ ] Generate filelist.txt in temp directory (os.tmpdir())
- [ ] Use `-safe 0` flag for concat demuxer
- [ ] Parse FFmpeg progress from stderr
- [ ] Display progress bar with percentage
- [ ] Add file save dialog
- [ ] Handle export success/error states
- [ ] Clean up temp files after export
- [ ] Test with single trimmed clip
- [ ] Test with multiple clips in sequence

#### Files Created:
```
📄 src/components/ExportControls.tsx
📄 src/components/ui/ProgressBar.tsx
📄 src/utils/exportUtils.ts
📄 src/utils/__tests__/export.test.ts
```

#### Files Modified:
```
📝 electron/handlers/ffmpeg.handler.ts (add export logic)
📝 src/utils/ffmpeg.ts (build export commands)
📝 src/store/useStore.ts (add export progress state)
📝 src/App.tsx (add ExportControls)
```

#### Export Implementation (2-Phase Approach):

**Phase 1: Single-Clip Trimmed Export**

Start with this to validate the export pipeline:

```typescript
// electron/handlers/ffmpeg.handler.ts
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

async function exportSingleClip(clip: TimelineClip, outputPath: string) {
  const args = [
    '-ss', clip.trimStart.toString(),          // Start time
    '-i', clip.filePath,                        // Input file
    '-t', (clip.trimEnd - clip.trimStart).toString(), // Duration
    '-c:v', 'libx264',                          // Video codec
    '-c:a', 'aac',                              // Audio codec
    '-strict', 'experimental',
    outputPath
  ];
  
  const ffmpeg = spawn(ffmpegPath!, args);
  
  // Parse progress from stderr
  ffmpeg.stderr.on('data', (data) => {
    const output = data.toString();
    const timeMatch = output.match(/time=(\d+):(\d+):(\d+\.\d+)/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const seconds = parseFloat(timeMatch[3]);
      const currentTime = hours * 3600 + minutes * 60 + seconds;
      const totalDuration = clip.trimEnd - clip.trimStart;
      const progress = (currentTime / totalDuration) * 100;
      
      // Send progress to renderer
      mainWindow.webContents.send('export-progress', progress);
    }
  });
  
  return new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      code === 0 ? resolve(outputPath) : reject(new Error('Export failed'));
    });
  });
}
```

**Phase 2: Multiple-Clip Concatenation**

After single-clip export works, add concatenation:

```typescript
import { tmpdir } from 'os';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

async function exportMultipleClips(clips: TimelineClip[], outputPath: string) {
  // Step 1: Create temp directory path
  const tempDir = tmpdir();
  const filelistPath = join(tempDir, `clipforge-${Date.now()}.txt`);
  
  // Step 2: Generate filelist.txt
  const filelistContent = clips.map(clip => {
    // If clip is trimmed, create temp trimmed file first
    // Or use complex filter (more advanced)
    return `file '${clip.filePath}'`;
  }).join('\n');
  
  writeFileSync(filelistPath, filelistContent, 'utf-8');
  
  // Step 3: Run FFmpeg concat
  const args = [
    '-f', 'concat',
    '-safe', '0',              // IMPORTANT: Allow absolute paths
    '-i', filelistPath,
    '-c:v', 'libx264',
    '-c:a', 'aac',
    outputPath
  ];
  
  const ffmpeg = spawn(ffmpegPath!, args);
  
  // ... progress parsing (same as Phase 1)
  
  // Step 4: Clean up temp file
  ffmpeg.on('close', () => {
    try {
      unlinkSync(filelistPath);
    } catch (err) {
      console.error('Failed to clean up temp filelist', err);
    }
  });
}
```

**Important: `-safe 0` flag**
- Without `-safe 0`, FFmpeg rejects absolute file paths for security
- With `-safe 0`, FFmpeg allows absolute paths (required for our use case)
- This is safe because we control the file paths (user's imported videos)

#### Validation:
- [ ] Export single untrimmed clip - success
- [ ] Export single trimmed clip - only trimmed portion in output
- [ ] Export multiple clips - concatenated correctly
- [ ] Export 2min video - progress updates smoothly
- [ ] Exported MP4 plays in VLC/QuickTime
- [ ] Audio synchronized in exported video
- [ ] Test export of 3 clips: 10s + 15s + 20s = 45s total
- [ ] **Run unit tests: `pnpm test export`**

---

### Unit Tests for PR #7

Create test file: `src/utils/__tests__/export.test.ts`

**Implementation file:** `src/utils/exportUtils.ts`

```typescript
// src/utils/exportUtils.ts
import { tmpdir } from 'os';
import { join } from 'path';
import type { TimelineClip } from '../types';

export function buildSingleClipExportCommand(
  clip: TimelineClip,
  outputPath: string
): string[] {
  const args: string[] = [];
  
  // Add trim if needed
  if (clip.trimStart > 0) {
    args.push('-ss', clip.trimStart.toString());
  }
  
  args.push('-i', clip.filePath);
  
  // Add duration if trimmed
  if (clip.trimEnd < clip.duration) {
    const duration = clip.trimEnd - clip.trimStart;
    args.push('-t', duration.toString());
  }
  
  // Codecs
  args.push('-c:v', 'libx264');
  args.push('-c:a', 'aac');
  
  // Output
  args.push(outputPath);
  
  return args;
}

export function buildConcatExportCommand(
  filelistPath: string,
  outputPath: string
): string[] {
  return [
    '-f', 'concat',
    '-safe', '0',
    '-i', filelistPath,
    '-c:v', 'libx264',
    '-c:a', 'aac',
    outputPath
  ];
}

export function generateFilelistContent(clips: TimelineClip[]): string {
  return clips
    .map(clip => `file '${clip.filePath}'`)
    .join('\n');
}

export function parseTempFilePath(): string {
  const timestamp = Date.now();
  return join(tmpdir(), `clipforge-${timestamp}.txt`);
}

export function parseExportProgress(stderr: string, totalDuration: number): number {
  const match = stderr.match(/time=(\d+):(\d+):(\d+\.\d+)/);
  if (!match) return 0;
  
  const hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const seconds = parseFloat(match[3]);
  const currentTime = hours * 3600 + minutes * 60 + seconds;
  
  const percentage = (currentTime / totalDuration) * 100;
  return Math.min(Math.round(percentage), 100);
}
```

**Run tests:**
```bash
pnpm test export
```

**Why these tests matter:**
- FFmpeg command building is critical - wrong args = export fails
- Filelist generation must be exact format or concat fails
- Progress parsing affects user experience (accurate progress bar)
- Tests catch platform-specific path issues (Windows vs Mac/Linux)
- No external dependencies = fast, reliable tests

---

### PR #8: App Packaging & MVP Testing
**Branch:** `feat/packaging`  
**Priority:** Critical (MVP Required)  
**Estimated Time:** 2-3 hours  
**Status:** [ ] Not Started

**Description:** Configure electron-builder and create packaged distributable. Test on real hardware (not dev mode).

#### Tasks:
- [ ] Configure electron-builder in package.json
- [ ] Set appId: "com.clipforge.app"
- [ ] Set productName: "ClipForge"
- [ ] Create app icons (icon.png, icon.icns, icon.ico)
- [ ] Set up build scripts
- [ ] Include FFmpeg binary in packaged app (extraResources)
- [ ] Build distributable (DMG for Mac, EXE for Windows)
- [ ] Test packaged app on clean machine
- [ ] Verify all features work in production build
- [ ] Fix any packaging-specific issues
- [ ] Create release notes

#### electron-builder Configuration:
```json
{
  "build": {
    "appId": "com.clipforge.app",
    "productName": "ClipForge",
    "files": [
      "dist/**/*",
      "dist-electron/**/*",
      "node_modules/**/*"
    ],
    "extraResources": [
      {
        "from": "node_modules/ffmpeg-static",
        "to": "ffmpeg-static",
        "filter": ["**/*"]
      }
    ],
    "mac": {
      "target": {
        "target": "dmg",
        "arch": ["x64", "arm64"]
      },
      "icon": "build/icon.icns",
      "category": "public.app-category.video"
    },
    "win": {
      "target": "nsis",
      "icon": "build/icon.ico"
    },
    "linux": {
      "target": "AppImage",
      "icon": "build/icon.png",
      "category": "Video"
    }
  }
}
```

#### Build Commands:
```bash
# Build for production
pnpm build

# Package app for macOS
pnpm package:mac

# Package app for Windows
pnpm package:win

# Test packaged app
# macOS: open dist/ClipForge.dmg
# Windows: run dist/ClipForge Setup.exe
```

#### MVP Validation Checklist:
- [ ] ✅ **Run all unit tests: `pnpm test:run`** (all tests must pass)
- [ ] ✅ App launches from packaged binary (not dev mode)
- [ ] ✅ Import MP4 file via file picker
- [ ] ✅ Import MOV file via file picker  
- [ ] ✅ Drag and drop video file
- [ ] ✅ Clip appears in media library with thumbnail and duration
- [ ] ✅ Drag clip onto timeline
- [ ] ✅ Click play - video plays in preview
- [ ] ✅ Click pause - video stops
- [ ] ✅ Select clip on timeline
- [ ] ✅ Set in-point (trim start)
- [ ] ✅ Set out-point (trim end)
- [ ] ✅ Preview shows trimmed portion
- [ ] ✅ Click export button
- [ ] ✅ Choose save location
- [ ] ✅ Export progress shows
- [ ] ✅ Export completes successfully
- [ ] ✅ Exported MP4 exists on disk
- [ ] ✅ Exported video plays in VLC/QuickTime
- [ ] ✅ Exported video contains only trimmed portion
- [ ] ✅ Audio synchronized in exported video
- [ ] ✅ Test with multiple clips (3 clips in sequence)
- [ ] ✅ App launch time under 5 seconds
- [ ] ✅ No memory leaks during 15min session

**MVP SUBMISSION - TUESDAY 10:59 PM CT**

---

## Post-MVP Notes

### Code Signing & Notarization (Post-MVP)

**Note:** Code signing and notarization are intentionally **NOT implemented for MVP**. These are production requirements but not needed for the 3-day MVP checkpoint.

**Why not now?**
- Requires Apple Developer account ($99/year) or Windows code signing certificate ($150-400/year)
- Notarization takes 10-30 minutes per build
- Adds complexity during rapid iteration
- Users can still open app with "Right-click → Open" (macOS) or "Run anyway" (Windows)

**For MVP, inform users:**
- macOS: "Right-click app → Open" to bypass Gatekeeper
- Windows: Click "More info" → "Run anyway" if SmartScreen appears

---

## Day 2 Summary

By end of Day 2, you should have:
- ✅ Interactive canvas timeline with React-Konva
- ✅ Video player with playback controls
- ✅ Trim functionality with drag handles and buttons
- ✅ Full export pipeline with progress tracking
- ✅ Packaged distributable app (DMG/EXE)
- ✅ All unit tests passing
- ✅ MVP ready for submission

**Next Steps:**
- Submit MVP by Tuesday 10:59 PM CT
- Proceed to [3_tasklist.md](./3_tasklist.md) for Day 3 polish and final submission
- Reference [4_tasklist.md](./4_tasklist.md) for additional workflows and testing scenarios
