# ClipForge

A lightweight desktop video editor built with Electron, React, and FFmpeg.

![ClipForge](https://img.shields.io/badge/version-0.1.0-blue)
![Electron](https://img.shields.io/badge/electron-39.0.0-blue)
![React](https://img.shields.io/badge/react-19.2.0-blue)

## 🎬 Features

- **Video Import** - Import videos via drag-and-drop or file picker (MP4, MOV, AVI, MKV, WEBM)
- **Media Library** - Visual library with thumbnails and metadata display
- **Timeline Editing** - Canvas-based timeline with drag-and-drop clip placement
- **Video Playback** - Real-time video preview with play/pause controls and audio
- **Draggable Playhead** - Interactive scrubbing through timeline with real-time sync
- **Trim Clips** - Set in/out points with visual handles and trim indicators
- **Multi-Clip Export** - Export single or multiple clips with trimming support
- **Progress Tracking** - Real-time export progress with percentage display
- **FFmpeg Integration** - Professional video processing powered by FFmpeg (Apple Silicon optimized)
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
│       └── ffmpeg.handler.ts  # Video processing & export
│
├── src/                       # React renderer process
│   ├── App.tsx               # Root component
│   ├── main.tsx              # React entry point
│   ├── index.css             # Global styles + Tailwind
│   │
│   ├── components/           # React components
│   │   ├── MediaLibrary.tsx  # Media library panel
│   │   ├── VideoPlayer.tsx   # Video player with playback controls
│   │   ├── Timeline.tsx      # Interactive timeline with trim handles
│   │   ├── ExportControls.tsx # Export UI & trim controls
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
│   │   ├── timelineUtils.ts  # Timeline calculations
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

### 1. Import Videos

**Method A: File Picker**
- Click the **"Import Video"** button in the Media Library
- Select one or more video files
- Supported formats: MP4, MOV, AVI, MKV, WEBM

**Method B: Drag & Drop**
- Drag video files from Finder/Explorer
- Drop them anywhere in the Media Library panel
- Multiple files can be dropped at once

### 2. Add Clips to Timeline

- Click any clip in the Media Library
- The clip will be added to the timeline automatically
- Clips are arranged sequentially
- Drag the red playhead to scrub through the timeline

### 3. Play & Preview

- Click the **Play** button to preview your video
- The playhead moves in sync with video playback
- Drag the playhead to scrub to any position
- Video automatically transitions between clips

### 4. Trim Clips

- Select a clip on the timeline by clicking it
- Use the **Set In** and **Set Out** buttons to trim at the playhead position
- Or drag the orange trim handles on the timeline
- Visual indicators show the trimmed regions

### 5. Export Video

- Click the **"Export Video"** button at the bottom
- Choose output location and filename
- Watch the progress bar as your video exports
- The exported MP4 will respect all trim points

## 🔧 Configuration

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
  - ✅ Visual trim indicators (darkened regions)
  - ✅ Trim validation and constraints
  - ✅ Reset trim functionality
- [x] **PR #7:** Export Pipeline
  - ✅ Single-clip export with trimming
  - ✅ Multi-clip concatenation
  - ✅ Real-time progress tracking
  - ✅ Temporary file cleanup
  - ✅ Comprehensive unit tests

### 🚧 In Progress
- [ ] **PR #8:** App Packaging & Distribution
- [ ] **PR #9:** Bug Fixes & UI Polish
- [ ] **PR #10:** Documentation & Demo Video

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

### v0.2.0 - Timeline & Playback
- Interactive timeline with React-Konva
- Video player with play/pause/seek
- Clip trimming with visual handles
- Multi-clip export support

### v0.3.0 - Advanced Features
- Transitions between clips
- Basic effects (fade in/out)
- Audio level adjustment
- Keyboard shortcuts

### v1.0.0 - Production Release
- Code signing for macOS & Windows
- Auto-update support
- Optimized performance
- Comprehensive documentation

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
Built as part of a 3-day MVP challenge (October 27-29, 2025).

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the [documentation](./documents/)
- Review the [task list](../documents/MVP_tasklist.md)

---

**Made with ❤️ using Electron + React + FFmpeg**
