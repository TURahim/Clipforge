# ClipForge - Project Overview & Day 1 Foundation

## Context Capsule

**ClipForge** is a desktop video editing application built with Electron, React, and TypeScript. This is a 3-day MVP project (Oct 27-29, 2025) that creates a simple video editor with timeline editing, clip trimming, and MP4 export capabilities.

**Key Technologies:**
- Electron + Vite + TypeScript + React
- React-Konva for canvas-based timeline
- FFmpeg for video processing
- Zustand for state management
- TailwindCSS for styling
- Vitest for testing

**Project Structure:** This document covers project setup, testing strategy, and Day 1 foundation tasks. See other documents for Day 2 MVP features, Day 3 polish, and additional resources.

**Cross-References:**
- [2_tasklist.md](./2_tasklist.md) - Day 2 MVP Core Features
- [3_tasklist.md](./3_tasklist.md) - Day 3 Polish & Final Submission  
- [4_tasklist.md](./4_tasklist.md) - Additional Resources & Workflow

---

## Project Timeline

**Version:** 1.0  
**Timeline:** 3 Days (Oct 27-29, 2025)  
**MVP Deadline:** Tuesday, Oct 28 at 10:59 PM CT  
**Final Deadline:** Wednesday, Oct 29 at 10:59 PM CT

---

## Testing Strategy

This project includes **unit tests** for core logic to verify correctness during development. Tests serve as:
- **Verification**: Confirm your coding agent's output is correct
- **Documentation**: Show expected behavior of functions
- **Regression prevention**: Catch bugs when refactoring

### PRs with Unit Tests:
- **PR #3** (FFmpeg): Test ffprobe JSON parsing, duration extraction, progress calculation
- **PR #4** (Timeline): Test clip width/position calculations, PPS conversions
- **PR #5** (Player): Test VideoController class methods (load, play, pause, seek)
- **PR #6** (Trim): Test trim validation, edge cases, constraints
- **PR #7** (Export): Test FFmpeg command building, filelist generation, progress parsing

### Running Tests:
```bash
# Run all tests
pnpm test

# Run tests in watch mode (during development)
pnpm test

# Run tests once (CI/before commit)
pnpm test:run

# Run tests with UI
pnpm test:ui

# Run specific test file
pnpm test ffmpeg
pnpm test timeline
pnpm test VideoController
```

**Why These PRs?**
- **PR #3-7:** Core logic that's deterministic and testable without UI
- Tests catch errors early before manual testing
- Tests serve as documentation of expected behavior
- Easy to run: `pnpm test` before pushing code

**No Tests for:**
- PR #1 (Setup) - Configuration only
- PR #2 (Import) - Primarily IPC and UI (would need E2E tests)
- PR #8 (Packaging) - Build process
- PR #9-10 (Polish/Docs) - Visual and documentation work

---

## Project File Structure

**Note:** This project uses **pnpm** for package management (faster, more efficient than npm). All commands use `pnpm` instead of `npm`.

```
clipforge/
├── .gitignore
├── package.json
├── pnpm-lock.yaml              # Lock file (commit this!)
├── tsconfig.json
├── tsconfig.node.json
├── electron.vite.config.ts
├── vite.config.ts
├── vitest.config.ts               # Test configuration
├── tailwind.config.js
├── postcss.config.js
├── README.md
│
├── electron/
│   ├── main.ts                    # Main process entry point
│   ├── preload.ts                 # Preload script for IPC
│   └── handlers/
│       ├── file.handler.ts        # File import/export handlers
│       └── ffmpeg.handler.ts      # FFmpeg execution handlers
│
├── src/
│   ├── main.tsx                   # React entry point
│   ├── App.tsx                    # Root component
│   ├── index.css                  # Global styles + Tailwind
│   │
│   ├── test/
│   │   └── setup.ts               # Test setup file
│   │
│   ├── store/
│   │   └── useStore.ts            # Zustand store
│   │
│   ├── components/
│   │   ├── MediaLibrary.tsx       # Media library panel
│   │   ├── Timeline.tsx           # Timeline with React-Konva
│   │   ├── VideoPlayer.tsx        # Video player component
│   │   ├── ExportControls.tsx     # Export panel
│   │   └── ui/
│   │       ├── Button.tsx         # Reusable button component
│   │       ├── ProgressBar.tsx    # Progress bar component
│   │       └── Toast.tsx          # Toast notification component
│   │
│   ├── utils/
│   │   ├── VideoController.ts     # Video playback controller
│   │   ├── ffmpeg.ts              # FFmpeg command builders & parsing
│   │   ├── timeUtils.ts           # Time formatting utilities
│   │   ├── timelineUtils.ts       # Timeline calculation utilities (PPS, positioning)
│   │   ├── trimUtils.ts           # Trim validation utilities
│   │   ├── exportUtils.ts         # Export command building utilities
│   │   ├── ipcRenderer.ts         # IPC wrapper utilities
│   │   └── __tests__/
│   │       ├── ffmpeg.test.ts         # Tests for ffprobe parsing
│   │       ├── timeline.test.ts       # Tests for timeline calculations
│   │       ├── VideoController.test.ts # Tests for VideoController class
│   │       ├── trim.test.ts           # Tests for trim validation
│   │       └── export.test.ts         # Tests for export command building
│   │
│   └── types/
│       └── index.ts               # TypeScript type definitions
│
├── dist/                          # Build output (generated)
├── dist-electron/                 # Electron build (generated)
└── release/                       # Packaged apps (generated)
```

