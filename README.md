# ClipForge

A powerful desktop video editor with screen recording, AI captions, and multi-track PiP editing. Built with Electron, React, and FFmpeg.

![ClipForge](https://img.shields.io/badge/version-0.1.0-blue)
![Electron](https://img.shields.io/badge/electron-39.0.0-blue)
![React](https://img.shields.io/badge/react-19.2.0-blue)

## 🎬 Features

### 🎥 Recording
- **Screen Recording** - Capture your screen with audio support
- **Webcam Recording** - Record from your camera with audio
- **Picture-in-Picture (PiP) Recording** - Record screen and webcam simultaneously
- **Combined Tracks** - Automatic multi-track timeline for combined recordings

### 📹 Video Import & Library
- **Video Import** - Import videos via drag-and-drop or file picker (MP4, MOV, AVI, MKV, WEBM)
- **Media Library** - Visual library with thumbnails and metadata display
- **Quick Preview** - Thumbnail generation for instant visual reference

### ✂️ Timeline Editing
- **Multi-Track Timeline** - Main track + overlay track for PiP workflows
- **Drag & Drop** - Add clips to timeline with drag-and-drop
- **Track Switching** - Move clips between main and overlay tracks
- **Split Clips** - Split clips at playhead position (keyboard: `S`)
- **Delete Clips** - Remove clips from timeline (keyboard: `Del`)
- **Trim Clips** - Visual trim handles with Set In/Out buttons
- **Timeline Zoom** - Zoom in/out for precise editing (100%, 200%, 400%)
- **Snap to Grid** - Toggle snap for easier clip alignment
- **Horizontal Repositioning** - Drag clips left/right to adjust timing

### 🎬 Playback & Preview
- **Real-Time Playback** - Play/pause with audio support (keyboard: `Space`)
- **Draggable Playhead** - Interactive scrubbing through timeline
- **Multi-Clip Transitions** - Seamless playback across multiple clips
- **PiP Preview** - Live preview of main + overlay tracks with correct positioning
- **Volume Controls** - Adjust volume and mute/unmute

### 🤖 AI-Powered Features
- **Auto-Captioning** - AI-generated captions using OpenAI Whisper
- **Word-Level Timing** - Precise caption timing with word-level timestamps
- **Dual-Track Captions** - Separate captions for main and overlay videos
- **Smart Chunking** - Readable caption chunks with sentence boundary detection

### 📤 Export & Output
- **Unified PiP Export** - Export main + overlay + captions in one video
- **Resolution Options** - 4K, 1080p, 720p, 480p, or source quality
- **Caption Burn-In** - Auto-caption styling (bottom-aligned, readable)
- **Smart Composition** - Dynamic overlay positioning (22% size, bottom-right)
- **Multi-Clip Support** - Export multiple clips with trimming
- **Progress Tracking** - Real-time export progress with time estimates

### 🔧 Technical Features
- **FFmpeg Integration** - Professional video processing (Apple Silicon optimized)
- **Canvas-Based Timeline** - Smooth performance with React-Konva
- **NaN-Safe Calculations** - Robust math with edge case handling
- **Keyboard Shortcuts** - Efficient editing with hotkeys
- **Cross-Platform** - Works on macOS, Windows, and Linux

## 📦 Installation

### Download Pre-built Binary

Download the latest release for your platform from [GitHub Releases](#).

#### macOS Users - Important!

On first launch, macOS Gatekeeper may block the app because it's not code-signed.

**To open the app:**
1. Right-click (or Control-click) the ClipForge app icon
2. Select "Open" from the context menu
3. Click "Open" in the dialog that appears

This only needs to be done once. After that, you can launch the app normally.

#### Windows Users

If Windows SmartScreen appears, click "More info" and then "Run anyway". The app is not yet code-signed (planned for future releases).

### Build from Source

#### Prerequisites

- **Node.js** 18+ (recommended: 20.x or 22.x)
- **pnpm** (install via `npm install -g pnpm`)
- FFmpeg (bundled via `ffmpeg-static`)

#### Setup

```bash
# Clone the repository
git clone <repository-url>
cd clipforge/app

# Install dependencies
pnpm install

# Run in development mode (if port permissions allow)
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm build && npx electron .

# Package for distribution
pnpm package:mac   # macOS
pnpm package:win   # Windows
```

## 🚀 Development

### Development Mode

**Note:** Development mode requires binding to a network port. If you encounter `EPERM` errors on macOS, use the production build method instead.

```bash
# Start dev server with hot reload
pnpm dev
```

### Production Build & Test

```bash
# Build the application
pnpm build

# Run the built application
npx electron .
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests once (CI mode)
pnpm test:run
```

### Linting

```bash
pnpm lint
```

## 🏗️ Tech Stack

### Core Technologies
- **Electron 39** - Desktop app framework
- **Vite 7** - Build tool and dev server
- **electron-vite 4** - Electron-specific Vite integration
- **React 19** - UI framework
- **TypeScript 5.9** - Type safety

### State & UI
- **Zustand 5** - Lightweight state management
- **TailwindCSS 3** - Utility-first CSS framework
- **React-Konva 19** - Canvas-based timeline with interactive elements
- **Lucide React** - Modern icon library

### Video Processing
- **FFmpeg** (via `ffmpeg-static`) - Video encoding, decoding, and processing
- **ffprobe** - Video metadata extraction

### Testing
- **Vitest 1.6** - Fast unit testing
- **@testing-library/react** - React component testing
- **happy-dom** - Lightweight DOM implementation for tests

## 📁 Project Structure

```
clipforge/app/
├── electron/                   # Electron main process
│   ├── main.ts                # App entry point & window management
│   ├── preload.ts             # IPC bridge (secure communication)
│   └── handlers/              # IPC handlers
│       ├── file.handler.ts    # File dialog & validation
│       ├── ffmpeg.handler.ts  # Video processing, export & captions
│       └── recording.handler.ts # Screen/webcam recording
│
├── src/                       # React renderer process
│   ├── App.tsx               # Root component
│   ├── main.tsx              # React entry point
│   ├── index.css             # Global styles + Tailwind
│   │
│   ├── components/           # React components
│   │   ├── MediaLibrary.tsx  # Media library panel with auto-caption
│   │   ├── VideoPlayer.tsx   # Dual video player (main + overlay PiP)
│   │   ├── Timeline.tsx      # Multi-track timeline with trim handles
│   │   ├── ExportControls.tsx # Export UI, trim controls & resolution
│   │   ├── RecordingControls.tsx # Screen/webcam recording UI
│   │   ├── SourcePicker.tsx  # Screen source selection for recording
│   │   ├── TimelineToolbar.tsx # Timeline zoom & snap controls
│   │   └── ui/               # Reusable UI components
│   │       ├── Toast.tsx     # Notification toasts
│   │       └── ProgressBar.tsx # Progress indicator
│   │
│   ├── store/                # State management
│   │   └── useStore.ts       # Zustand store
│   │
│   ├── utils/                # Utility functions
│   │   ├── VideoController.ts # Video controller abstraction
│   │   ├── exportUtils.ts    # FFmpeg command builders
│   │   ├── trimUtils.ts      # Trim validation utilities
│   │   ├── timelineUtils.ts  # Timeline calculations & zoom
│   │   ├── resolutionPresets.ts # Export resolution presets
│   │   ├── captionUtils.ts   # OpenAI Whisper integration
│   │   └── __tests__/        # Unit tests
│   │
│   ├── types/                # TypeScript definitions
│   │   ├── index.ts          # Shared types
│   │   └── electron.d.ts     # Electron API types
│   │
│   └── test/                 # Test configuration
│       └── setup.ts          # Vitest setup
│
├── out/                       # Build output (generated)
│   ├── main/                 # Compiled main process
│   ├── preload/              # Compiled preload script
│   └── renderer/             # Compiled React app
│
├── electron.vite.config.ts   # Electron + Vite configuration
├── vitest.config.ts          # Test configuration
├── tailwind.config.js        # Tailwind configuration
├── package.json              # Dependencies & scripts
└── README.md                 # This file
```

## 🎯 Usage Guide

### 1. Recording Videos

**Screen Recording**
- Select **"Screen"** mode in the recording panel
- Click **"Start Recording"**
- Choose which window/screen to capture
- Click **"Stop Recording"** when done
- Recording auto-imports to Media Library

**Webcam Recording**
- Select **"Webcam"** mode in the recording panel
- Grant camera/microphone permissions if prompted
- Click **"Start Recording"**
- Click **"Stop Recording"** when done

**Picture-in-Picture (Screen + Webcam)**
- Select **"Both (PiP)"** mode
- Click **"Start Recording"**
- Both screen and webcam record simultaneously
- Automatically creates a multi-track timeline
- Perfect for tutorials, presentations, and demos

### 2. Import Videos

**Method A: File Picker**
- Click the **"Import Video"** button in the Media Library
- Select one or more video files
- Supported formats: MP4, MOV, AVI, MKV, WEBM

**Method B: Drag & Drop**
- Drag video files from Finder/Explorer
- Drop them directly onto the timeline
- Drop near the top for Main Track, bottom for Overlay Track
- Multiple files can be dropped at once

### 3. AI Auto-Captioning

- Hover over any clip in the Media Library
- Click the **"🧠 Auto-Caption"** button
- Wait for AI transcription (powered by OpenAI Whisper)
- Captions appear automatically in the preview
- Captions are burned into exported videos

**Requirements:**
- Create a `.env.local` file in `/app` directory
- Add: `VITE_OPENAI_API_KEY=your_api_key_here`

### 4. Timeline Editing

**Add Clips**
- Click clips in Media Library to add to timeline
- Or drag clips directly onto timeline tracks

**Multi-Track Editing**
- **Main Track** (top) - Primary video content
- **Overlay Track** (bottom) - PiP webcam/overlay
- Drag clips vertically to switch tracks

**Split Clips**
- Select clip → Move playhead → Press `S` or click **Split**
- Creates two separate clips at playhead position

**Delete Clips**
- Select clip → Press `Del` or click **Delete**

**Trim Clips**
- Select clip on timeline
- Press **Set In** to trim start at playhead
- Press **Set Out** to trim end at playhead
- Or drag orange trim handles on timeline edges

**Reposition Clips**
- Drag clips horizontally to adjust timing
- Use zoom controls for precision

**Timeline Zoom**
- Click **zoom buttons** (100%, 200%, 400%)
- Or use mouse wheel (if enabled)

### 5. Play & Preview

- Click the **Play** button or press `Space`
- Playhead syncs with video playback
- Drag playhead to scrub to any position
- PiP preview shows main + overlay composition
- Captions appear at bottom of preview

### 6. Export Video

**Basic Export**
- Click **"Export Video"** button
- Choose output location and filename
- Watch real-time progress with time estimates

**Resolution Options**
- Select resolution: **Source**, **4K**, **1080p**, **720p**, **480p**
- Source preserves original quality
- Lower resolutions reduce file size

**What Gets Exported:**
- ✅ All clips on timeline (main + overlay)
- ✅ Trim points respected
- ✅ PiP composition (overlay in bottom-right)
- ✅ Auto-captions burned in (if generated)
- ✅ Audio from both tracks mixed

## 🔧 Configuration

### AI Auto-Captioning Setup

To enable AI auto-captioning, you need an OpenAI API key:

1. Create a `.env.local` file in the `/app` directory:
```bash
cd clipforge/app
touch .env.local
```

2. Add your OpenAI API key:
```bash
VITE_OPENAI_API_KEY=sk-your-api-key-here
```

3. Restart the app (if running)

**Note:** The API key is only used in the renderer process (client-side). For production apps, consider implementing a backend service to handle API calls securely.

### Build Configuration

The app uses `electron-vite` for building:
- **Main process:** Built as CommonJS (`.cjs`)
- **Preload script:** Built as CommonJS (`.cjs`)
- **Renderer:** Built as ES modules

### FFmpeg Configuration

FFmpeg is bundled via `@ffmpeg-installer/ffmpeg` and `@ffprobe-installer/ffprobe`:
- **Video codec:** H.264 (libx264)
- **Audio codec:** AAC
- **Container:** MP4
- **Apple Silicon Support:** Native ARM64 binaries included
- **Complex Filters:** Multi-track compositing, scaling, overlay, caption burn-in

## 📝 Development Progress

### ✅ Completed (MVP Phase)
- [x] **PR #1:** Project Setup & Configuration
  - ✅ Electron + Vite + React + TypeScript
  - ✅ TailwindCSS integration
  - ✅ Vitest testing framework
  - ✅ Bytecode compilation for production builds
- [x] **PR #2:** File Import System & Media Library
  - ✅ File picker dialog
  - ✅ Drag-and-drop support
  - ✅ Thumbnail generation
  - ✅ Visual media library with metadata
- [x] **PR #3:** FFmpeg Integration & Export Testing
  - ✅ FFmpeg/ffprobe for Apple Silicon
  - ✅ Video metadata extraction
  - ✅ Single-clip export
  - ✅ Progress tracking
- [x] **PR #4:** Timeline UI with React-Konva
  - ✅ Canvas-based timeline component
  - ✅ Drag-and-drop clips onto timeline
  - ✅ NaN-safe calculations
  - ✅ Playhead visualization
  - ✅ Clip positioning with visual feedback
- [x] **PR #5:** Video Player & Playback Controls
  - ✅ VideoController abstraction layer
  - ✅ Play/pause functionality with audio
  - ✅ Real-time playhead sync with video
  - ✅ Seamless multi-clip transitions
  - ✅ Volume controls
- [x] **PR #6:** Trim Functionality
  - ✅ Draggable trim handles on timeline
  - ✅ Set In/Out buttons with playhead position
  - ✅ Visual trim indicators
  - ✅ Trim validation and constraints
  - ✅ Reset trim functionality
- [x] **PR #7:** Export Pipeline
  - ✅ Single-clip export with trimming
  - ✅ Multi-clip concatenation
  - ✅ Real-time progress tracking
  - ✅ Temporary file cleanup
  - ✅ Comprehensive unit tests
- [x] **PR #8:** App Packaging & Distribution
  - ✅ electron-builder configuration
  - ✅ macOS DMG packaging
  - ✅ FFmpeg binary bundling
  - ✅ Production build optimization
- [x] **PR #9:** Bug Fixes & UI Polish
  - ✅ Fixed production build issues
  - ✅ Improved error handling
  - ✅ Enhanced UI responsiveness
  - ✅ Keyboard shortcuts

### ✅ Completed (Post-MVP Core Features)
- [x] **PR #11:** Screen Recording
  - ✅ desktopCapturer integration
  - ✅ Screen source selection
  - ✅ Audio capture support
  - ✅ Recording controls UI
- [x] **PR #12:** Webcam Recording
  - ✅ MediaRecorder API integration
  - ✅ Camera/microphone permissions
  - ✅ Recording controls
  - ✅ Auto-import to library
- [x] **PR #13:** Combined Screen + Webcam Recording (PiP)
  - ✅ Simultaneous screen + webcam capture
  - ✅ Automatic multi-track timeline creation
  - ✅ Recording mode selector
  - ✅ Timer and status indicators
- [x] **PR #14:** Timeline Operations (Split, Delete)
  - ✅ Split clip at playhead
  - ✅ Delete selected clip
  - ✅ Keyboard shortcuts (S, Del)
  - ✅ Gap-free splitting logic
- [x] **PR #15:** Multi-Track Timeline
  - ✅ Main track + overlay track
  - ✅ Vertical drag between tracks
  - ✅ Track-specific rendering
  - ✅ Dual video player (main + overlay)
- [x] **PR #16:** Timeline Zoom & Snap
  - ✅ 100%, 200%, 400% zoom levels
  - ✅ Dynamic pixels-per-second calculation
  - ✅ Snap to grid toggle
  - ✅ Zoom controls UI
- [x] **PR #17:** Export Resolution Options
  - ✅ Resolution presets (4K, 1080p, 720p, 480p, Source)
  - ✅ FFmpeg scaling filters
  - ✅ Resolution selector UI
  - ✅ Aspect ratio preservation
- [x] **PR #18:** AI Auto-Captioning
  - ✅ OpenAI Whisper integration
  - ✅ Audio extraction from video
  - ✅ Word-level timestamp parsing
  - ✅ Smart caption chunking
  - ✅ Dual-track caption display
  - ✅ Caption styling and positioning
- [x] **PR #19:** Unified PiP Export
  - ✅ Multi-track compositing
  - ✅ Dynamic overlay positioning (bottom-right, 22%)
  - ✅ Caption burn-in (FFmpeg subtitles filter)
  - ✅ Audio mixing from both tracks
  - ✅ Complex FFmpeg filter graphs

### 🎉 Feature Complete
All core features implemented and tested!

## 🐛 Known Issues

### Development Mode Port Errors

**Issue:** `Error: listen EPERM: operation not permitted 127.0.0.1:5174`

**Workaround:**
```bash
# Use production build instead
pnpm build && npx electron .
```

**Cause:** macOS security restrictions may prevent Electron from binding to network ports during development.

**Solution:** Grant network permissions to Terminal/iTerm in:
- System Settings → Privacy & Security → Local Network

### Unsigned Application Warnings

The app is currently unsigned, which triggers security warnings on first launch.

**macOS:** Right-click → Open (one time only)  
**Windows:** Click "More info" → "Run anyway"

Code signing will be added in a future release.

## 🚀 Roadmap

### ✅ v0.2.0 - Core Features (Completed)
- ✅ Interactive timeline with React-Konva
- ✅ Video player with play/pause/seek
- ✅ Clip trimming with visual handles
- ✅ Multi-clip export support

### ✅ v0.3.0 - Advanced Features (Completed)
- ✅ Screen & webcam recording
- ✅ Multi-track timeline (PiP)
- ✅ AI auto-captioning
- ✅ Keyboard shortcuts
- ✅ Timeline zoom & snap
- ✅ Resolution options

### 🎯 v1.0.0 - Production Release (Planned)
- [ ] Code signing for macOS & Windows
- [ ] Auto-update support
- [ ] Transitions between clips
- [ ] Basic effects (fade in/out)
- [ ] Audio level adjustment
- [ ] Performance optimizations
- [ ] Comprehensive documentation
- [ ] Demo videos & tutorials

### 🔮 Future Enhancements
- [ ] Text overlays & titles
- [ ] More export formats (GIF, different codecs)
- [ ] Cloud storage integration
- [ ] Collaborative editing
- [ ] Mobile companion app
- [ ] Plugin system

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Credits

### Built With
- [Electron](https://www.electronjs.org/) - Cross-platform desktop apps
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [FFmpeg](https://ffmpeg.org/) - Video processing
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Zustand](https://github.com/pmndrs/zustand) - State management

### Development Timeline
- **MVP Phase:** October 27-29, 2025 (3 days)
- **Core Features:** October 30 - November 1, 2025 (3 days)
- **Polish & Testing:** Ongoing

### ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `S` | Split clip at playhead |
| `Del` | Delete selected clip |
| `+/-` | Zoom in / out (planned) |
| `[` / `]` | Set In / Out point (planned) |

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the [documentation](./documents/)
- Review the [task list](../documents/MVP_tasklist.md)

---

**Made with ❤️ using Electron + React + FFmpeg**
