# ClipForge - Development Task List

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

## Testing Strategy

### Unit & Integration Tests

This project uses **Vitest** for fast, modern testing. Tests are added to PRs where they provide the most value for verifying code correctness.

**PRs with Tests:**
- ✅ **PR #3** - FFmpeg utils (ffprobe parsing, time parsing, command building)
- ✅ **PR #4** - Timeline calculations (width, position, duration)
- ✅ **PR #5** - VideoController class (play, pause, seek, load)
- ✅ **PR #6** - Trim logic (validation, bounds checking, constraints)
- ✅ **PR #7** - Export utils (command building, progress parsing)

**Test Commands:**
```bash
# Run all tests
pnpm test

# Run tests in watch mode (during development)
pnpm test

# Run tests once (CI mode)
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

#### Testing Setup:
Install testing dependencies:
```bash
pnpm install -D vitest @vitest/ui
pnpm install -D @testing-library/react @testing-library/jest-dom
pnpm install -D @testing-library/user-event
```

Add test script to package.json:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run"
  }
}
```

Create vitest.config.ts:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

Create basic smoke test:
```typescript
// src/App.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeTruthy();
  });
});
```

**Validation:**
- [ ] Run `pnpm test` - test passes
- [ ] Test infrastructure is working

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

#### Unit Tests:

Create test file:
```typescript
// src/store/useStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';

describe('useStore - Clip Management', () => {
  beforeEach(() => {
    // Reset store before each test
    useStore.setState({ clips: [] });
  });

  it('adds a clip to the store', () => {
    const { addClip } = useStore.getState();
    
    const testClip = {
      id: 'test-clip-1',
      filePath: '/path/to/video.mp4',
      filename: 'video.mp4',
      duration: 30,
      thumbnail: 'data:image/png;base64,...',
    };
    
    addClip(testClip);
    
    const { clips } = useStore.getState();
    expect(clips).toHaveLength(1);
    expect(clips[0].id).toBe('test-clip-1');
    expect(clips[0].duration).toBe(30);
  });

  it('adds multiple clips to the store', () => {
    const { addClip } = useStore.getState();
    
    addClip({ id: 'clip-1', filePath: '/a.mp4', filename: 'a.mp4', duration: 10 });
    addClip({ id: 'clip-2', filePath: '/b.mp4', filename: 'b.mp4', duration: 20 });
    addClip({ id: 'clip-3', filePath: '/c.mp4', filename: 'c.mp4', duration: 30 });
    
    const { clips } = useStore.getState();
    expect(clips).toHaveLength(3);
  });
});
```

```typescript
// src/components/MediaLibrary.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MediaLibrary from './MediaLibrary';

describe('MediaLibrary', () => {
  it('renders empty state when no clips', () => {
    render(<MediaLibrary />);
    expect(screen.getByText(/no clips/i)).toBeInTheDocument();
  });

  it('renders clips when present', () => {
    // Mock store with clips
    vi.mock('./store/useStore', () => ({
      useStore: () => ({
        clips: [
          { id: '1', filename: 'test.mp4', duration: 30 },
          { id: '2', filename: 'test2.mp4', duration: 45 },
        ],
      }),
    }));
    
    render(<MediaLibrary />);
    expect(screen.getByText('test.mp4')).toBeInTheDocument();
    expect(screen.getByText('test2.mp4')).toBeInTheDocument();
  });

  it('shows error toast for unsupported file type', async () => {
    render(<MediaLibrary />);
    
    const dropzone = screen.getByTestId('drop-zone');
    
    // Simulate dropping a .txt file
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const dataTransfer = {
      files: [file],
      types: ['Files'],
    };
    
    fireEvent.drop(dropzone, { dataTransfer });
    
    // Should show error toast
    expect(await screen.findByText(/unsupported file type/i)).toBeInTheDocument();
  });
});
```

```typescript
// src/components/ui/Toast.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Toast from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders error toast with message', () => {
    render(<Toast message="Test error" type="error" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('auto-dismisses after 5 seconds', async () => {
    const onDismiss = vi.fn();
    render(<Toast message="Test" type="error" onDismiss={onDismiss} />);
    
    expect(screen.getByText('Test')).toBeInTheDocument();
    
    // Fast-forward 5 seconds
    vi.advanceTimersByTime(5000);
    
    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalled();
    });
  });

  it('renders success toast', () => {
    render(<Toast message="Success!" type="success" />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });
});
```

#### Integration Test:

```typescript
// electron/handlers/file.handler.test.ts
import { describe, it, expect, vi } from 'vitest';
import { importVideoFile } from './file.handler';
import path from 'path';

describe('File Handler', () => {
  it('validates file extension', async () => {
    const result = await importVideoFile('/path/to/file.txt');
    expect(result.error).toBe('Unsupported file format');
  });

  it('accepts MP4 files', async () => {
    // Mock file system
    vi.mock('fs', () => ({
      existsSync: () => true,
      statSync: () => ({ size: 1024000 }),
    }));
    
    const result = await importVideoFile('/path/to/video.mp4');
    expect(result.error).toBeUndefined();
    expect(result.filePath).toBe('/path/to/video.mp4');
  });

  it('accepts MOV files', async () => {
    const result = await importVideoFile('/path/to/video.mov');
    expect(result.error).toBeUndefined();
  });

  it('rejects files that don\'t exist', async () => {
    const result = await importVideoFile('/nonexistent/file.mp4');
    expect(result.error).toBeTruthy();
  });
});
```

**Test Commands:**
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with UI
pnpm test:ui

# Run tests once (CI mode)
pnpm test:run
```

**Test Validation Checklist:**
- [ ] All store tests pass
- [ ] MediaLibrary component tests pass
- [ ] Toast component tests pass
- [ ] File handler validation tests pass
- [ ] Error handling tests pass

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

#### Unit Tests for PR #3

Create test file: `src/utils/__tests__/ffmpeg.test.ts`

**What to test:**
1. **ffprobe JSON parsing** - Critical data transformation
2. **Duration extraction** - Required for timeline widths
3. **Metadata parsing** - Width, height, codec extraction
4. **Progress calculation** - Percentage from time string

**Test file:**
```typescript
// src/utils/__tests__/ffmpeg.test.ts
import { describe, it, expect } from 'vitest';
import { 
  parseFFprobeOutput, 
  parseDuration, 
  calculateProgress,
  parseTimeToSeconds 
} from '../ffmpeg';

describe('FFmpeg Utilities', () => {
  describe('parseFFprobeOutput', () => {
    it('should parse valid ffprobe JSON response', () => {
      const mockFFprobeOutput = {
        streams: [
          {
            codec_type: 'video',
            codec_name: 'h264',
            width: 1920,
            height: 1080,
          },
          {
            codec_type: 'audio',
            codec_name: 'aac',
          }
        ],
        format: {
          duration: '30.500000',
          size: '15728640',
          filename: 'test.mp4'
        }
      };

      const result = parseFFprobeOutput(mockFFprobeOutput);

      expect(result.duration).toBe(30.5);
      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
      expect(result.codec).toBe('h264');
      expect(result.fileSize).toBe(15728640);
    });

    it('should handle missing video stream', () => {
      const mockOutput = {
        streams: [
          { codec_type: 'audio', codec_name: 'aac' }
        ],
        format: {
          duration: '10.0',
          size: '1000000',
          filename: 'audio-only.mp4'
        }
      };

      const result = parseFFprobeOutput(mockOutput);

      expect(result.duration).toBe(10);
      expect(result.width).toBe(0);
      expect(result.height).toBe(0);
      expect(result.codec).toBe('unknown');
    });

    it('should handle invalid duration', () => {
      const mockOutput = {
        streams: [],
        format: {
          duration: 'N/A',
          size: '1000',
          filename: 'invalid.mp4'
        }
      };

      const result = parseFFprobeOutput(mockOutput);

      expect(result.duration).toBe(0);
    });
  });

  describe('parseDuration', () => {
    it('should parse duration string to seconds', () => {
      expect(parseDuration('30.500000')).toBe(30.5);
      expect(parseDuration('120.0')).toBe(120);
      expect(parseDuration('0.5')).toBe(0.5);
    });

    it('should handle invalid duration strings', () => {
      expect(parseDuration('N/A')).toBe(0);
      expect(parseDuration('')).toBe(0);
      expect(parseDuration('invalid')).toBe(0);
    });
  });

  describe('parseTimeToSeconds', () => {
    it('should parse HH:MM:SS.ms format to seconds', () => {
      expect(parseTimeToSeconds('00:00:30.50')).toBe(30.5);
      expect(parseTimeToSeconds('00:02:00.00')).toBe(120);
      expect(parseTimeToSeconds('01:30:45.25')).toBe(5445.25);
    });

    it('should handle edge cases', () => {
      expect(parseTimeToSeconds('00:00:00.00')).toBe(0);
      expect(parseTimeToSeconds('23:59:59.99')).toBe(86399.99);
    });
  });

  describe('calculateProgress', () => {
    it('should calculate export progress percentage', () => {
      expect(calculateProgress(15, 30)).toBe(50);
      expect(calculateProgress(10, 100)).toBe(10);
      expect(calculateProgress(30, 30)).toBe(100);
    });

    it('should handle edge cases', () => {
      expect(calculateProgress(0, 30)).toBe(0);
      expect(calculateProgress(30, 0)).toBe(0); // Avoid division by zero
      expect(calculateProgress(40, 30)).toBe(100); // Cap at 100%
    });

    it('should return rounded percentages', () => {
      expect(calculateProgress(1, 3)).toBe(33); // 33.33... -> 33
      expect(calculateProgress(2, 3)).toBe(67); // 66.66... -> 67
    });
  });
});
```

**Implementation hints for `src/utils/ffmpeg.ts`:**
```typescript
// src/utils/ffmpeg.ts
export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  codec: string;
  fileSize: number;
}

export function parseFFprobeOutput(data: any): VideoMetadata {
  const videoStream = data.streams.find((s: any) => s.codec_type === 'video');
  const duration = parseDuration(data.format.duration);
  
  return {
    duration,
    width: videoStream?.width || 0,
    height: videoStream?.height || 0,
    codec: videoStream?.codec_name || 'unknown',
    fileSize: parseInt(data.format.size) || 0,
  };
}

export function parseDuration(durationStr: string): number {
  const parsed = parseFloat(durationStr);
  return isNaN(parsed) ? 0 : parsed;
}

export function parseTimeToSeconds(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+):(\d+\.\d+)/);
  if (!match) return 0;
  
  const hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const seconds = parseFloat(match[3]);
  
  return hours * 3600 + minutes * 60 + seconds;
}