---

## Day 1 - Foundation (Monday, Oct 27)

### PR #1: Project Setup & Configuration
**Branch:** `feat/project-setup`  
**Priority:** Critical  
**Estimated Time:** 1-2 hours  
**Status:** [ ] Not Started

**Description:** Initialize Electron + Vite + TypeScript + React project with all necessary configuration files.

#### Tasks:
- [ ] Initialize project with pnpm (lock dependency versions)
- [ ] Install core dependencies
- [ ] Install testing framework (Vitest + Testing Library)
- [ ] Configure TypeScript
- [ ] Configure Vite for Electron
- [ ] Configure TailwindCSS
- [ ] Set up basic Electron main process
- [ ] Set up basic React renderer
- [ ] Add scripts to package.json (dev, build, package, test)
- [ ] Add macOS Gatekeeper note to README
- [ ] Test that app launches in dev mode

#### Files Created:
```
📄 package.json
📄 tsconfig.json
📄 tsconfig.node.json
📄 electron.vite.config.ts
📄 vite.config.ts
📄 vitest.config.ts
📄 tailwind.config.js
📄 postcss.config.js
📄 .gitignore
📄 README.md

📄 electron/main.ts
📄 electron/preload.ts

📄 src/main.tsx
📄 src/App.tsx
📄 src/index.css
📄 src/test/setup.ts
```

#### Dependencies to Install:
```bash
# Initialize with pnpm (lock versions)
pnpm init

# Core
pnpm install react react-dom electron

# Build tools
pnpm install -D vite electron-vite typescript
pnpm install -D @vitejs/plugin-react

# TypeScript types
pnpm install -D @types/react @types/react-dom @types/node

# Electron builder (for packaging later)
pnpm install -D electron-builder

# TailwindCSS
pnpm install -D tailwindcss postcss autoprefixer

# State management
pnpm install zustand

# Canvas/Timeline
pnpm install react-konva konva

# FFmpeg
pnpm install ffmpeg-static

# Testing (for unit/integration tests)
pnpm install -D vitest @vitest/ui
pnpm install -D @testing-library/react @testing-library/jest-dom
pnpm install -D happy-dom
```

#### package.json Scripts:
Add these scripts to package.json:
```json
{
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview",
    "package": "electron-builder",
    "package:mac": "electron-builder --mac",
    "package:win": "electron-builder --win",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run"
  }
}
```

#### Test Configuration:
Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

#### README Additions:
Add macOS Gatekeeper note:
```markdown
## Installation

### macOS Users
On first launch, macOS Gatekeeper may block the app. 
**Right-click the app icon → select "Open"** to bypass this security check.
```

#### Validation:
- [ ] Run `pnpm install` - all dependencies install without errors
- [ ] Run `pnpm dev` - app launches without errors
- [ ] See basic React UI in Electron window
- [ ] No TypeScript errors
- [ ] TailwindCSS classes work
- [ ] pnpm-lock.yaml is committed to Git
- [ ] Run `pnpm test` - Vitest runs successfully (no tests yet, but should not error)
- [ ] Test setup file exists at `src/test/setup.ts`
- [ ] vitest.config.ts is configured correctly

---

### PR #2: File Import System & Media Library
**Branch:** `feat/file-import`  
**Priority:** Critical  
**Estimated Time:** 2-3 hours  
**Status:** [ ] Not Started

**Description:** Implement file picker and drag-and-drop for video imports. Display imported clips in media library panel.

