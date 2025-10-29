# ClipForge

<div align="center">
  <h3>A Modern Desktop Video Editor</h3>
  <p>Built with Electron, React, and TypeScript</p>
</div>

---

## 🎯 Overview

**ClipForge** is a lightweight desktop video editing application that makes it easy to import, trim, and export video clips. Built as a 3-day MVP project, it demonstrates professional software engineering practices including modular architecture, comprehensive testing, and CI/CD integration.

### ✨ Key Features

- **📂 Video Import**: Drag-and-drop or file picker to import MP4/MOV files
- **🎬 Timeline Editor**: Visual canvas-based timeline with drag-and-drop clip arrangement
- **▶️ Video Playback**: Seamless multi-clip playback with audio synchronization
- **✂️ Trim Functionality**: Precise in/out point trimming with visual indicators
- **📤 Export Pipeline**: Single or multi-clip export to MP4 with progress tracking
- **🎨 Modern UI**: Clean, intuitive interface built with React and TailwindCSS
- **⚡ Fast Performance**: Hardware-accelerated rendering with Konva canvas
- **🔧 Developer-Friendly**: Comprehensive unit tests and TypeScript type safety

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **pnpm** v8 or higher
- **FFmpeg** (bundled automatically during build)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TURahim/Clipforge.git
   cd Clipforge/app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Run in development mode**
   ```bash
   pnpm dev
   ```

4. **Build for production**
   ```bash
   pnpm build
   ```

5. **Package the app**
   ```bash
   # macOS
   pnpm package:mac
   
   # Windows
   pnpm package:win
   
   # Linux
   pnpm package:linux
   ```

---

## 📦 Download