export function calculateProgress(currentTime: number, totalDuration: number): number {
  if (totalDuration === 0) return 0;
  const percentage = (currentTime / totalDuration) * 100;
  return Math.min(Math.round(percentage), 100);
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
    ✓ parseDuration (2)
    ✓ parseTimeToSeconds (2)
    ✓ calculateProgress (3)

Test Files  1 passed (1)
     Tests  12 passed (12)
```

**Why these tests matter:**
- ffprobe parsing errors would break timeline (clips wouldn't display)
- Duration parsing is CRITICAL - wrong duration = wrong clip widths
- Progress calculation must be accurate for user feedback
- Tests catch edge cases (missing streams, invalid data)
- [ ] **Run unit tests: `pnpm test ffmpeg`**

---

#### 🧪 Unit Tests (PR #3)

**Test File:** `src/utils/ffmpeg.test.ts`

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

**Test Task Checklist:**
- [ ] Create `src/utils/ffmpeg.test.ts`
- [ ] Implement parseFFprobeOutput with error handling
- [ ] Implement parseTimeToSeconds for progress parsing
- [ ] Implement buildTrimCommand for export
- [ ] Run tests: `pnpm test ffmpeg`
- [ ] All tests pass (100% coverage for these utils)
- [ ] Verify edge cases: missing streams, invalid duration, zero values

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

#### Unit Tests for PR #4

Create test file: `src/utils/__tests__/timeline.test.ts`

**What to test:**
1. **Clip width calculation** - duration × PPS
2. **Clip position calculation** - Sequential positioning
3. **Total timeline duration** - Sum of all clip durations
4. **Pixels to time conversion** - For playhead positioning

**Test file:**
```typescript
// src/utils/__tests__/timeline.test.ts
import { describe, it, expect } from 'vitest';
import {
  calculateClipWidth,
  calculateClipPosition,
  calculateTotalDuration,
  pixelsToSeconds,
  secondsToPixels,
  PIXELS_PER_SECOND
} from '../timelineUtils';
import type { TimelineClip } from '../../types';

describe('Timeline Utilities', () => {
  describe('calculateClipWidth', () => {
    it('should calculate width based on duration and PPS', () => {
      expect(calculateClipWidth(10)).toBe(1000); // 10s * 100px/s
      expect(calculateClipWidth(30)).toBe(3000);
      expect(calculateClipWidth(0.5)).toBe(50);
    });

    it('should handle trimmed clips', () => {
      const clip = {
        duration: 30,
        trimStart: 5,
        trimEnd: 20
      };
      expect(calculateClipWidth(clip.trimEnd - clip.trimStart)).toBe(1500); // 15s * 100px/s
    });
  });

  describe('calculateClipPosition', () => {
    it('should position first clip at x=0', () => {
      const clips: TimelineClip[] = [
        {
          id: '1',
          duration: 10,
          trimStart: 0,
          trimEnd: 10,
          startTime: 0,
          filePath: 'test.mp4',
          filename: 'test.mp4'
        }
      ];

      const position = calculateClipPosition(clips, 0);
      expect(position).toBe(0);
    });

    it('should position subsequent clips after previous clips', () => {
      const clips: TimelineClip[] = [
        {
          id: '1',
          duration: 10,
          trimStart: 0,
          trimEnd: 10,
          startTime: 0,
          filePath: 'a.mp4',
          filename: 'a.mp4'
        },
        {
          id: '2',
          duration: 20,
          trimStart: 0,
          trimEnd: 20,
          startTime: 10,
          filePath: 'b.mp4',
          filename: 'b.mp4'
        }
      ];

      // First clip at x=0
      expect(calculateClipPosition(clips, 0)).toBe(0);
      
      // Second clip at x=1000 (10s * 100px/s)
      expect(calculateClipPosition(clips, 1)).toBe(1000);
    });

    it('should handle trimmed clips in positioning', () => {
      const clips: TimelineClip[] = [
        {
          id: '1',
          duration: 30,
          trimStart: 5,
          trimEnd: 20, // Effective duration: 15s
          startTime: 0,
          filePath: 'a.mp4',
          filename: 'a.mp4'
        },
        {
          id: '2',
          duration: 10,
          trimStart: 0,
          trimEnd: 10,
          startTime: 15,
          filePath: 'b.mp4',
          filename: 'b.mp4'
        }
      ];

      // Second clip should be at 15s * 100px/s = 1500px
      expect(calculateClipPosition(clips, 1)).toBe(1500);
    });
  });

  describe('calculateTotalDuration', () => {
    it('should sum durations of all clips', () => {
      const clips: TimelineClip[] = [
        {
          id: '1',
          duration: 10,
          trimStart: 0,
          trimEnd: 10,
          startTime: 0,
          filePath: 'a.mp4',
          filename: 'a.mp4'
        },
        {
          id: '2',
          duration: 20,
          trimStart: 0,
          trimEnd: 20,
          startTime: 10,
          filePath: 'b.mp4',
          filename: 'b.mp4'
        },
        {
          id: '3',
          duration: 15,
          trimStart: 0,
          trimEnd: 15,
          startTime: 30,
          filePath: 'c.mp4',
          filename: 'c.mp4'
        }
      ];

      expect(calculateTotalDuration(clips)).toBe(45);
    });

    it('should account for trimmed portions', () => {
      const clips: TimelineClip[] = [
        {
          id: '1',
          duration: 30,
          trimStart: 5,
          trimEnd: 25, // 20s effective
          startTime: 0,
          filePath: 'a.mp4',
          filename: 'a.mp4'
        },
        {
          id: '2',
          duration: 20,
          trimStart: 0,
          trimEnd: 10, // 10s effective
          startTime: 20,
          filePath: 'b.mp4',
          filename: 'b.mp4'
        }
      ];

      expect(calculateTotalDuration(clips)).toBe(30);
    });

    it('should return 0 for empty timeline', () => {
      expect(calculateTotalDuration([])).toBe(0);
    });
  });

  describe('pixelsToSeconds', () => {
    it('should convert pixels to seconds', () => {
      expect(pixelsToSeconds(1000)).toBe(10);
      expect(pixelsToSeconds(5000)).toBe(50);
      expect(pixelsToSeconds(100)).toBe(1);
    });

    it('should handle fractional pixels', () => {
      expect(pixelsToSeconds(150)).toBe(1.5);
      expect(pixelsToSeconds(50)).toBe(0.5);
    });
  });

  describe('secondsToPixels', () => {
    it('should convert seconds to pixels', () => {
      expect(secondsToPixels(10)).toBe(1000);
      expect(secondsToPixels(50)).toBe(5000);
      expect(secondsToPixels(1)).toBe(100);
    });

    it('should handle fractional seconds', () => {
      expect(secondsToPixels(1.5)).toBe(150);
      expect(secondsToPixels(0.5)).toBe(50);
    });
  });

  describe('PIXELS_PER_SECOND constant', () => {
    it('should be defined as 100', () => {
      expect(PIXELS_PER_SECOND).toBe(100);
    });
  });
});
```

**Implementation hints for `src/utils/timelineUtils.ts`:**
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

**Expected output:**
```
✓ src/utils/__tests__/timeline.test.ts (18)
  ✓ Timeline Utilities (18)
    ✓ calculateClipWidth (2)
    ✓ calculateClipPosition (3)
    ✓ calculateTotalDuration (3)
    ✓ pixelsToSeconds (2)
    ✓ secondsToPixels (2)

Test Files  1 passed (1)
     Tests  18 passed (18)
```

**Why these tests matter:**
- Wrong clip width calculation = visual timeline bugs
- Wrong positioning = clips overlap or have gaps
- These are pure functions (easy to test, no side effects)
- Catch off-by-one errors in pixel/time conversions
- [ ] **Run unit tests: `pnpm test timeline`**

---

#### 🧪 Unit Tests (PR #4)

**Test File:** `src/utils/timelineUtils.test.ts`

These tests verify timeline calculations for clip widths and positions.

```typescript
import { describe, it, expect } from 'vitest';
import { 
  calculateClipWidth, 
  calculateClipPosition, 
  calculateTotalDuration,
  formatTime 
} from './timelineUtils';

describe('Timeline Utils', () => {
  const PIXELS_PER_SECOND = 100;

  describe('calculateClipWidth', () => {
    it('should calculate correct width for clip duration', () => {
      expect(calculateClipWidth(30, PIXELS_PER_SECOND)).toBe(3000); // 30s = 3000px
      expect(calculateClipWidth(60, PIXELS_PER_SECOND)).toBe(6000); // 60s = 6000px
      expect(calculateClipWidth(1.5, PIXELS_PER_SECOND)).toBe(150); // 1.5s = 150px
    });

    it('should handle zero duration', () => {
      expect(calculateClipWidth(0, PIXELS_PER_SECOND)).toBe(0);
    });

    it('should calculate trimmed clip width', () => {
      const clip = { duration: 60, trimStart: 10, trimEnd: 40 };
      const trimmedDuration = clip.trimEnd - clip.trimStart; // 30s
      expect(calculateClipWidth(trimmedDuration, PIXELS_PER_SECOND)).toBe(3000);
    });
  });

  describe('calculateClipPosition', () => {
    it('should position first clip at x=0', () => {
      const clips: any[] = [];
      expect(calculateClipPosition(clips, PIXELS_PER_SECOND)).toBe(0);
    });

    it('should position second clip after first', () => {
      const clips = [
        { id: '1', duration: 30, trimStart: 0, trimEnd: 30, x: 0 }
      ];
      const expectedX = 30 * PIXELS_PER_SECOND; // 3000px
      expect(calculateClipPosition(clips, PIXELS_PER_SECOND)).toBe(expectedX);
    });

    it('should position clip after multiple clips', () => {
      const clips = [
        { id: '1', duration: 30, trimStart: 0, trimEnd: 30, x: 0 },
        { id: '2', duration: 45, trimStart: 0, trimEnd: 45, x: 3000 }
      ];
      const expectedX = (30 + 45) * PIXELS_PER_SECOND; // 7500px
      expect(calculateClipPosition(clips, PIXELS_PER_SECOND)).toBe(expectedX);
    });

    it('should calculate position with trimmed clips', () => {
      const clips = [
        { id: '1', duration: 60, trimStart: 10, trimEnd: 40, x: 0 } // 30s visible
      ];
      const trimmedDuration = clips[0].trimEnd - clips[0].trimStart;
      const expectedX = trimmedDuration * PIXELS_PER_SECOND; // 3000px
      expect(calculateClipPosition(clips, PIXELS_PER_SECOND)).toBe(expectedX);
    });
  });

  describe('calculateTotalDuration', () => {
    it('should return 0 for empty timeline', () => {
      expect(calculateTotalDuration([])).toBe(0);
    });

    it('should calculate total duration of single clip', () => {
      const clips = [
        { id: '1', duration: 30, trimStart: 0, trimEnd: 30 }
      ];
      expect(calculateTotalDuration(clips)).toBe(30);
    });

    it('should calculate total duration of multiple clips', () => {
      const clips = [
        { id: '1', duration: 30, trimStart: 0, trimEnd: 30 },
        { id: '2', duration: 45, trimStart: 0, trimEnd: 45 },
        { id: '3', duration: 15, trimStart: 0, trimEnd: 15 }
      ];
      expect(calculateTotalDuration(clips)).toBe(90);
    });

    it('should calculate total with trimmed clips', () => {
      const clips = [
        { id: '1', duration: 60, trimStart: 10, trimEnd: 40 }, // 30s
        { id: '2', duration: 50, trimStart: 5, trimEnd: 35 }   // 30s
      ];
      expect(calculateTotalDuration(clips)).toBe(60);
    });
  });

  describe('formatTime', () => {
    it('should format seconds to MM:SS', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(30)).toBe('00:30');
      expect(formatTime(90)).toBe('01:30');
      expect(formatTime(3600)).toBe('60:00');
    });

    it('should handle fractional seconds', () => {
      expect(formatTime(30.5)).toBe('00:30'); // Round down
      expect(formatTime(90.9)).toBe('01:30');
    });

    it('should pad single digits', () => {
      expect(formatTime(5)).toBe('00:05');
      expect(formatTime(65)).toBe('01:05');
    });
  });
});
```

**Implementation file:** `src/utils/timelineUtils.ts`

```typescript
export function calculateClipWidth(duration: number, pixelsPerSecond: number): number {
  return duration * pixelsPerSecond;
}