#### Tasks:
- [ ] Create Zustand store structure
- [ ] Create type definitions for Clip
- [ ] Set up IPC handlers for file operations
- [ ] Implement file picker dialog in main process
- [ ] Implement drag-and-drop on app window (entire window drop target)
- [ ] Extract video metadata using FFmpeg
- [ ] Generate video thumbnails
- [ ] Create MediaLibrary component
- [ ] Display clips with thumbnails and duration
- [ ] Add error toast/notification component
- [ ] Handle unsupported formats with error toast
- [ ] Handle DRM-protected files with error toast
- [ ] Add file validation (check extensions, file size)

#### Files Created:
```
📄 src/store/useStore.ts
📄 src/types/index.ts
📄 electron/handlers/file.handler.ts
📄 src/components/MediaLibrary.tsx
📄 src/components/ui/Toast.tsx
📄 src/utils/ipcRenderer.ts
```

#### Files Modified:
```
📝 electron/main.ts (register IPC handlers)
📝 electron/preload.ts (expose IPC methods)
📝 src/App.tsx (add MediaLibrary component)
```

#### Key Features:
- [ ] Click "Import Video" button → file picker opens
- [ ] Select MP4/MOV file → clip appears in library
- [ ] Drag file onto app window (anywhere in window) → clip appears in library
- [ ] Drop target: entire app window (use `onDrop` on root div)
- [ ] Each clip shows: thumbnail, filename, duration (MM:SS)
- [ ] Support importing multiple clips (3-5 minimum)
- [ ] Error toast appears for unsupported formats (AVI, WMV, etc.)
- [ ] Error toast appears for DRM-protected files
- [ ] Error toast appears for corrupted files
- [ ] Toast auto-dismisses after 5 seconds

#### Drag-and-Drop Implementation:
```typescript
// In App.tsx or MediaLibrary.tsx
const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files);
  files.forEach(file => {
    if (file.type.includes('video')) {
      // Import video via IPC
    } else {
      // Show error toast
    }
  });
};

// Drop target on root element
<div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
  {/* App content */}
</div>
```

#### Validation:
- [ ] Import single MP4 file successfully
- [ ] Import single MOV file successfully
- [ ] Drag and drop MP4 file successfully
- [ ] See thumbnail for each clip
- [ ] See correct duration for each clip
- [ ] Import 3 clips - all appear in library
- [ ] Drag unsupported file (e.g., .txt) - error toast appears
- [ ] Try to import corrupted video - error toast appears
- [ ] Error toast auto-dismisses after 5 seconds

---

### PR #3: FFmpeg Integration & Export Testing
**Branch:** `feat/ffmpeg-integration`  
**Priority:** Critical  
**Estimated Time:** 2-3 hours  
**Status:** [ ] Not Started

**Description:** Set up FFmpeg integration with progress tracking. Test basic export functionality with a single clip (even without trim).

#### Tasks:
- [ ] Create FFmpeg handler in main process
- [ ] Implement metadata extraction using ffprobe (JSON output)
- [ ] Create TypeScript types for ffprobe JSON response
- [ ] Parse ffprobe JSON → extract duration, width, height, codec
- [ ] Save parsed duration into Zustand store (required for timeline widths)
- [ ] Implement basic export (single clip to MP4)
- [ ] Parse FFmpeg stderr for progress
- [ ] Create progress tracking IPC channel
- [ ] Build FFmpeg command utilities
- [ ] Test export with single clip
- [ ] Handle export errors gracefully
- [ ] Test on different video formats

#### Files Created:
```
📄 electron/handlers/ffmpeg.handler.ts
📄 src/utils/ffmpeg.ts
📄 src/utils/timeUtils.ts
📄 src/utils/__tests__/ffmpeg.test.ts
```

#### Files Modified:
```
📝 electron/main.ts (register FFmpeg handlers)
📝 electron/preload.ts (expose FFmpeg IPC methods)
📝 src/store/useStore.ts (add export state)
```

#### Key FFmpeg Operations:
- [ ] Extract metadata (duration, resolution, codec) using ffprobe JSON
- [ ] Generate thumbnail (first frame or middle frame)
- [ ] Export single clip to MP4
- [ ] Parse progress from stderr
- [ ] Calculate percentage complete

#### FFprobe JSON → TypeScript Types:

**ffprobe command:**
```bash
ffprobe -v quiet -print_format json -show_format -show_streams input.mp4
```

