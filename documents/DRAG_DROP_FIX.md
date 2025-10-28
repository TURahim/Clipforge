# Drag-and-Drop Timeline Fix

## 🐛 Issues Found and Fixed

### Issue 1: Incorrect Store Action Name in Timeline Component

**Problem:**
```typescript
// Timeline.tsx (WRONG)
const addToTimeline = useStore((state) => state.addClipToTimeline)  // ❌ This doesn't exist
const setSelectedClip = useStore((state) => state.setSelectedClip)  // ❌ This doesn't exist
```

**Root Cause:**
The Timeline component was calling `addClipToTimeline` and `setSelectedClip`, but the Zustand store only exports `addToTimeline` and `selectClip`.

**Fix Applied:**
```typescript
// Timeline.tsx (CORRECT)
const addToTimeline = useStore((state) => state.addToTimeline)      // ✅ Correct
const setSelectedClip = useStore((state) => state.selectClip)       // ✅ Correct
```

**Files Modified:**
- `/Users/tahmeedrahim/Documents/clipforge/app/src/components/Timeline.tsx`

---

### Issue 2: Port Permission Error (EPERM on 127.0.0.1:5174)

**Problem:**
```
Error: listen EPERM: operation not permitted 127.0.0.1:5174
```

**Root Cause:**
macOS security restrictions can sometimes block localhost binding on specific ports.

**Fix Applied:**
Changed dev server configuration:
```typescript
// electron.vite.config.ts
renderer: {
  server: {
    port: 5175,           // Changed from 5174
    strictPort: false,     // Allows fallback to other ports
    host: 'localhost',     // Changed from '127.0.0.1'
  }
}
```

**Files Modified:**
- `/Users/tahmeedrahim/Documents/clipforge/app/electron.vite.config.ts`

---

## 🔍 Debug Logging Added

To help diagnose any remaining issues, debug logging has been added to track the drag-and-drop flow:

### 1. MediaLibrary Component
```typescript
const handleDragStart = (e: React.DragEvent, clip: Clip) => {
  console.log('[MediaLibrary] Drag started for:', clip.filename)
  e.dataTransfer.effectAllowed = 'copy'
  e.dataTransfer.setData('application/clipforge-clip', JSON.stringify(clip))
  e.dataTransfer.setData('text/plain', clip.filename)
  console.log('[MediaLibrary] Drag data set successfully')
}
```

### 2. Timeline Component
```typescript
const handleDrop = (e: React.DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  setIsDraggingOver(false)

  console.log('[Timeline] Drop event triggered')

  try {
    const clipData = e.dataTransfer.getData('application/clipforge-clip')
    console.log('[Timeline] Clip data received:', clipData ? 'YES' : 'NO')
    
    if (clipData) {
      const clip = JSON.parse(clipData)
      console.log('[Timeline] Parsed clip:', clip.filename, 'duration:', clip.duration)
      addToTimeline(clip)
      console.log('[Timeline] Clip added to timeline successfully')
    } else {
      console.warn('[Timeline] No clip data in drop event')
    }
  } catch (error) {
    console.error('[Timeline] Failed to parse dropped clip data:', error)
  }
}
```

### 3. Zustand Store
```typescript
addToTimeline: (clip) =>
  set((state) => {
    console.log('[Store] addToTimeline called with:', clip.filename)
    console.log('[Store] Current timeline clips:', state.timelineClips.length)
    
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
    
    console.log('[Store] New timeline clip created:', {
      filename: timelineClip.filename,
      startTime: timelineClip.startTime,
      duration: timelineClip.duration,
    })
    
    const newTimelineClips = [...state.timelineClips, timelineClip]
    console.log('[Store] New timeline clips count:', newTimelineClips.length)
    
    return {
      timelineClips: newTimelineClips,
    }
  })
```

---

## ✅ Expected Debug Output (Successful Drag-and-Drop)

When you drag a clip from Media Library to Timeline, you should see:

```
[MediaLibrary] Drag started for: sample-video.mp4
[MediaLibrary] Drag data set successfully
[Timeline] Drop event triggered
[Timeline] Clip data received: YES
[Timeline] Parsed clip: sample-video.mp4 duration: 30.5
[Store] addToTimeline called with: sample-video.mp4
[Store] Current timeline clips: 0
[Store] New timeline clip created: { filename: 'sample-video.mp4', startTime: 0, duration: 30.5 }
[Store] New timeline clips count: 1
[Timeline] Clip added to timeline successfully
```

---

## 🧪 Testing the Fix

### Test Case 1: Click to Add
1. Import a video via "+ Import Video" button
2. **Click** on the video clip card in Media Library
3. ✅ Clip should appear on timeline
4. ✅ Toast notification: "Added [filename] to timeline"

### Test Case 2: Drag from Media Library to Timeline
1. Import a video
2. **Drag** the clip from Media Library
3. ✅ Timeline should show blue ring border during drag
4. **Drop** on timeline area
5. ✅ Clip should appear as a blue rectangle with filename and duration
6. ✅ Console should show debug logs