export function calculateClipPosition(
  previousClips: any[], 
  pixelsPerSecond: number
): number {
  if (previousClips.length === 0) return 0;
  
  let xPosition = 0;
  previousClips.forEach(clip => {
    const visibleDuration = clip.trimEnd - clip.trimStart;
    xPosition += visibleDuration * pixelsPerSecond;
  });
  
  return xPosition;
}

export function calculateTotalDuration(clips: any[]): number {
  return clips.reduce((total, clip) => {
    const visibleDuration = clip.trimEnd - clip.trimStart;
    return total + visibleDuration;
  }, 0);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
```

**Test Task Checklist:**
- [ ] Create `src/utils/timelineUtils.test.ts`
- [ ] Create `src/utils/timelineUtils.ts`
- [ ] Implement calculateClipWidth
- [ ] Implement calculateClipPosition
- [ ] Implement calculateTotalDuration
- [ ] Implement formatTime
- [ ] Run tests: `pnpm test timeline`
- [ ] All tests pass
- [ ] Use these utils in Timeline.tsx component

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

#### Unit Tests for PR #5

Create test file: `src/utils/__tests__/VideoController.test.ts`

**What to test:**
1. **VideoController class methods** - Perfect for unit testing (isolated class)
2. **Play/pause state management**
3. **Seek functionality**
4. **Time update callbacks**

**Test file:**
```typescript
// src/utils/__tests__/VideoController.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VideoController } from '../VideoController';

// Mock HTMLVideoElement
class MockVideoElement {
  src = '';
  currentTime = 0;
  duration = 100;
  paused = true;
  
  onloadedmetadata: (() => void) | null = null;
  onerror: ((err: any) => void) | null = null;
  ontimeupdate: (() => void) | null = null;

  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  
  // Simulate metadata loading
  simulateLoadedMetadata() {
    if (this.onloadedmetadata) {
      this.onloadedmetadata();
    }
  }
  
  // Simulate time update
  simulateTimeUpdate(time: number) {
    this.currentTime = time;
    if (this.ontimeupdate) {
      this.ontimeupdate();
    }
  }
}

describe('VideoController', () => {
  let videoElement: MockVideoElement;
  let controller: VideoController;

  beforeEach(() => {
    videoElement = new MockVideoElement();
    controller = new VideoController(videoElement as any);
  });

  describe('load', () => {
    it('should load video source', async () => {
      const loadPromise = controller.load('test.mp4');
      
      // Simulate metadata loaded
      videoElement.simulateLoadedMetadata();
      
      await loadPromise;
      
      expect(videoElement.src).toBe('test.mp4');
    });

    it('should reject on load error', async () => {
      const loadPromise = controller.load('invalid.mp4');
      
      // Simulate error
      if (videoElement.onerror) {
        videoElement.onerror(new Error('Load failed'));
      }
      
      await expect(loadPromise).rejects.toThrow();
    });

    it('should handle multiple load calls', async () => {
      const load1 = controller.load('video1.mp4');
      videoElement.simulateLoadedMetadata();
      await load1;
      
      const load2 = controller.load('video2.mp4');
      videoElement.simulateLoadedMetadata();
      await load2;
      
      expect(videoElement.src).toBe('video2.mp4');
    });
  });

  describe('play', () => {
    it('should call video element play method', async () => {
      await controller.play();
      expect(videoElement.play).toHaveBeenCalled();
    });

    it('should return play promise', async () => {
      const result = await controller.play();
      expect(result).toBeUndefined();
    });
  });

  describe('pause', () => {
    it('should call video element pause method', () => {
      controller.pause();
      expect(videoElement.pause).toHaveBeenCalled();
    });
  });

  describe('seek', () => {
    it('should set currentTime on video element', () => {
      controller.seek(30);
      expect(videoElement.currentTime).toBe(30);
    });

    it('should handle seek to start', () => {
      controller.seek(0);
      expect(videoElement.currentTime).toBe(0);
    });

    it('should handle fractional seconds', () => {
      controller.seek(15.5);
      expect(videoElement.currentTime).toBe(15.5);
    });
  });

  describe('getCurrentTime', () => {
    it('should return current time from video element', () => {
      videoElement.currentTime = 45.5;
      expect(controller.getCurrentTime()).toBe(45.5);
    });

    it('should return 0 initially', () => {
      expect(controller.getCurrentTime()).toBe(0);
    });
  });

  describe('getDuration', () => {
    it('should return duration from video element', () => {
      videoElement.duration = 120;
      expect(controller.getDuration()).toBe(120);
    });
  });

  describe('onUpdate', () => {
    it('should register time update callback', () => {
      const callback = vi.fn();
      controller.onUpdate(callback);
      
      // Simulate time update
      videoElement.simulateTimeUpdate(10);
      
      expect(callback).toHaveBeenCalledWith(10);
    });

    it('should call callback on every time update', () => {
      const callback = vi.fn();
      controller.onUpdate(callback);
      
      videoElement.simulateTimeUpdate(5);
      videoElement.simulateTimeUpdate(10);
      videoElement.simulateTimeUpdate(15);
      
      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(1, 5);
      expect(callback).toHaveBeenNthCalledWith(2, 10);
      expect(callback).toHaveBeenNthCalledWith(3, 15);
    });

    it('should allow updating callback', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      controller.onUpdate(callback1);
      videoElement.simulateTimeUpdate(5);
      
      controller.onUpdate(callback2);
      videoElement.simulateTimeUpdate(10);
      
      expect(callback1).toHaveBeenCalledWith(5);
      expect(callback1).not.toHaveBeenCalledWith(10);
      expect(callback2).toHaveBeenCalledWith(10);
    });
  });

  describe('integration scenarios', () => {
    it('should handle typical playback flow', async () => {
      const callback = vi.fn();
      
      // Load video
      const loadPromise = controller.load('test.mp4');
      videoElement.simulateLoadedMetadata();
      await loadPromise;
      
      // Register time update callback
      controller.onUpdate(callback);
      
      // Play video
      await controller.play();
      
      // Simulate playback time updates
      videoElement.simulateTimeUpdate(1);
      videoElement.simulateTimeUpdate(2);
      videoElement.simulateTimeUpdate(3);
      
      // Pause
      controller.pause();
      
      expect(videoElement.src).toBe('test.mp4');
      expect(videoElement.play).toHaveBeenCalled();
      expect(videoElement.pause).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledTimes(3);
    });

    it('should handle seek during playback', async () => {
      await controller.play();
      
      controller.seek(30);
      expect(videoElement.currentTime).toBe(30);
      
      controller.seek(60);
      expect(videoElement.currentTime).toBe(60);
    });
  });
});
```

**Run tests:**
```bash
pnpm test VideoController
```

**Expected output:**
```
✓ src/utils/__tests__/VideoController.test.ts (17)
  ✓ VideoController (17)
    ✓ load (3)
    ✓ play (2)
    ✓ pause (1)
    ✓ seek (3)
    ✓ getCurrentTime (2)
    ✓ getDuration (1)
    ✓ onUpdate (3)
    ✓ integration scenarios (2)

Test Files  1 passed (1)
     Tests  17 passed (17)