**TypeScript types for response:**
```typescript
// src/types/index.ts
interface FFprobeStream {
  codec_name: string;
  codec_type: 'video' | 'audio';
  width?: number;
  height?: number;
  duration?: string;
  r_frame_rate?: string;
}

interface FFprobeFormat {
  filename: string;
  duration: string;
  size: string;
  bit_rate: string;
}

interface FFprobeResponse {
  streams: FFprobeStream[];
  format: FFprobeFormat;
}

// Parsed metadata saved to store
interface VideoMetadata {
  duration: number;        // in seconds (parsed from format.duration)
  width: number;
  height: number;
  codec: string;
  fileSize: number;
}
```

**Parsing logic:**
```typescript
// electron/handlers/ffmpeg.handler.ts
const metadata = await getVideoMetadata(filePath);

// Save to store (via IPC)
store.updateClip(clipId, {
  duration: metadata.duration,  // THIS IS CRITICAL FOR TIMELINE
  metadata: {
    width: metadata.width,
    height: metadata.height,
    codec: metadata.codec
  }
});
```

**Why duration in store matters:**
Timeline width calculation requires knowing each clip's duration:
```typescript
// Timeline component
const clipWidth = clip.duration * pixelsPerSecond;
```

#### Validation:
- [ ] Import a clip
- [ ] Verify ffprobe extracts metadata as JSON
- [ ] Verify duration is parsed and saved to store
- [ ] Check store: clip.duration should be a number (in seconds)
- [ ] Export clip (no trim, just re-encode)
- [ ] Export completes without errors
- [ ] Exported MP4 plays in VLC/QuickTime
- [ ] Progress updates visible during export
- [ ] Test with 5s, 30s, and 2min videos
- [ ] Verify metadata: width, height, codec are correct
- [ ] **Run unit tests: `pnpm test ffmpeg`**

---

## Unit Tests for Day 1

### FFmpeg Utilities Tests (`src/utils/__tests__/ffmpeg.test.ts`)

These tests verify ffprobe JSON parsing and metadata extraction without needing actual video files.

```typescript
import { describe, it, expect } from 'vitest';
import { parseFFprobeOutput, parseTimeToSeconds, buildTrimCommand } from './ffmpeg';

describe('FFmpeg Utils', () => {
  describe('parseFFprobeOutput', () => {
    it('should parse valid ffprobe JSON and extract metadata', () => {
      const mockFFprobeJSON = {
        streams: [
          {
            codec_name: 'h264',
            codec_type: 'video',
            width: 1920,
            height: 1080,
            r_frame_rate: '30/1'
          },
          {
            codec_name: 'aac',
            codec_type: 'audio'
          }
        ],
        format: {
          filename: 'test.mp4',
          duration: '30.500000',
          size: '5242880',
          bit_rate: '1376538'
        }
      };

      const metadata = parseFFprobeOutput(mockFFprobeJSON);

      expect(metadata.duration).toBe(30.5);
      expect(metadata.width).toBe(1920);
      expect(metadata.height).toBe(1080);
      expect(metadata.codec).toBe('h264');
    });

    it('should handle missing video stream gracefully', () => {
      const mockFFprobeJSON = {
        streams: [
          {
            codec_name: 'aac',
            codec_type: 'audio'
          }
        ],
        format: {
          filename: 'audio-only.mp4',
          duration: '60.0',
          size: '1048576',
          bit_rate: '128000'
        }
      };

      const metadata = parseFFprobeOutput(mockFFprobeJSON);

      expect(metadata.duration).toBe(60);
      expect(metadata.width).toBe(0); // Default when no video stream
      expect(metadata.height).toBe(0);
      expect(metadata.codec).toBe('unknown');
    });

    it('should handle malformed duration strings', () => {
      const mockFFprobeJSON = {
        streams: [],
        format: {
          filename: 'test.mp4',
          duration: 'N/A',
          size: '0',
          bit_rate: '0'
        }
      };

      const metadata = parseFFprobeOutput(mockFFprobeJSON);

      expect(metadata.duration).toBe(0); // Fallback to 0 for invalid duration
    });
  });

  describe('parseTimeToSeconds', () => {
    it('should parse HH:MM:SS.ms format correctly', () => {
      expect(parseTimeToSeconds('00:00:30.50')).toBe(30.5);
      expect(parseTimeToSeconds('00:01:15.25')).toBe(75.25);
      expect(parseTimeToSeconds('01:30:00.00')).toBe(5400);
    });

    it('should handle edge cases', () => {
      expect(parseTimeToSeconds('00:00:00.00')).toBe(0);
      expect(parseTimeToSeconds('23:59:59.99')).toBe(86399.99);
    });

    it('should return 0 for invalid input', () => {
      expect(parseTimeToSeconds('invalid')).toBe(0);
      expect(parseTimeToSeconds('')).toBe(0);
    });
  });

  describe('buildTrimCommand', () => {
    it('should build correct trim command for single clip', () => {
      const clip = {
        id: '1',
        filePath: '/path/to/video.mp4',
        duration: 60,
        trimStart: 5,
        trimEnd: 35
      };

      const args = buildTrimCommand(clip, '/output/trimmed.mp4');

      expect(args).toContain('-ss');
      expect(args).toContain('5');
      expect(args).toContain('-i');
      expect(args).toContain('/path/to/video.mp4');
      expect(args).toContain('-t');
      expect(args).toContain('30'); // trimEnd - trimStart = 35 - 5 = 30
      expect(args).toContain('/output/trimmed.mp4');
    });

    it('should build command for untrimmed clip', () => {
      const clip = {
        id: '2',
        filePath: '/path/to/video.mp4',
        duration: 60,
        trimStart: 0,
        trimEnd: 60
      };

      const args = buildTrimCommand(clip, '/output/full.mp4');

      // Should not include trim flags
      expect(args).not.toContain('-ss');
      expect(args).not.toContain('-t');
      expect(args).toContain('/path/to/video.mp4');
    });
  });
});
```