### Test Case 3: Multiple Clips
1. Import multiple videos
2. Drag clips one by one to timeline
3. ✅ Each clip should position after the previous one
4. ✅ Timeline should expand horizontally as needed
5. ✅ Time markers should update

### Test Case 4: Empty Timeline Visual
1. With no clips on timeline
2. ✅ Should show: "Timeline is empty / Drag clips from media library or click to add"
3. During drag over empty timeline
4. ✅ Should show: "Drop clip here / Add to timeline"

---

## 🔄 Drag-and-Drop Flow (Technical)

```
User drags clip from Media Library
          ↓
MediaLibrary.handleDragStart()
  - Sets drag data: 'application/clipforge-clip' with JSON
  - Sets effectAllowed: 'copy'
          ↓
User drags over Timeline
          ↓
Timeline.handleDragOver()
  - preventDefault() → allows drop
  - setIsDraggingOver(true) → visual feedback
          ↓
User drops clip
          ↓
Timeline.handleDrop()
  - preventDefault()
  - getData('application/clipforge-clip')
  - JSON.parse(clipData)
          ↓
Timeline.addToTimeline(clip)
          ↓
Store.addToTimeline()
  - Calculate startTime based on existing clips
  - Create TimelineClip with trimStart=0, trimEnd=duration
  - Append to timelineClips array
          ↓
React re-renders Timeline
          ↓
Timeline.render()
  - Maps timelineClips array
  - Renders blue Rect for each clip with Konva
          ↓
✅ Clip visible on timeline!
```

---

## 🚀 How to Start Dev Mode

```bash
cd /Users/tahmeedrahim/Documents/clipforge/app
pnpm dev
```

**What to expect:**
1. Vite builds main and preload processes
2. Dev server starts on port 5175 (or next available)
3. Electron window opens
4. DevTools open automatically
5. Console shows FFmpeg diagnostics:
   ```
   [FFmpeg] Development mode: Loading ARM64-compatible binaries
   [FFmpeg] FFmpeg path: ...
   [FFmpeg] Version check: ffmpeg version ...
   [FFmpeg] Binary architecture: ARM64-compatible
   ```

---

## 📋 Store Actions Reference

| Store Action | Purpose | Used By |
|--------------|---------|---------|
| `addClip(clip)` | Add clip to Media Library | MediaLibrary (after import) |
| `removeClip(id)` | Remove from library & timeline | MediaLibrary |
| `addToTimeline(clip)` | Add clip to timeline | MediaLibrary, Timeline |
| `removeFromTimeline(id)` | Remove from timeline only | Timeline |
| `selectClip(id)` | Set selected clip | Timeline |
| `setPlayheadPosition(pos)` | Update playhead | Timeline |
| `updateClipTrim(id, start, end)` | Trim clip | Timeline (future trim UI) |
| `setExportProgress(progress)` | Update export status | ExportControls |

---

## 🎯 Summary of Changes

### Files Modified:
1. ✅ `src/components/Timeline.tsx`
   - Fixed store action names
   - Added debug logging
   
2. ✅ `src/components/MediaLibrary.tsx`
   - Added debug logging to drag start

3. ✅ `src/store/useStore.ts`
   - Added debug logging to addToTimeline

4. ✅ `electron.vite.config.ts`
   - Changed port from 5174 to 5175
   - Changed host from '127.0.0.1' to 'localhost'

### Root Causes Fixed:
- ❌ **Wrong action names** → ✅ Corrected to match store exports
- ❌ **Port permission error** → ✅ Changed port and host binding
- ❌ **Silent failures** → ✅ Added comprehensive debug logging

---

## 🎬 Next Steps

1. **Start dev mode:**
   ```bash
   pnpm dev
   ```

2. **Test the drag-and-drop:**
   - Import a video
   - Drag to timeline
   - Watch console for debug logs

3. **If clips still don't appear:**
   - Check console for errors
   - Look for the debug log sequence
   - Share the console output for further debugging

4. **Once working:**
   - Remove debug console.log statements (optional, or keep for development)
   - Test with multiple clips
   - Test click-to-add as well

---

## 💡 Additional Notes

### Click-to-Add Still Works
Even if drag-and-drop had issues, clicking on a clip card should work because it directly calls `addToTimeline`.

### Visual Feedback
- **Drag over timeline:** Blue ring border appears
- **Empty timeline:** Gray placeholder text
- **Clip on timeline:** Blue rectangle with filename and duration
- **Selected clip:** Glowing border on clip

### State Management
The Zustand store is shared across all components, so both MediaLibrary and Timeline can add clips to the timeline. The store ensures:
- Clips are positioned sequentially (startTime calculated from previous clips)
- Trim points default to full duration (trimStart=0, trimEnd=duration)
- Timeline re-renders when timelineClips array updates

---

**Status:** ✅ All fixes applied, ready for testing!