```

**Why these tests matter:**
- VideoController is a pure class (perfect for unit testing)
- Tests verify interface contract (load, play, pause, seek)
- Catches regressions when refactoring playback logic
- Validates time update callback mechanism
- No UI dependencies = fast, reliable tests
- [ ] **Run unit tests: `pnpm test VideoController`**

---

#### 🧪 Unit Tests (PR #5)

**Test File:** `src/utils/VideoController.test.ts`

These tests verify VideoController logic without requiring actual video playback.

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VideoController } from './VideoController';

describe('VideoController', () => {
  let mockVideoElement: any;
  let controller: VideoController;

  beforeEach(() => {
    // Create mock video element
    mockVideoElement = {
      src: '',
      currentTime: 0,
      duration: 60,
      paused: true,
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      onloadedmetadata: null,
      onerror: null,
      ontimeupdate: null
    };

    controller = new VideoController(mockVideoElement);
  });

  describe('load', () => {
    it('should set video src and resolve when metadata loads', async () => {
      const loadPromise = controller.load('/path/to/video.mp4');
      
      expect(mockVideoElement.src).toBe('/path/to/video.mp4');
      
      // Simulate metadata loaded
      mockVideoElement.onloadedmetadata();
      
      await expect(loadPromise).resolves.toBeUndefined();
    });

    it('should reject on error', async () => {
      const loadPromise = controller.load('/invalid/video.mp4');
      
      // Simulate error
      mockVideoElement.onerror(new Error('Failed to load'));
      
      await expect(loadPromise).rejects.toThrow();
    });
  });

  describe('play', () => {
    it('should call video element play method', async () => {
      await controller.play();
      
      expect(mockVideoElement.play).toHaveBeenCalled();
    });

    it('should return play promise', async () => {
      const result = controller.play();
      
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBeUndefined();
    });
  });

  describe('pause', () => {
    it('should call video element pause method', () => {
      controller.pause();
      
      expect(mockVideoElement.pause).toHaveBeenCalled();
    });
  });

  describe('seek', () => {
    it('should set currentTime to specified seconds', () => {
      controller.seek(30);
      
      expect(mockVideoElement.currentTime).toBe(30);
    });

    it('should handle seeking to start', () => {
      controller.seek(0);
      
      expect(mockVideoElement.currentTime).toBe(0);
    });

    it('should handle seeking to end', () => {
      controller.seek(60);
      
      expect(mockVideoElement.currentTime).toBe(60);
    });
  });

  describe('getCurrentTime', () => {
    it('should return current playback time', () => {
      mockVideoElement.currentTime = 15.5;
      
      expect(controller.getCurrentTime()).toBe(15.5);
    });
  });

  describe('getDuration', () => {
    it('should return video duration', () => {
      mockVideoElement.duration = 120;
      
      expect(controller.getDuration()).toBe(120);
    });
  });

  describe('onUpdate', () => {
    it('should call callback on time update', () => {
      const callback = vi.fn();
      controller.onUpdate(callback);
      
      mockVideoElement.currentTime = 10;
      mockVideoElement.ontimeupdate();
      
      expect(callback).toHaveBeenCalledWith(10);
    });

    it('should update callback on multiple time updates', () => {
      const callback = vi.fn();
      controller.onUpdate(callback);
      
      mockVideoElement.currentTime = 5;
      mockVideoElement.ontimeupdate();
      
      mockVideoElement.currentTime = 10;
      mockVideoElement.ontimeupdate();
      
      mockVideoElement.currentTime = 15;
      mockVideoElement.ontimeupdate();
      
      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenLastCalledWith(15);
    });
  });

  describe('isPlaying', () => {
    it('should return true when video is playing', () => {
      mockVideoElement.paused = false;
      
      expect(controller.isPlaying()).toBe(true);
    });

    it('should return false when video is paused', () => {
      mockVideoElement.paused = true;
      
      expect(controller.isPlaying()).toBe(false);
    });
  });
});
```

**Implementation file (updated):** `src/utils/VideoController.ts`

```typescript
export class VideoController {
  private videoElement: HTMLVideoElement;
  private onTimeUpdate: (time: number) => void = () => {};
  
  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
  }
  
  load(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.videoElement.src = src;
      this.videoElement.onloadedmetadata = () => resolve();
      this.videoElement.onerror = reject;
    });
  }
  
  play(): Promise<void> {
    return this.videoElement.play();
  }
  
  pause(): void {
    this.videoElement.pause();
  }
  
  seek(seconds: number): void {
    this.videoElement.currentTime = seconds;
  }
  
  getCurrentTime(): number {
    return this.videoElement.currentTime;
  }
  
  getDuration(): number {
    return this.videoElement.duration;
  }
  
  isPlaying(): boolean {
    return !this.videoElement.paused;
  }
  
  onUpdate(callback: (time: number) => void): void {
    this.onTimeUpdate = callback;
    this.videoElement.ontimeupdate = () => {
      callback(this.videoElement.currentTime);
    };
  }
}
```

**Test Task Checklist:**
- [ ] Create `src/utils/VideoController.test.ts`
- [ ] Add isPlaying() method to VideoController
- [ ] Mock HTMLVideoElement for testing
- [ ] Test load, play, pause, seek methods
- [ ] Test time update callbacks
- [ ] Run tests: `pnpm test VideoController`
- [ ] All tests pass
- [ ] VideoController is fully unit tested

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
import { Rect, Group, Line } from 'react-konva';

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

#### Unit Tests for PR #6

Create test file: `src/utils/__tests__/trim.test.ts`

**What to test:**
1. **Trim validation** - Ensure in-point < out-point
2. **Trim bounds checking** - Cannot trim outside clip duration
3. **Effective duration calculation** - trimEnd - trimStart
4. **Edge case handling** - Invalid trim values

**Test file:**
```typescript
// src/utils/__tests__/trim.test.ts
import { describe, it, expect } from 'vitest';
import {
  validateTrimPoints,
  calculateEffectiveDuration,
  constrainTrimPoint,
  isValidTrim
} from '../trimUtils';

describe('Trim Utilities', () => {
  describe('validateTrimPoints', () => {
    it('should accept valid trim points', () => {
      const result = validateTrimPoints(5, 20, 30);
      expect(result.valid).toBe(true);
      expect(result.trimStart).toBe(5);
      expect(result.trimEnd).toBe(20);
    });

    it('should reject in-point after out-point', () => {
      const result = validateTrimPoints(20, 10, 30);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('in-point must be before out-point');
    });

    it('should reject in-point at out-point', () => {
      const result = validateTrimPoints(10, 10, 30);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('in-point must be before out-point');
    });

    it('should reject negative in-point', () => {
      const result = validateTrimPoints(-5, 20, 30);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be negative');
    });

    it('should reject out-point beyond duration', () => {
      const result = validateTrimPoints(5, 35, 30);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot exceed clip duration');
    });

    it('should handle edge case: trim entire clip', () => {
      const result = validateTrimPoints(0, 30, 30);
      expect(result.valid).toBe(true);
      expect(result.trimStart).toBe(0);
      expect(result.trimEnd).toBe(30);
    });

    it('should handle edge case: trim to 1 second', () => {
      const result = validateTrimPoints(10, 11, 30);
      expect(result.valid).toBe(true);
      expect(calculateEffectiveDuration(result.trimStart, result.trimEnd)).toBe(1);
    });
  });

  describe('calculateEffectiveDuration', () => {
    it('should calculate duration from trim points', () => {
      expect(calculateEffectiveDuration(5, 20)).toBe(15);
      expect(calculateEffectiveDuration(0, 30)).toBe(30);
      expect(calculateEffectiveDuration(10, 10.5)).toBe(0.5);
    });

    it('should return 0 for invalid trim', () => {
      expect(calculateEffectiveDuration(20, 10)).toBe(0);
      expect(calculateEffectiveDuration(10, 10)).toBe(0);
    });

    it('should handle fractional seconds', () => {
      expect(calculateEffectiveDuration(5.5, 10.75)).toBe(5.25);
    });
  });

  describe('constrainTrimPoint', () => {
    it('should constrain trim point within clip bounds', () => {
      expect(constrainTrimPoint(-5, 0, 30)).toBe(0);
      expect(constrainTrimPoint(35, 0, 30)).toBe(30);
      expect(constrainTrimPoint(15, 0, 30)).toBe(15);
    });

    it('should handle edge values', () => {
      expect(constrainTrimPoint(0, 0, 30)).toBe(0);
      expect(constrainTrimPoint(30, 0, 30)).toBe(30);
    });
  });

  describe('isValidTrim', () => {
    it('should return true for valid trim', () => {
      expect(isValidTrim(5, 20, 30)).toBe(true);
      expect(isValidTrim(0, 30, 30)).toBe(true);
    });

    it('should return false for invalid trim', () => {
      expect(isValidTrim(20, 10, 30)).toBe(false); // in > out
      expect(isValidTrim(-5, 20, 30)).toBe(false); // negative
      expect(isValidTrim(5, 35, 30)).toBe(false); // exceeds duration
      expect(isValidTrim(10, 10, 30)).toBe(false); // in === out
    });
  });

  describe('trim handle drag constraints', () => {
    it('should constrain left handle drag', () => {
      const clipX = 0;
      const clipDuration = 30;
      const currentTrimEnd = 20;
      
      // Test dragging left handle
      const minX = clipX; // Can't go before clip start
      const maxX = clipX + (currentTrimEnd * 100) - 10; // Can't go past out-point
      
      expect(constrainTrimPoint(-5, 0, currentTrimEnd)).toBe(0);
      expect(constrainTrimPoint(25, 0, currentTrimEnd)).toBe(currentTrimEnd);
    });

    it('should constrain right handle drag', () => {
      const clipX = 0;
      const clipDuration = 30;
      const currentTrimStart = 5;
      
      // Test dragging right handle
      const minX = clipX + (currentTrimStart * 100) + 10; // Can't go before in-point
      const maxX = clipX + (clipDuration * 100); // Can't go past clip end
      
      expect(constrainTrimPoint(3, currentTrimStart, clipDuration)).toBe(currentTrimStart);
      expect(constrainTrimPoint(35, currentTrimStart, clipDuration)).toBe(clipDuration);
    });
  });

  describe('integration scenarios', () => {
    it('should handle typical trim workflow', () => {
      const clipDuration = 30;
      
      // User sets in-point at 5s
      let trimStart = 5;
      let trimEnd = clipDuration;
      expect(isValidTrim(trimStart, trimEnd, clipDuration)).toBe(true);
      
      // User sets out-point at 20s
      trimEnd = 20;
      expect(isValidTrim(trimStart, trimEnd, clipDuration)).toBe(true);
      
      // Calculate effective duration
      expect(calculateEffectiveDuration(trimStart, trimEnd)).toBe(15);
    });

    it('should handle reset trim', () => {
      const clipDuration = 30;
      
      // After trimming, user resets
      const trimStart = 0;
      const trimEnd = clipDuration;
      
      expect(isValidTrim(trimStart, trimEnd, clipDuration)).toBe(true);
      expect(calculateEffectiveDuration(trimStart, trimEnd)).toBe(clipDuration);
    });

    it('should handle precision trimming', () => {
      const clipDuration = 60;
      
      // User trims to exact frames (at 30fps, 0.033s per frame)
      const trimStart = 10.033;
      const trimEnd = 25.067;
      
      expect(isValidTrim(trimStart, trimEnd, clipDuration)).toBe(true);
      expect(calculateEffectiveDuration(trimStart, trimEnd)).toBeCloseTo(15.034, 2);
    });
  });
});
```

**Implementation hints for `src/utils/trimUtils.ts`:**
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

**Expected output:**
```
✓ src/utils/__tests__/trim.test.ts (21)
  ✓ Trim Utilities (21)
    ✓ validateTrimPoints (7)
    ✓ calculateEffectiveDuration (3)
    ✓ constrainTrimPoint (2)
    ✓ isValidTrim (2)
    ✓ trim handle drag constraints (2)
    ✓ integration scenarios (3)

Test Files  1 passed (1)
     Tests  21 passed (21)
```