**Implementation file:** `src/utils/ffmpeg.ts`

```typescript
interface FFprobeStream {
  codec_name: string;
  codec_type: 'video' | 'audio';
  width?: number;
  height?: number;
  duration?: string;
  r_frame_rate?: string;
}

interface FFprobeFormat {
  filename: string;
  duration: string;
  size: string;
  bit_rate: string;
}

interface FFprobeResponse {
  streams: FFprobeStream[];
  format: FFprobeFormat;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  codec: string;
  fileSize: number;
}

export function parseFFprobeOutput(ffprobeJSON: FFprobeResponse): VideoMetadata {
  const videoStream = ffprobeJSON.streams.find(s => s.codec_type === 'video');
  
  return {
    duration: parseFloat(ffprobeJSON.format.duration) || 0,
    width: videoStream?.width || 0,
    height: videoStream?.height || 0,
    codec: videoStream?.codec_name || 'unknown',
    fileSize: parseInt(ffprobeJSON.format.size) || 0
  };
}

export function parseTimeToSeconds(timeString: string): number {
  const match = timeString.match(/(\d+):(\d+):(\d+\.\d+)/);
  if (!match) return 0;
  
  const hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const seconds = parseFloat(match[3]);
  
  return hours * 3600 + minutes * 60 + seconds;
}

export function buildTrimCommand(clip: any, outputPath: string): string[] {
  const args: string[] = [];
  
  // Only add trim flags if clip is actually trimmed
  if (clip.trimStart > 0) {
    args.push('-ss', clip.trimStart.toString());
  }
  
  args.push('-i', clip.filePath);
  
  if (clip.trimEnd < clip.duration) {
    const duration = clip.trimEnd - clip.trimStart;
    args.push('-t', duration.toString());
  }
  
  args.push('-c:v', 'libx264', '-c:a', 'aac', outputPath);
  
  return args;
}
```

**Run tests:**
```bash
pnpm test ffmpeg
```

**Expected output:**
```
✓ src/utils/__tests__/ffmpeg.test.ts (12)
  ✓ FFmpeg Utilities (12)
    ✓ parseFFprobeOutput (3)
    ✓ parseTimeToSeconds (2)
    ✓ buildTrimCommand (2)

Test Files  1 passed (1)
     Tests  12 passed (12)
```

**Why these tests matter:**
- ffprobe parsing errors would break timeline (clips wouldn't display)
- Duration parsing is CRITICAL - wrong duration = wrong clip widths
- Progress calculation must be accurate for user feedback
- Tests catch edge cases (missing streams, invalid data)

---

## Next Steps

After completing Day 1 foundation tasks, proceed to:
- **[2_tasklist.md](./2_tasklist.md)** - Day 2 MVP Core Features (Timeline, Player, Trim)
- **[3_tasklist.md](./3_tasklist.md)** - Day 3 Polish & Final Submission
- **[4_tasklist.md](./4_tasklist.md)** - Additional Resources & Workflow