Pre-built packages are available in [GitHub Releases](https://github.com/TURahim/Clipforge/releases):

- **macOS**: `ClipForge-0.1.0-mac-arm64.dmg` (ARM64) or `ClipForge-0.1.0-mac-x64.dmg` (Intel)
- **Windows**: `ClipForge-0.1.0-win-x64.exe`
- **Linux**: `ClipForge-0.1.0-linux.AppImage`

### Installation from DMG (macOS)

1. Download the appropriate DMG for your architecture
2. Open the DMG file
3. Drag **ClipForge.app** to your Applications folder
4. Launch from Applications (you may need to right-click → Open on first launch)

---

## 🎓 Usage Guide

### 1. Import Videos

- Click **"Import Video"** button or drag-and-drop video files
- Supported formats: MP4, MOV, AVI, MKV
- Thumbnails and metadata are automatically generated

### 2. Build Your Timeline

- Drag clips from the Media Library onto the Timeline
- Clips snap to sequential positions automatically
- Click any clip to select it

### 3. Trim Clips (Optional)

- Select a clip on the timeline
- Use **Set In** / **Set Out** buttons to mark trim points at the current playhead position
- Or drag the trim handles on the timeline directly
- **Reset Trim** removes all trim settings

### 4. Preview Playback

- Press **Space** or click the **Play** button to preview
- Drag the red playhead to scrub through the timeline
- Playback seamlessly transitions between clips

### 5. Export Your Video

- Click **"Export Video"** and choose a save location
- Progress bar shows export status
- Exported MP4 includes all timeline clips with trim settings applied

### 6. Keyboard Shortcuts

- **Space**: Play / Pause
- **Delete / Backspace**: Remove selected clip from timeline

---

## 🏗️ Architecture

ClipForge follows a modular architecture with clear separation of concerns:

```
app/
├── electron/                 # Electron main process
│   ├── main.ts              # App entry point, window management
│   ├── preload.ts           # IPC bridge (secure context isolation)
│   └── handlers/            # IPC handlers for backend operations
│       ├── ffmpeg.handler.ts    # FFmpeg operations (metadata, export)
│       └── file.handler.ts      # File system operations
│
├── src/                     # React renderer process
│   ├── components/          # UI components
│   │   ├── MediaLibrary.tsx     # Import and display clips
│   │   ├── Timeline.tsx         # Canvas-based timeline editor
│   │   ├── VideoPlayer.tsx      # Video preview and controls
│   │   └── ExportControls.tsx   # Export and trim controls
│   │
│   ├── store/              # State management
│   │   └── useStore.ts         # Zustand store (clips, playback, export)
│   │
│   ├── utils/              # Utilities and business logic
│   │   ├── VideoController.ts  # Video playback abstraction
│   │   ├── timelineUtils.ts    # Timeline calculations
│   │   ├── trimUtils.ts        # Trim validation and constraints
│   │   └── exportUtils.ts      # FFmpeg command builders
│   │
│   └── types/              # TypeScript type definitions
│       └── index.ts            # Shared interfaces
│
└── scripts/                # Build scripts
    └── copy-binaries.js        # Bundle FFmpeg binaries for packaging
```

### Key Technologies

- **Electron**: Cross-platform desktop app framework
- **React 19**: UI components and state management
- **TypeScript**: Type safety and better developer experience
- **Zustand**: Lightweight state management
- **React-Konva**: Canvas rendering for timeline
- **TailwindCSS**: Utility-first styling
- **Vite**: Fast build tooling
- **Vitest**: Unit testing framework
- **FFmpeg**: Video processing and export
- **electron-builder**: App packaging

---

## 🧪 Testing

ClipForge includes comprehensive unit tests for all core utilities:

### Run Tests

```bash
# Run all tests (watch mode)
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Run specific test file
pnpm test trimUtils

# Open test UI
pnpm test:ui
```

### Test Coverage

- ✅ **Timeline Utils**: Position calculations, duration sums, NaN safety
- ✅ **Trim Utils**: Validation, constraints, edge cases
- ✅ **Export Utils**: FFmpeg command building, progress parsing
- ✅ **Video Controller**: Playback, seeking, event handling

---

## 🔧 Development

### Scripts

```bash
# Development
pnpm dev              # Start dev server with hot reload
pnpm build            # Build for production
pnpm preview          # Preview production build

# Packaging
pnpm package          # Package for current platform
pnpm package:mac      # Package for macOS (DMG)
pnpm package:win      # Package for Windows (EXE)
pnpm package:linux    # Package for Linux (AppImage)

# Testing
pnpm test             # Run tests in watch mode
pnpm test:run         # Run tests once (CI)
pnpm test:ui          # Open Vitest UI

# Linting
pnpm lint             # Run ESLint
```

### Development Tips

1. **Hot Reload**: Changes to `src/` are hot-reloaded instantly
2. **Main Process**: Changes to `electron/` require restart (`Ctrl+C` → `pnpm dev`)
3. **TypeScript**: All code is fully typed for better IDE support
4. **DevTools**: Press `Cmd+Option+I` (Mac) or `Ctrl+Shift+I` (Win/Linux) to open DevTools
5. **Logs**: Main process logs appear in terminal, renderer logs in DevTools console

### Project Structure Conventions

- **Components**: One component per file, named exports
- **Utilities**: Pure functions, fully tested
- **Handlers**: IPC handlers in `electron/handlers/`
- **Types**: Shared types in `src/types/index.ts`
- **Tests**: Co-located in `__tests__/` directories

---

## 🚦 CI/CD

ClipForge uses **GitHub Actions** for continuous integration:

### Workflow Checks

On every push and pull request to `main`:

1. ✅ **Lint Check**: ESLint for code quality
2. ✅ **Type Check**: TypeScript compilation without emit
3. ✅ **Unit Tests**: All Vitest tests must pass
4. ✅ **Build Check**: Production build succeeds

### View CI Status

Check the [Actions tab](https://github.com/TURahim/Clipforge/actions) for build status and logs.

---

## 🐛 Troubleshooting

### App Won't Launch

- **macOS**: Right-click → Open (first launch only)
- **Windows**: Click "More info" → "Run anyway" if SmartScreen appears
- **Linux**: Ensure `.AppImage` has execute permissions (`chmod +x ClipForge-*.AppImage`)

### FFmpeg Errors

- FFmpeg binaries are bundled automatically during build
- If you see "FFmpeg not found" in dev mode, run `pnpm install` again
- For packaged apps, ensure you built with `pnpm build` before packaging

### Import Fails

- Ensure video file is not corrupted
- Supported formats: MP4, MOV, AVI, MKV (H.264/H.265 codecs)
- Large files (>2GB) may take longer to import

### Export Fails

- Ensure sufficient disk space for output file
- Check output path has write permissions
- Export progress will show errors if FFmpeg fails

### Timeline Performance

- Limit timeline to ~20 clips for smooth performance
- Close other apps if timeline feels sluggish
- Use shorter clips when possible (<5 minutes each)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feat/amazing-feature`)
3. **Write** tests for new functionality
4. **Ensure** all tests pass (`pnpm test:run`)
5. **Commit** with conventional commit messages (`feat: add feature`)
6. **Push** to your fork
7. **Open** a Pull Request

### Code Style

- Follow existing code conventions
- Run `pnpm lint` before committing
- Add JSDoc comments for complex functions
- Keep components small and focused

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](../LICENSE) file for details.

---

## 🙏 Acknowledgments

- **FFmpeg**: Powerful video processing library
- **Electron**: Cross-platform desktop framework
- **React-Konva**: Canvas rendering made easy
- **Zustand**: Simple state management
- **electron-builder**: Painless app packaging

---

## 📧 Contact

**Tahmeed Rahim** - [@TURahim](https://github.com/TURahim)

**Project Link**: [https://github.com/TURahim/Clipforge](https://github.com/TURahim/Clipforge)

---

<div align="center">
  <p>Made with ❤️ as a 3-day MVP project</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