**Why these tests matter:**
- Trim validation prevents invalid states (in > out, negative values)
- Edge cases are critical (what if user drags handle past bounds?)
- Tests document valid trim behavior
- Prevents bugs in timeline rendering (invalid trim = visual glitches)
- [ ] **Run unit tests: `pnpm test trim`**

---

#### 🧪 Unit Tests (PR #6)

**Test File:** `src/utils/trimUtils.test.ts`

These tests verify trim logic, bounds checking, and validation.

```typescript
import { describe, it, expect } from 'vitest';
import { 
  validateTrimPoints, 
  calculateTrimmedDuration,
  isClipTrimmed,
  resetTrim,
  constrainTrimHandle
} from './trimUtils';

describe('Trim Utils', () => {
  describe('validateTrimPoints', () => {
    it('should validate correct trim points', () => {
      const result = validateTrimPoints(10, 40, 60);
      
      expect(result.valid).toBe(true);
      expect(result.trimStart).toBe(10);
      expect(result.trimEnd).toBe(40);
    });

    it('should reject when trimStart >= trimEnd', () => {
      const result = validateTrimPoints(40, 40, 60);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Trim start must be before trim end');
    });

    it('should reject when trimStart < 0', () => {
      const result = validateTrimPoints(-5, 40, 60);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Trim start must be >= 0');
    });

    it('should reject when trimEnd > duration', () => {
      const result = validateTrimPoints(10, 70, 60);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Trim end cannot exceed clip duration');
    });

    it('should auto-correct trimStart > trimEnd', () => {
      // If user accidentally sets in-point after out-point, swap them
      const result = validateTrimPoints(50, 20, 60);
      
      expect(result.valid).toBe(true);
      expect(result.trimStart).toBe(20);
      expect(result.trimEnd).toBe(50);
    });

    it('should ensure minimum trim duration', () => {
      // Minimum 0.1 second trim
      const result = validateTrimPoints(10, 10.05, 60);
      
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Trimmed duration too short (min 0.1s)');
    });
  });

  describe('calculateTrimmedDuration', () => {
    it('should calculate trimmed duration', () => {
      expect(calculateTrimmedDuration(10, 40)).toBe(30);
      expect(calculateTrimmedDuration(0, 60)).toBe(60);
      expect(calculateTrimmedDuration(5.5, 15.5)).toBe(10);
    });

    it('should handle fractional seconds', () => {
      expect(calculateTrimmedDuration(10.25, 20.75)).toBe(10.5);
    });
  });

  describe('isClipTrimmed', () => {
    it('should return true for trimmed clip', () => {
      const clip = { duration: 60, trimStart: 10, trimEnd: 40 };
      expect(isClipTrimmed(clip)).toBe(true);
    });

    it('should return false for untrimmed clip', () => {
      const clip = { duration: 60, trimStart: 0, trimEnd: 60 };
      expect(isClipTrimmed(clip)).toBe(false);
    });

    it('should return true if only start is trimmed', () => {
      const clip = { duration: 60, trimStart: 10, trimEnd: 60 };
      expect(isClipTrimmed(clip)).toBe(true);
    });

    it('should return true if only end is trimmed', () => {
      const clip = { duration: 60, trimStart: 0, trimEnd: 50 };
      expect(isClipTrimmed(clip)).toBe(true);
    });
  });

  describe('resetTrim', () => {
    it('should reset trim to full clip duration', () => {
      const clip = { duration: 60, trimStart: 10, trimEnd: 40 };
      const reset = resetTrim(clip);
      
      expect(reset.trimStart).toBe(0);
      expect(reset.trimEnd).toBe(60);
    });
  });

  describe('constrainTrimHandle', () => {
    const PIXELS_PER_SECOND = 100;
    const clip = { 
      x: 0, 
      duration: 60, 
      trimStart: 0, 
      trimEnd: 60 
    };

    it('should constrain left handle within clip bounds', () => {
      const newX = constrainTrimHandle(
        'left',
        -500, // Attempt to drag before clip start
        clip,
        PIXELS_PER_SECOND
      );
      
      expect(newX).toBe(0); // Should be constrained to clip start
    });

    it('should prevent left handle from crossing right handle', () => {
      const clipWithTrim = { ...clip, trimStart: 0, trimEnd: 30 };
      const newX = constrainTrimHandle(
        'left',
        3500, // Attempt to drag past out-point (30s = 3000px)
        clipWithTrim,
        PIXELS_PER_SECOND
      );
      
      expect(newX).toBeLessThan(3000);
    });

    it('should constrain right handle within clip bounds', () => {
      const newX = constrainTrimHandle(
        'right',
        7000, // Attempt to drag past clip end (60s = 6000px)
        clip,
        PIXELS_PER_SECOND
      );
      
      expect(newX).toBe(6000); // Should be constrained to clip end
    });

    it('should prevent right handle from crossing left handle', () => {
      const clipWithTrim = { ...clip, trimStart: 30, trimEnd: 60 };
      const newX = constrainTrimHandle(
        'right',
        2500, // Attempt to drag before in-point (30s = 3000px)
        clipWithTrim,
        PIXELS_PER_SECOND
      );
      
      expect(newX).toBeGreaterThan(3000);
    });
  });
});
```

**Implementation file:** `src/utils/trimUtils.ts`

```typescript
interface TrimValidation {
  valid: boolean;
  trimStart: number;
  trimEnd: number;
  error?: string;
}

export function validateTrimPoints(
  trimStart: number,
  trimEnd: number,
  duration: number
): TrimValidation {
  // Auto-swap if start > end
  if (trimStart > trimEnd) {
    [trimStart, trimEnd] = [trimEnd, trimStart];
  }

  if (trimStart < 0) {
    return { valid: false, trimStart, trimEnd, error: 'Trim start must be >= 0' };
  }

  if (trimEnd > duration) {
    return { valid: false, trimStart, trimEnd, error: 'Trim end cannot exceed clip duration' };
  }

  if (trimStart >= trimEnd) {
    return { valid: false, trimStart, trimEnd, error: 'Trim start must be before trim end' };
  }

  const trimmedDuration = trimEnd - trimStart;
  if (trimmedDuration < 0.1) {
    return { valid: false, trimStart, trimEnd, error: 'Trimmed duration too short (min 0.1s)' };
  }

  return { valid: true, trimStart, trimEnd };
}

export function calculateTrimmedDuration(trimStart: number, trimEnd: number): number {
  return trimEnd - trimStart;
}

export function isClipTrimmed(clip: any): boolean {
  return clip.trimStart > 0 || clip.trimEnd < clip.duration;
}

export function resetTrim(clip: any): { trimStart: number; trimEnd: number } {
  return {
    trimStart: 0,
    trimEnd: clip.duration
  };
}

export function constrainTrimHandle(
  handle: 'left' | 'right',
  newX: number,
  clip: any,
  pixelsPerSecond: number
): number {
  const clipStartX = clip.x;
  const clipEndX = clip.x + (clip.duration * pixelsPerSecond);
  const otherHandleX = handle === 'left' 
    ? clip.x + (clip.trimEnd * pixelsPerSecond)
    : clip.x + (clip.trimStart * pixelsPerSecond);

  if (handle === 'left') {
    const minX = clipStartX;
    const maxX = otherHandleX - 10; // Leave 10px gap (0.1s min)
    return Math.max(minX, Math.min(maxX, newX));
  } else {
    const minX = otherHandleX + 10; // Leave 10px gap
    const maxX = clipEndX;
    return Math.max(minX, Math.min(maxX, newX));
  }
}
```

**Test Task Checklist:**
- [ ] Create `src/utils/trimUtils.test.ts`
- [ ] Create `src/utils/trimUtils.ts`
- [ ] Implement validateTrimPoints with all edge cases
- [ ] Implement constrainTrimHandle for drag bounds
- [ ] Implement helper functions
- [ ] Run tests: `pnpm test trim`
- [ ] All tests pass
- [ ] Use these utils in Timeline.tsx for trim handles

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

#### Key FFmpeg Commands:
- [ ] **Phase 1:** Single-clip trimmed export
- [ ] **Phase 2:** Multiple-clip concatenation with filelist.txt
- [ ] Parse progress: extract `time=HH:MM:SS` from stderr
- [ ] Calculate progress: `(currentTime / totalDuration) * 100`

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

**Handling trimmed clips in concatenation:**

Option A (simpler, but slower): Pre-export each trimmed clip to temp files
```typescript
// Create temp trimmed files first
const tempClips = await Promise.all(clips.map(async (clip) => {
  if (clip.trimStart > 0 || clip.trimEnd < clip.duration) {
    const tempPath = join(tmpdir(), `trim-${clip.id}.mp4`);
    await exportSingleClip(clip, tempPath);
    return tempPath;
  }
  return clip.filePath; // Untrimmed clips use original file
}));

// Then concatenate temp files
```

Option B (advanced, faster): Use complex filter
```typescript
// Use FFmpeg complex filter (more efficient, no temp files)
// This is more advanced - implement if time permits
```

For MVP, use **Option A** (simpler).

#### Key Features:
- [ ] "Export" button prominent in UI
- [ ] Click export → save file dialog
- [ ] Choose output location and filename
- [ ] Progress bar shows percentage (0-100%)
- [ ] Success message when complete
- [ ] Error message if export fails

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

#### Unit Tests for PR #7

Create test file: `src/utils/__tests__/export.test.ts`

**What to test:**
1. **FFmpeg command building** - Correct arguments for trim/concat
2. **Filelist.txt generation** - Proper format for concat
3. **Progress parsing** - Extract percentage from stderr
4. **Temp file path generation** - Unique filenames

