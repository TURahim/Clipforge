# ClipForge

A lightweight desktop video editor built with Electron, React, and FFmpeg.

## Features

- 🎬 Import videos (MP4, MOV) via drag-and-drop or file picker
- ✂️ Timeline-based editing with React-Konva canvas
- 🎯 Trim clips with visual handles
- 🎥 Real-time video preview
- 📤 Export to MP4 with progress tracking
- 🖥️ Cross-platform (macOS, Windows, Linux)

## Installation

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

- Node.js 18+ and pnpm
- FFmpeg (bundled via ffmpeg-static)

#### Setup

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build

# Package for distribution
pnpm package:mac   # macOS
pnpm package:win   # Windows
```

## Development

```bash
# Start dev server with hot reload
pnpm dev

# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests once (CI mode)
pnpm test:run

# Lint code
pnpm lint
```

## Tech Stack

- **Electron** - Desktop app framework
- **Vite** - Build tool and dev server
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **React-Konva** - Canvas-based timeline
- **FFmpeg** - Video processing
- **TailwindCSS** - Styling
- **Vitest** - Unit testing

## Project Structure

```
clipforge/
├── electron/               # Electron main process
│   ├── main.ts            # App entry point
│   ├── preload.ts         # IPC bridge
│   └── handlers/          # IPC handlers (PR #2+)
├── src/                   # React renderer
│   ├── components/        # React components
│   ├── store/            # Zustand state
│   ├── utils/            # Helper functions
│   ├── test/             # Test setup
│   └── types/            # TypeScript types
├── electron.vite.config.ts
├── vitest.config.ts
└── package.json
```

## Roadmap

- [x] PR #1: Project setup ✓
- [ ] PR #2: File import system
- [ ] PR #3: FFmpeg integration
- [ ] PR #4: Timeline UI
- [ ] PR #5: Video player
- [ ] PR #6: Trim functionality
- [ ] PR #7: Export pipeline
- [ ] PR #8: App packaging
- [ ] PR #9: Bug fixes & polish
- [ ] PR #10: Documentation & demo

## License

MIT

## Credits

Built for a 3-day MVP challenge (Oct 27-29, 2025).
