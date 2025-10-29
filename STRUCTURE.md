# ClipForge - Project Structure

This document outlines the folder structure and organization of the ClipForge project.

## Root Directory Structure

```
clipforge/                          # Root directory (git repository)
├── .github/                        # GitHub specific files
│   └── workflows/
│       └── ci.yml                  # CI/CD pipeline configuration
│
├── app/                            # Main Electron application
│   ├── electron/                   # Electron main process
│   │   ├── main.ts                 # App entry, window management
│   │   ├── preload.ts              # IPC bridge (context isolation)
│   │   └── handlers/               # IPC handlers
│   │       ├── ffmpeg.handler.ts   # FFmpeg operations
│   │       └── file.handler.ts     # File system operations
│   │
│   ├── src/                        # React renderer process
│   │   ├── components/             # React components
│   │   │   ├── MediaLibrary.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── ExportControls.tsx
│   │   │   └── ui/                 # Reusable UI components
│   │   │       ├── ProgressBar.tsx
│   │   │       └── Toast.tsx
│   │   │
│   │   ├── store/                  # State management
│   │   │   └── useStore.ts         # Zustand store
│   │   │
│   │   ├── utils/                  # Utility functions
│   │   │   ├── VideoController.ts  # Video playback abstraction
│   │   │   ├── timelineUtils.ts    # Timeline calculations
│   │   │   ├── trimUtils.ts        # Trim validation
│   │   │   ├── exportUtils.ts      # FFmpeg command builders
│   │   │   └── __tests__/          # Unit tests
│   │   │       ├── VideoController.test.ts
│   │   │       ├── timelineUtils.test.ts
│   │   │       ├── trimUtils.test.ts
│   │   │       └── exportUtils.test.ts
│   │   │
│   │   ├── types/                  # TypeScript types
│   │   │   ├── index.ts            # Shared interfaces
│   │   │   └── electron.d.ts       # Electron type definitions
│   │   │
│   │   ├── test/                   # Test setup
│   │   │   └── setup.ts
│   │   │
│   │   ├── assets/                 # Static assets
│   │   │   └── react.svg
│   │   │
│   │   ├── App.tsx                 # Root React component
│   │   ├── App.css                 # App styles
│   │   ├── main.tsx                # React entry point
│   │   └── index.css               # Global styles
│   │
│   ├── scripts/                    # Build scripts
│   │   └── copy-binaries.js        # Copy FFmpeg binaries for packaging
│   │
│   ├── public/                     # Public assets
│   │   └── vite.svg
│   │
│   ├── build/                      # Build resources (icons, etc.)
│   │   └── icon.svg
│   │
│   ├── resources/                  # Runtime resources (generated)
│   │   ├── ffmpeg                  # Copied during build
│   │   └── ffprobe                 # Copied during build
│   │
│   ├── out/                        # Build output (gitignored)
│   │   ├── main/                   # Main process build
│   │   ├── preload/                # Preload script build
│   │   └── renderer/               # Renderer process build
│   │
│   ├── dist/                       # Packaged app output (gitignored)
│   │   ├── ClipForge-*.dmg         # macOS installers
│   │   ├── ClipForge-*.exe         # Windows installers
│   │   └── ClipForge-*.AppImage    # Linux installers
│   │
│   ├── node_modules/               # Dependencies (gitignored)
│   │
│   ├── package.json                # Project metadata & scripts
│   ├── pnpm-lock.yaml              # Dependency lock file
│   ├── pnpm-workspace.yaml         # pnpm workspace config
│   ├── tsconfig.json               # TypeScript config (base)
│   ├── tsconfig.app.json           # TypeScript config (app)
│   ├── tsconfig.node.json          # TypeScript config (node)
│   ├── vite.config.ts              # Vite config
│   ├── vitest.config.ts            # Vitest config
│   ├── electron.vite.config.ts     # Electron-vite config
│   ├── eslint.config.js            # ESLint config
│   ├── tailwind.config.js          # TailwindCSS config
│   ├── postcss.config.js           # PostCSS config
│   ├── index.html                  # HTML entry point
│   └── README.md                   # App-specific README
│
├── documents/                      # Project documentation
│   ├── 1_tasklist.md               # Day 1 tasks
│   ├── 2_tasklist.md               # Day 2 tasks (MVP)
│   ├── 3_tasklist.md               # Day 3 tasks (Polish)
│   ├── summary_tasklist.md         # Overall summary & progress
│   ├── MVP_PRD.md                  # Product requirements
│   └── *.md                        # Other development docs
│
├── .gitignore                      # Git ignore rules
├── README.md                       # Main project README
└── STRUCTURE.md                    # This file

```

## Key Directories

### `/app` - Main Application
The core Electron application with all source code, tests, and configurations.

### `/app/electron` - Main Process
Handles system-level operations, file access, FFmpeg processing, and window management.

### `/app/src` - Renderer Process
React-based UI with components, state management, and utility functions.

### `/app/out` - Build Output (Ignored)
Contains compiled JavaScript from TypeScript. Generated by `pnpm build`.

### `/app/dist` - Packaged Apps (Ignored)
Contains final packaged applications (DMG, EXE, AppImage). Generated by `pnpm package`.

### `/app/resources` - Runtime Resources
FFmpeg binaries copied during build. Included in packaged apps.

### `/documents` - Documentation
Project planning, task lists, and development documentation.

## File Naming Conventions

- **Components**: PascalCase (e.g., `MediaLibrary.tsx`)
- **Utilities**: camelCase (e.g., `timelineUtils.ts`)
- **Tests**: `*.test.ts` or `*.test.tsx`
- **Types**: `*.d.ts` for declaration files
- **Configs**: lowercase with dots (e.g., `vite.config.ts`)

## Build Artifacts

The following are generated and should NOT be committed:

- `node_modules/` - Dependencies
- `out/` - Compiled code
- `dist/` - Packaged applications
- `resources/ffmpeg` and `resources/ffprobe` - Copied binaries
- `.DS_Store` - macOS metadata
- `*.log` - Log files
- Coverage reports

## Workspace Organization

This is a monorepo using pnpm workspaces:
- Main workspace: `/app`
- Future workspaces can be added to `/packages` if needed

## Notes

- All source code is in TypeScript
- React 19 for UI
- Electron for desktop app
- Vite for fast dev builds
- Vitest for testing
- electron-builder for packaging

---

For development guidelines, see `/app/README.md`  
For project progress, see `/documents/summary_tasklist.md`