**Test file:**
```typescript
// src/utils/__tests__/export.test.ts
import { describe, it, expect } from 'vitest';
import {
  buildSingleClipExportCommand,
  buildConcatExportCommand,
  generateFilelistContent,
  parseTempFilePath,
  parseExportProgress
} from '../exportUtils';
import type { TimelineClip } from '../../types';

describe('Export Utilities', () => {
  describe('buildSingleClipExportCommand', () => {
    it('should build command for untrimmed clip', () => {
      const clip: TimelineClip = {
        id: '1',
        filePath: '/path/to/video.mp4',
        filename: 'video.mp4',
        duration: 30,
        trimStart: 0,
        trimEnd: 30,
        startTime: 0
      };
      
      const args = buildSingleClipExportCommand(clip, '/output/result.mp4');
      
      expect(args).toContain('-i');
      expect(args).toContain('/path/to/video.mp4');
      expect(args).toContain('-c:v');
      expect(args).toContain('libx264');
      expect(args).toContain('/output/result.mp4');
      expect(args).not.toContain('-ss'); // No trim, so no -ss
    });

    it('should build command for trimmed clip', () => {
      const clip: TimelineClip = {
        id: '1',
        filePath: '/path/to/video.mp4',
        filename: 'video.mp4',
        duration: 30,
        trimStart: 5,
        trimEnd: 20,
        startTime: 0
      };
      
      const args = buildSingleClipExportCommand(clip, '/output/result.mp4');
      
      expect(args).toContain('-ss');
      expect(args).toContain('5');
      expect(args).toContain('-t');
      expect(args).toContain('15'); // duration = 20 - 5
    });

    it('should include proper codecs', () => {
      const clip: TimelineClip = {
        id: '1',
        filePath: '/video.mp4',
        filename: 'video.mp4',
        duration: 10,
        trimStart: 0,
        trimEnd: 10,
        startTime: 0
      };
      
      const args = buildSingleClipExportCommand(clip, '/output.mp4');
      
      expect(args).toContain('-c:v');
      expect(args).toContain('libx264');
      expect(args).toContain('-c:a');
      expect(args).toContain('aac');
    });

    it('should handle fractional trim times', () => {
      const clip: TimelineClip = {
        id: '1',
        filePath: '/video.mp4',
        filename: 'video.mp4',
        duration: 30,
        trimStart: 5.5,
        trimEnd: 20.75,
        startTime: 0
      };
      
      const args = buildSingleClipExportCommand(clip, '/output.mp4');
      
      expect(args).toContain('-ss');
      expect(args).toContain('5.5');
      expect(args).toContain('-t');
      expect(args).toContain('15.25');
    });
  });

  describe('buildConcatExportCommand', () => {
    it('should build command with filelist path', () => {
      const filelistPath = '/tmp/clipforge-123.txt';
      const args = buildConcatExportCommand(filelistPath, '/output/result.mp4');
      
      expect(args).toContain('-f');
      expect(args).toContain('concat');
      expect(args).toContain('-safe');
      expect(args).toContain('0');
      expect(args).toContain('-i');
      expect(args).toContain(filelistPath);
      expect(args).toContain('/output/result.mp4');
    });

    it('should include -safe 0 flag', () => {
      const args = buildConcatExportCommand('/tmp/list.txt', '/out.mp4');
      
      const safeIndex = args.indexOf('-safe');
      expect(safeIndex).toBeGreaterThan(-1);
      expect(args[safeIndex + 1]).toBe('0');
    });
  });

  describe('generateFilelistContent', () => {
    it('should generate filelist for multiple clips', () => {
      const clips: TimelineClip[] = [
        {
          id: '1',
          filePath: '/videos/clip1.mp4',
          filename: 'clip1.mp4',
          duration: 10,
          trimStart: 0,
          trimEnd: 10,
          startTime: 0
        },
        {
          id: '2',
          filePath: '/videos/clip2.mp4',
          filename: 'clip2.mp4',
          duration: 15,
          trimStart: 0,
          trimEnd: 15,
          startTime: 10
        },
        {
          id: '3',
          filePath: '/videos/clip3.mp4',
          filename: 'clip3.mp4',
          duration: 20,
          trimStart: 0,
          trimEnd: 20,
          startTime: 25
        }
      ];
      
      const content = generateFilelistContent(clips);
      
      expect(content).toContain("file '/videos/clip1.mp4'");
      expect(content).toContain("file '/videos/clip2.mp4'");
      expect(content).toContain("file '/videos/clip3.mp4'");
    });

    it('should format each line correctly', () => {
      const clips: TimelineClip[] = [
        {
          id: '1',
          filePath: '/path/to/video.mp4',
          filename: 'video.mp4',
          duration: 10,
          trimStart: 0,
          trimEnd: 10,
          startTime: 0
        }
      ];
      
      const content = generateFilelistContent(clips);
      
      // Each line should be: file '/path/to/video.mp4'
      expect(content).toMatch(/^file '.+'\n?$/);
    });

    it('should handle Windows paths', () => {
      const clips: TimelineClip[] = [
        {
          id: '1',
          filePath: 'C:\\Users\\Videos\\clip.mp4',
          filename: 'clip.mp4',
          duration: 10,
          trimStart: 0,
          trimEnd: 10,
          startTime: 0
        }
      ];
      
      const content = generateFilelistContent(clips);
      
      expect(content).toContain("file 'C:\\Users\\Videos\\clip.mp4'");
    });

    it('should handle paths with spaces', () => {
      const clips: TimelineClip[] = [
        {
          id: '1',
          filePath: '/videos/my video file.mp4',
          filename: 'my video file.mp4',
          duration: 10,
          trimStart: 0,
          trimEnd: 10,
          startTime: 0
        }
      ];
      
      const content = generateFilelistContent(clips);
      
      expect(content).toContain("file '/videos/my video file.mp4'");
    });
  });

  describe('parseTempFilePath', () => {
    it('should generate unique temp file paths', () => {
      const path1 = parseTempFilePath();
      const path2 = parseTempFilePath();
      
      expect(path1).not.toBe(path2);
      expect(path1).toContain('clipforge-');
      expect(path1).toContain('.txt');
    });

    it('should include timestamp in path', () => {
      const path = parseTempFilePath();
      
      // Should contain a number (timestamp)
      expect(path).toMatch(/clipforge-\d+\.txt/);
    });
  });

  describe('parseExportProgress', () => {
    it('should parse progress from FFmpeg stderr', () => {
      const stderr = 'frame= 150 fps= 30 q=28.0 size=    1024kB time=00:00:05.00 bitrate=1677.7kbits/s speed=1.5x';
      const totalDuration = 30;
      
      const progress = parseExportProgress(stderr, totalDuration);
      
      expect(progress).toBe(17); // 5s / 30s = 16.67% ~= 17%
    });

    it('should handle different time formats', () => {
      const testCases = [
        { stderr: 'time=00:00:10.00', duration: 100, expected: 10 },
        { stderr: 'time=00:01:00.00', duration: 120, expected: 50 },
        { stderr: 'time=00:00:30.50', duration: 60, expected: 51 },
      ];
      
      testCases.forEach(({ stderr, duration, expected }) => {
        const progress = parseExportProgress(stderr, duration);
        expect(progress).toBe(expected);
      });
    });

    it('should return 0 for invalid stderr', () => {
      expect(parseExportProgress('invalid output', 30)).toBe(0);
      expect(parseExportProgress('', 30)).toBe(0);
      expect(parseExportProgress('no time here', 30)).toBe(0);
    });

    it('should cap progress at 100%', () => {
      const stderr = 'time=00:01:00.00';
      const totalDuration = 30; // Time exceeds duration
      
      const progress = parseExportProgress(stderr, totalDuration);
      
      expect(progress).toBe(100);
    });

    it('should handle progress near completion', () => {
      const stderr = 'time=00:00:29.99';
      const totalDuration = 30;
      
      const progress = parseExportProgress(stderr, totalDuration);
      
      expect(progress).toBeGreaterThan(98);
      expect(progress).toBeLessThanOrEqual(100);
    });
  });

  describe('integration scenarios', () => {
    it('should handle single-clip export workflow', () => {
      const clip: TimelineClip = {
        id: '1',
        filePath: '/videos/clip.mp4',
        filename: 'clip.mp4',
        duration: 30,
        trimStart: 5,
        trimEnd: 20,
        startTime: 0
      };
      
      const args = buildSingleClipExportCommand(clip, '/output/final.mp4');
      
      // Verify command structure
      expect(args).toContain('-ss');
      expect(args).toContain('5');
      expect(args).toContain('-t');
      expect(args).toContain('15');
      expect(args).toContain('-i');
      expect(args).toContain('/videos/clip.mp4');
    });

    it('should handle multi-clip export workflow', () => {
      const clips: TimelineClip[] = [
        {
          id: '1',
          filePath: '/videos/a.mp4',
          filename: 'a.mp4',
          duration: 10,
          trimStart: 0,
          trimEnd: 10,
          startTime: 0
        },
        {
          id: '2',
          filePath: '/videos/b.mp4',
          filename: 'b.mp4',
          duration: 15,
          trimStart: 0,
          trimEnd: 15,
          startTime: 10
        }
      ];
      
      // Generate filelist
      const filelistContent = generateFilelistContent(clips);
      expect(filelistContent).toContain("file '/videos/a.mp4'");
      expect(filelistContent).toContain("file '/videos/b.mp4'");
      
      // Generate temp path
      const tempPath = parseTempFilePath();
      expect(tempPath).toMatch(/clipforge-\d+\.txt/);
      
      // Build concat command
      const args = buildConcatExportCommand(tempPath, '/output/final.mp4');
      expect(args).toContain('-f');
      expect(args).toContain('concat');
      expect(args).toContain('-safe');
      expect(args).toContain('0');
    });
  });
});
```

**Implementation hints for `src/utils/exportUtils.ts`:**
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

**Expected output:**
```
✓ src/utils/__tests__/export.test.ts (24)
  ✓ Export Utilities (24)
    ✓ buildSingleClipExportCommand (4)
    ✓ buildConcatExportCommand (2)
    ✓ generateFilelistContent (4)
    ✓ parseTempFilePath (2)
    ✓ parseExportProgress (6)
    ✓ integration scenarios (2)

Test Files  1 passed (1)
     Tests  24 passed (24)
```

**Why these tests matter:**
- FFmpeg command building is critical - wrong args = export fails
- Filelist generation must be exact format or concat fails
- Progress parsing affects user experience (accurate progress bar)
- Tests catch platform-specific path issues (Windows vs Mac/Linux)
- No external dependencies = fast, reliable tests
- [ ] **Run unit tests: `pnpm test export`**

---

#### 🧪 Unit Tests (PR #7)

**Test File:** `src/utils/exportUtils.test.ts`

These tests verify FFmpeg command building without actually running FFmpeg.

```typescript
import { describe, it, expect } from 'vitest';
import { 
  buildExportCommand,
  buildConcatFileList,
  calculateExportDuration,
  parseExportProgress
} from './exportUtils';

describe('Export Utils', () => {
  describe('buildExportCommand', () => {
    it('should build command for single untrimmed clip', () => {
      const clip = {
        id: '1',
        filePath: '/videos/clip1.mp4',
        duration: 60,
        trimStart: 0,
        trimEnd: 60
      };

      const args = buildExportCommand([clip], '/output/final.mp4');

      expect(args).toContain('-i');
      expect(args).toContain('/videos/clip1.mp4');
      expect(args).toContain('-c:v');
      expect(args).toContain('libx264');
      expect(args).toContain('-c:a');
      expect(args).toContain('aac');
      expect(args).toContain('/output/final.mp4');
      
      // Should NOT have trim flags
      expect(args).not.toContain('-ss');
      expect(args).not.toContain('-t');
    });

    it('should build command for single trimmed clip', () => {
      const clip = {
        id: '1',
        filePath: '/videos/clip1.mp4',
        duration: 60,
        trimStart: 10,
        trimEnd: 40
      };

      const args = buildExportCommand([clip], '/output/trimmed.mp4');

      expect(args).toContain('-ss');
      expect(args).toContain('10');
      expect(args).toContain('-t');
      expect(args).toContain('30'); // duration = 40 - 10
      expect(args).toContain('/videos/clip1.mp4');
    });

    it('should build concat command for multiple clips', () => {
      const clips = [
        { id: '1', filePath: '/videos/clip1.mp4', duration: 30, trimStart: 0, trimEnd: 30 },
        { id: '2', filePath: '/videos/clip2.mp4', duration: 45, trimStart: 0, trimEnd: 45 }
      ];

      const args = buildExportCommand(clips, '/output/concat.mp4');

      expect(args).toContain('-f');
      expect(args).toContain('concat');
      expect(args).toContain('-safe');
      expect(args).toContain('0');
      expect(args).toContain('-i');
      // Should reference a temp filelist
      expect(args.some(arg => arg.includes('.txt'))).toBe(true);
    });
  });

  describe('buildConcatFileList', () => {
    it('should build filelist content for untrimmed clips', () => {
      const clips = [
        { id: '1', filePath: '/videos/clip1.mp4', duration: 30, trimStart: 0, trimEnd: 30 },
        { id: '2', filePath: '/videos/clip2.mp4', duration: 45, trimStart: 0, trimEnd: 45 }
      ];

      const filelist = buildConcatFileList(clips);

      expect(filelist).toContain("file '/videos/clip1.mp4'");
      expect(filelist).toContain("file '/videos/clip2.mp4'");
      expect(filelist.split('\n').length).toBe(2);
    });

    it('should handle file paths with special characters', () => {
      const clips = [
        { id: '1', filePath: "/videos/clip's video.mp4", duration: 30, trimStart: 0, trimEnd: 30 }
      ];

      const filelist = buildConcatFileList(clips);

      // Should properly escape or handle special characters
      expect(filelist).toContain("/videos/clip's video.mp4");
    });
  });

  describe('calculateExportDuration', () => {
    it('should calculate total export duration', () => {
      const clips = [
        { id: '1', duration: 60, trimStart: 10, trimEnd: 40 },  // 30s
        { id: '2', duration: 50, trimStart: 0, trimEnd: 50 },   // 50s
        { id: '3', duration: 30, trimStart: 5, trimEnd: 25 }    // 20s
      ];

      expect(calculateExportDuration(clips)).toBe(100);
    });

    it('should handle single clip', () => {
      const clips = [
        { id: '1', duration: 60, trimStart: 15, trimEnd: 45 }   // 30s
      ];

      expect(calculateExportDuration(clips)).toBe(30);
    });

    it('should return 0 for empty array', () => {
      expect(calculateExportDuration([])).toBe(0);
    });
  });

  describe('parseExportProgress', () => {
    it('should parse time from FFmpeg stderr', () => {
      const stderr = 'frame=  123 fps= 30 q=28.0 size=    1024kB time=00:00:30.50 bitrate= 345.6kbits/s speed=1.2x';
      
      const progress = parseExportProgress(stderr, 60); // 60s total duration

      expect(progress.currentTime).toBe(30.5);
      expect(progress.percentage).toBeCloseTo(50.83, 1); // 30.5/60 * 100
    });

    it('should handle progress at start', () => {
      const stderr = 'time=00:00:00.00';
      
      const progress = parseExportProgress(stderr, 60);

      expect(progress.currentTime).toBe(0);
      expect(progress.percentage).toBe(0);
    });

    it('should handle progress at end', () => {
      const stderr = 'time=00:01:00.00';
      
      const progress = parseExportProgress(stderr, 60);

      expect(progress.currentTime).toBe(60);
      expect(progress.percentage).toBe(100);
    });

    it('should return null for invalid output', () => {
      const stderr = 'some random output without time';
      
      const progress = parseExportProgress(stderr, 60);

      expect(progress).toBeNull();
    });

    it('should handle long duration videos', () => {
      const stderr = 'time=01:30:45.50'; // 1h 30m 45.5s
      
      const progress = parseExportProgress(stderr, 7200); // 2 hour total

      expect(progress.currentTime).toBe(5445.5);
      expect(progress.percentage).toBeCloseTo(75.63, 1);
    });
  });
});
```

**Implementation file:** `src/utils/exportUtils.ts`

```typescript
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFileSync } from 'fs';

export function buildExportCommand(clips: any[], outputPath: string): string[] {
  if (clips.length === 1) {
    return buildSingleClipCommand(clips[0], outputPath);
  } else {
    return buildConcatCommand(clips, outputPath);
  }
}

function buildSingleClipCommand(clip: any, outputPath: string): string[] {
  const args: string[] = [];
  
  const isTrimmed = clip.trimStart > 0 || clip.trimEnd < clip.duration;
  
  if (isTrimmed) {
    args.push('-ss', clip.trimStart.toString());
  }
  
  args.push('-i', clip.filePath);
  
  if (isTrimmed) {
    const duration = clip.trimEnd - clip.trimStart;
    args.push('-t', duration.toString());
  }
  
  args.push('-c:v', 'libx264', '-c:a', 'aac', outputPath);
  
  return args;
}

function buildConcatCommand(clips: any[], outputPath: string): string[] {
  const tempFilelist = join(tmpdir(), `clipforge-${Date.now()}.txt`);
  const filelistContent = buildConcatFileList(clips);
  
  writeFileSync(tempFilelist, filelistContent, 'utf-8');
  
  return [
    '-f', 'concat',
    '-safe', '0',
    '-i', tempFilelist,
    '-c:v', 'libx264',
    '-c:a', 'aac',
    outputPath
  ];
}

export function buildConcatFileList(clips: any[]): string {
  return clips.map(clip => `file '${clip.filePath}'`).join('\n');
}

export function calculateExportDuration(clips: any[]): number {
  return clips.reduce((total, clip) => {
    return total + (clip.trimEnd - clip.trimStart);
  }, 0);
}

export function parseExportProgress(
  stderr: string, 
  totalDuration: number
): { currentTime: number; percentage: number } | null {
  const timeMatch = stderr.match(/time=(\d+):(\d+):(\d+\.\d+)/);
  
  if (!timeMatch) return null;
  
  const hours = parseInt(timeMatch[1]);
  const minutes = parseInt(timeMatch[2]);
  const seconds = parseFloat(timeMatch[3]);
  
  const currentTime = hours * 3600 + minutes * 60 + seconds;
  const percentage = (currentTime / totalDuration) * 100;
  
  return { currentTime, percentage };
}
```

**Test Task Checklist:**
- [ ] Create `src/utils/exportUtils.test.ts`
- [ ] Create `src/utils/exportUtils.ts`
- [ ] Implement buildExportCommand (single + concat)
- [ ] Implement buildConcatFileList
- [ ] Implement calculateExportDuration
- [ ] Implement parseExportProgress
- [ ] Run tests: `pnpm test export`
- [ ] All tests pass
- [ ] Use these utils in FFmpeg handler

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
- [ ] **(Post-MVP)** Code signing and notarization for macOS
- [ ] **(Post-MVP)** Windows code signing

#### Files Created:
```
📄 build/icon.png (app icon)
📄 build/icon.icns (Mac)
📄 build/icon.ico (Windows)
```

#### Files Modified:
```
📝 package.json (add electron-builder config)
📝 electron.vite.config.ts (production build settings)
📝 .gitignore (ignore dist and release folders)
```

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

#### App Icons:
Create icons in `build/` directory:
- **icon.png** (512x512 or 1024x1024) - Base icon
- **icon.icns** (Mac) - Use `png2icns` or online converter
- **icon.ico** (Windows) - Use online converter or ImageMagick

**Quick icon creation:**
```bash
# Install iconutil (Mac) or use online tool
# Convert PNG to ICNS
# Convert PNG to ICO
```

Or use a simple placeholder for MVP and improve later.

#### Post-MVP: Code Signing & Notarization

**Note for reviewers:** Code signing and notarization are intentionally **NOT implemented for MVP**. These are production requirements but not needed for the 3-day MVP checkpoint.

**macOS Notarization (Post-MVP):**
```json
{
  "build": {
    "mac": {
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist"
    },
    "afterSign": "scripts/notarize.js"
  }
}
```

**Why not now?**
- Requires Apple Developer account ($99/year)
- Requires certificates and provisioning profiles
- Notarization takes 10-30 minutes per build
- Adds complexity during rapid iteration
- Users can still open app with "Right-click → Open"

**Windows Code Signing (Post-MVP):**
```json
{
  "build": {
    "win": {
      "certificateFile": "cert.pfx",
      "certificatePassword": "***"
    }
  }
}
```

**Why not now?**
- Requires code signing certificate ($150-400/year)
- Windows SmartScreen will flag unsigned apps anyway
- Not required for MVP demonstration
- Can distribute via GitHub Releases with warning

**For MVP, inform users:**
- macOS: "Right-click app → Open" to bypass Gatekeeper
- Windows: Click "More info" → "Run anyway" if SmartScreen appears

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

## Day 3 - Polish & Final Submission (Wednesday, Oct 29)

### PR #9: Bug Fixes & UI Polish
**Branch:** `fix/ui-polish`  
**Priority:** High  
**Estimated Time:** 3-4 hours  
**Status:** [ ] Not Started

**Description:** Fix critical bugs from MVP testing. Improve UI/UX and add quality-of-life features.

#### Tasks:
- [ ] Fix any bugs discovered in MVP testing
- [ ] Improve layout and spacing (TailwindCSS)
- [ ] Add loading states for async operations
- [ ] Improve error messages (user-friendly)
- [ ] Add tooltips or help text
- [ ] Improve timeline zoom/scroll UX
- [ ] Add keyboard shortcuts (Space = play/pause)
- [ ] Add delete clip from timeline
- [ ] Improve drag-and-drop visual feedback
- [ ] Optimize performance (if issues found)

#### Files Modified:
```
📝 src/components/MediaLibrary.tsx (improve layout)
📝 src/components/Timeline.tsx (improve interactions)
📝 src/components/VideoPlayer.tsx (improve controls)
📝 src/components/ExportControls.tsx (improve UX)
📝 src/index.css (improve global styles)
```

#### Features to Add:
- [ ] Loading spinner during import
- [ ] Loading spinner during export
- [ ] Disable buttons during operations
- [ ] Clear error/success messages
- [ ] Delete key removes selected clip from timeline
- [ ] Space bar toggles play/pause
- [ ] Better visual feedback for drag operations
- [ ] Improved timeline scrolling for long projects

#### Validation:
- [ ] All buttons have proper hover states
- [ ] Loading states show during async operations
- [ ] Error messages are clear and helpful
- [ ] Keyboard shortcuts work
- [ ] App feels responsive and polished

---

### PR #10: Documentation, Demo Video & Final Submission
**Branch:** `docs/final-submission`  
**Priority:** High  
**Estimated Time:** 2-3 hours  
**Status:** [ ] Not Started

**Description:** Create comprehensive documentation and demo video. Prepare final submission materials.

#### Tasks:
- [ ] Write comprehensive README
- [ ] Document installation instructions
- [ ] Document build instructions
- [ ] Create architecture overview
- [ ] Record demo video (3-5 minutes)
- [ ] Show all key features in demo
- [ ] Upload packaged app to GitHub Releases
- [ ] Create submission checklist
- [ ] Final testing on clean machine
- [ ] Submit before deadline

#### Files Created:
```
📄 README.md (comprehensive)
📄 ARCHITECTURE.md
📄 DEMO_VIDEO.md (link to demo)
📄 docs/setup-guide.md
📄 docs/development.md
```

#### Files Modified:
```
📝 README.md (final polish)
📝 package.json (final version number)
```

#### README.md Structure:
```markdown
# ClipForge

## Overview
Brief description and screenshot

## Features
- Video import (drag-and-drop, file picker)
- Timeline editing with React-Konva
- Trim clips with drag handles or buttons
- Export to MP4

## Installation

### Download Pre-built Binary
[Download for macOS / Windows from GitHub Releases]

**macOS Users:** On first launch, right-click the app icon and select "Open" to bypass Gatekeeper security check.

**Windows Users:** If SmartScreen appears, click "More info" → "Run anyway". The app is not code-signed yet (planned for v2).

### Build from Source
```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build

# Package for distribution
pnpm package:mac   # or package:win
```

## Usage
1. **Import videos** - Click "Import" or drag files into the app
2. **Arrange on timeline** - Drag clips from library to timeline
3. **Trim clips** - Drag handles on clips or use Set In/Out buttons
4. **Export** - Click "Export" and choose output location

## Tech Stack
- Electron + Vite + TypeScript
- React 18 + Zustand (state management)
- React-Konva (canvas-based timeline)
- FFmpeg (video processing)
- TailwindCSS (styling)

## Development
```bash
pnpm dev          # Start dev mode with HMR
pnpm build        # Build for production
pnpm package:mac  # Package for macOS
pnpm package:win  # Package for Windows
```

## Project Structure
See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical documentation.

## Known Limitations (MVP)
- Single track timeline (multi-track planned for v2)
- No undo/redo yet
- No transitions or effects yet
- No zoom/scroll on timeline (fixed scale for MVP)
- Not code-signed (requires certificates)

## Roadmap
See [GitHub Issues] for planned features.

## License
MIT

## Credits
Built in 72 hours for [project/competition name]
```

#### Demo Video Script (3-5 minutes):
1. **Intro (30s)** - Show app launching, explain purpose
2. **Import (45s)** - Demonstrate file picker and drag-and-drop
3. **Timeline (60s)** - Drag clips, arrange, show playhead
4. **Playback (45s)** - Play/pause, scrub timeline
5. **Trim (60s)** - Set in/out points, show visual markers
6. **Export (60s)** - Start export, show progress, play result
7. **Outro (30s)** - Recap features, show final video

#### Demo Video Checklist:
- [ ] Record in high quality (1080p minimum)
- [ ] Show clean UI (no dev tools open)
- [ ] Clear narration explaining each step
- [ ] Demonstrate all MVP features
- [ ] Show successful export and result
- [ ] Keep under 5 minutes
- [ ] Upload to YouTube/Vimeo
- [ ] Add link to README

#### Final Submission Checklist:
- [ ] ✅ GitHub repository is public
- [ ] ✅ README.md is comprehensive
- [ ] ✅ Setup instructions are clear
- [ ] ✅ Architecture overview provided
- [ ] ✅ Demo video (3-5 min) uploaded and linked
- [ ] ✅ Packaged app available for download
- [ ] ✅ Download link in README (GitHub Releases)
- [ ] ✅ Build instructions included
- [ ] ✅ All MVP features working
- [ ] ✅ Tested on clean machine
- [ ] ✅ No critical bugs
- [ ] ✅ Code is clean and commented

**FINAL SUBMISSION - WEDNESDAY 10:59 PM CT**

---

## Additional Tasks (Optional Stretch Goals)

### PR #11: Enhanced Features (If Time Permits)
**Branch:** `feat/enhancements`  
**Status:** [ ] Optional

#### Features:
- [ ] Multiple timeline tracks
- [ ] Split clip at playhead
- [ ] Undo/redo functionality
- [ ] Zoom controls for timeline
- [ ] Snap-to-grid for clips
- [ ] Audio waveform visualization
- [ ] Text overlays
- [ ] Transitions between clips
- [ ] Export resolution options (720p, 1080p, 4K)

---

## Git Workflow

### Branch Naming Convention:
```
feat/feature-name    - New features
fix/bug-description  - Bug fixes
docs/description     - Documentation
refactor/description - Code refactoring
test/description     - Testing
```

### Commit Message Convention:
```
feat: Add video import functionality
fix: Resolve timeline sync issue
docs: Update README with setup instructions
refactor: Simplify FFmpeg command builder
test: Add export validation tests
```

### PR Process:
1. Create feature branch from `main`
2. Implement feature with commits
3. Test thoroughly
4. Create PR with description
5. Merge to `main`
6. Delete feature branch
7. Move to next PR

### Example Git Flow:
```bash
# Start PR #1
git checkout -b feat/project-setup
# ... implement features ...
git add .
git commit -m "feat: Initialize Electron + Vite + React project"
git push origin feat/project-setup
# Create PR on GitHub
# Merge PR
git checkout main
git pull origin main

# Start PR #2
git checkout -b feat/file-import
# ... continue ...
```

---

## Progress Tracking

### Day 1 Progress:
- [ ] PR #1: Project Setup ✅
- [ ] PR #2: File Import ✅
- [ ] PR #3: FFmpeg Integration ✅

### Day 2 Progress (MVP Deadline):
- [ ] PR #4: Timeline UI ✅
- [ ] PR #5: Video Player ✅
- [ ] PR #6: Trim Functionality ✅
- [ ] PR #7: Export Pipeline ✅
- [ ] PR #8: Packaging & Testing ✅
- [ ] **MVP SUBMITTED** ✅

### Day 3 Progress (Final Deadline):
- [ ] PR #9: Bug Fixes & Polish ✅
- [ ] PR #10: Documentation & Demo ✅
- [ ] **FINAL SUBMITTED** ✅

---

## Testing Scenarios

### Core Workflow Test (Run Before Each PR Merge):
**Unit Tests (for PRs #3-7):**
- [ ] Run `pnpm test:run` - all tests must pass before merging

**Integration Test (manual):**
1. Import 3 video clips (different formats)
2. Drag all clips onto timeline
3. Play through entire timeline
4. Select middle clip
5. Trim middle clip (set in/out points)
6. Play again - verify trim applied
7. Export timeline to MP4
8. Verify exported video plays correctly
9. Verify audio is synchronized
10. Check timeline remains responsive

### Export Test Matrix:
| Scenario | Clips | Trim | Expected Result |
|----------|-------|------|-----------------|
| Single untrimmed | 1 | No | Full clip exported |
| Single trimmed | 1 | Yes | Trimmed portion only |
| Multiple untrimmed | 3 | No | All clips concatenated |
| Multiple trimmed | 3 | Yes | Trimmed portions concatenated |
| Mixed | 3 | Some | Trimmed + untrimmed mix |

### Performance Test:
- [ ] Import 10 clips
- [ ] Add all to timeline
- [ ] Play through timeline - smooth playback (30fps min)
- [ ] Drag clips around - responsive (<100ms lag)
- [ ] Export 2min video - completes without crash
- [ ] Memory usage stable (<500MB)
- [ ] No memory leaks after 15min session

---

## Emergency Fallback Plan

If running out of time on Day 2:

### Minimum Viable MVP (Absolute Minimum):
1. Import ONE clip (file picker only, skip drag-and-drop)
2. Show clip in simple list (skip thumbnails)
3. Manual text input for trim times (skip visual timeline)
4. Export with hardcoded trim values
5. No progress bar (just "Exporting..." text)
6. Basic packaging (even if not optimized)

This ensures you have SOMETHING to submit by the MVP deadline.

---

## Key Reminders

### Before Each PR:
- [ ] Test the feature thoroughly
- [ ] Check for TypeScript errors
- [ ] Ensure no console errors
- [ ] Test in dev mode
- [ ] Write clear commit messages

### Before MVP Submission (Tuesday):
- [ ] Test packaged app (not dev mode!)
- [ ] Verify all MVP requirements met
- [ ] Check acceptance criteria
- [ ] Test on clean machine if possible
- [ ] Submit before 10:59 PM CT

### Before Final Submission (Wednesday):
- [ ] README is complete
- [ ] Demo video uploaded
- [ ] Download links work
- [ ] All documentation clear
- [ ] Final testing complete
- [ ] Submit before 10:59 PM CT

---

## Success Criteria

### MVP Success (Tuesday):
✅ Desktop app launches  
✅ Import video files  
✅ Timeline displays clips  
✅ Video preview plays  
✅ Trim functionality works  
✅ Export to MP4 successful  
✅ Packaged as native app  

### Final Success (Wednesday):
✅ All MVP features polished  
✅ UI is clean and intuitive  
✅ Demo video showcases features  
✅ Documentation is comprehensive  
✅ No critical bugs  
✅ Submitted on time  

---

**Remember:** Done is better than perfect. Ship the MVP first, polish later.

**Good luck! 🚀**
