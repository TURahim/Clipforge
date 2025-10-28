# ClipForge - Additional Resources & Workflow

## Context Capsule

**ClipForge** is a desktop video editing application built with Electron, React, and TypeScript. This document provides supplementary resources including git workflow, progress tracking, testing scenarios, emergency fallback plans, and key reminders for the 3-day MVP project.

**What This Document Contains:**
- Git workflow and branching conventions
- Progress tracking across all 3 days
- Comprehensive testing scenarios and matrices
- Emergency fallback plan (if time runs out)
- Key reminders for each milestone
- Success criteria for MVP and final submission

**Purpose:** This document serves as a reference guide throughout the project. Refer back to it when:
- Starting a new PR branch
- Running tests before merging
- Checking progress against timeline
- Facing time constraints
- Preparing for submissions

**Cross-References:**
- [1_tasklist.md](./1_tasklist.md) - Day 1 Foundation & Setup
- [2_tasklist.md](./2_tasklist.md) - Day 2 MVP Core Features
- [3_tasklist.md](./3_tasklist.md) - Day 3 Polish & Final Submission

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

**Examples:**
- `feat/project-setup`
- `feat/file-import`
- `feat/timeline`
- `feat/video-player`
- `feat/trim`
- `feat/export`
- `feat/packaging`
- `fix/ui-polish`
- `docs/final-submission`

### Commit Message Convention:

Follow conventional commits format:

```
feat: Add video import functionality
fix: Resolve timeline sync issue
docs: Update README with setup instructions
refactor: Simplify FFmpeg command builder
test: Add export validation tests
chore: Update dependencies
style: Format code with prettier
perf: Optimize timeline rendering
```

**Format:** `<type>: <description>`

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `refactor` - Code refactoring (no functional changes)
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `style` - Code formatting
- `perf` - Performance improvements

### PR Process:

1. **Create feature branch from `main`**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/feature-name
   ```

2. **Implement feature with commits**
   ```bash
   git add .
   git commit -m "feat: Add feature description"
   ```

3. **Test thoroughly**
   ```bash
   pnpm test:run  # Run all tests
   pnpm dev       # Test in dev mode
   ```

4. **Push and create PR**
   ```bash
   git push origin feat/feature-name
   # Create PR on GitHub with description
   ```

5. **Merge to `main`**
   - Review changes
   - Ensure tests pass
   - Merge PR on GitHub

6. **Clean up**
   ```bash
   git checkout main
   git pull origin main
   git branch -d feat/feature-name  # Delete local branch
   ```

7. **Move to next PR**
   ```bash
   git checkout -b feat/next-feature
   ```

### Example Git Flow:

```bash
# Day 1 - PR #1: Project Setup
git checkout -b feat/project-setup
# ... implement setup ...
git add .
git commit -m "feat: Initialize Electron + Vite + React project"
git commit -m "feat: Configure TypeScript and TailwindCSS"
git commit -m "feat: Add testing framework (Vitest)"
git push origin feat/project-setup
# Create PR, review, merge
git checkout main
git pull origin main

# Day 1 - PR #2: File Import
git checkout -b feat/file-import
# ... implement import ...
git add .
git commit -m "feat: Add file picker and drag-and-drop"
git commit -m "feat: Extract video metadata with FFmpeg"
git commit -m "feat: Create MediaLibrary component"
git push origin feat/file-import
# Create PR, review, merge
git checkout main
git pull origin main

# Continue for remaining PRs...
```

### Best Practices:

- **Commit often** - Small, focused commits are easier to review
- **Write clear messages** - Describe what and why, not just how
- **Test before pushing** - Run `pnpm test:run` and `pnpm dev`
- **Keep PRs focused** - One feature per PR
- **Review your own PR** - Check the diff before merging
- **Delete merged branches** - Keep repository clean

---

## Progress Tracking

### Day 1 Progress (Monday, Oct 27):
- [ ] PR #1: Project Setup & Configuration ✅
  - [ ] Initialize with pnpm
  - [ ] Configure TypeScript, Vite, TailwindCSS
  - [ ] Set up testing framework
  - [ ] App launches in dev mode
- [ ] PR #2: File Import System & Media Library ✅
  - [ ] File picker implementation
  - [ ] Drag-and-drop support
  - [ ] MediaLibrary component
  - [ ] Thumbnail generation
- [ ] PR #3: FFmpeg Integration & Export Testing ✅
  - [ ] FFmpeg handler setup
  - [ ] Metadata extraction (JSON)
  - [ ] Basic export functionality
  - [ ] Progress tracking

**Day 1 Goal:** Foundation complete, ready for Day 2 MVP features

---

### Day 2 Progress (Tuesday, Oct 28 - MVP Deadline):
- [ ] PR #4: Timeline UI with React-Konva ✅
  - [ ] Canvas timeline component
  - [ ] Drag-and-drop clips onto timeline
  - [ ] Clip positioning and width calculations
  - [ ] Playhead visualization
- [ ] PR #5: Video Player & Playback Controls ✅
  - [ ] VideoController class
  - [ ] Play/pause functionality
  - [ ] Sync with timeline playhead
  - [ ] Time display
- [ ] PR #6: Trim Functionality ✅
  - [ ] Drag handles on clips
  - [ ] Set In/Out buttons
  - [ ] Visual trim indicators
  - [ ] Trim validation
- [ ] PR #7: Export Pipeline with Progress ✅
  - [ ] Single-clip export
  - [ ] Multiple-clip concatenation
  - [ ] Progress bar with percentage
  - [ ] Temp file cleanup
- [ ] PR #8: App Packaging & MVP Testing ✅
  - [ ] electron-builder configuration
  - [ ] DMG/EXE creation
  - [ ] All MVP validation tests pass
  - [ ] Packaged app tested
- [ ] **MVP SUBMITTED** ✅ (Tuesday 10:59 PM CT)

**Day 2 Goal:** Fully functional MVP submitted on time

---

### Day 3 Progress (Wednesday, Oct 29 - Final Deadline):
- [ ] PR #9: Bug Fixes & UI Polish ✅
  - [ ] Fix bugs from MVP testing
  - [ ] Add loading states
  - [ ] Keyboard shortcuts
  - [ ] Error message improvements
  - [ ] Performance optimizations
- [ ] PR #10: Documentation, Demo Video & Final Submission ✅
  - [ ] Comprehensive README
  - [ ] ARCHITECTURE.md
  - [ ] Demo video (3-5 min)
  - [ ] GitHub Releases
  - [ ] Final submission checklist
- [ ] **FINAL SUBMITTED** ✅ (Wednesday 10:59 PM CT)

**Day 3 Goal:** Polished, documented, and submitted before deadline

---

## Testing Scenarios

### Core Workflow Test (Run Before Each PR Merge):

**Unit Tests (for PRs #3-7):**
```bash
# Must pass before merging
pnpm test:run
```

**Expected:**
- ✅ All FFmpeg utils tests pass
- ✅ All timeline calculation tests pass
- ✅ All VideoController tests pass
- ✅ All trim validation tests pass
- ✅ All export utils tests pass

**Integration Test (Manual - Run Before Submissions):**

1. **Import Phase**
   - [ ] Import 3 video clips (MP4, MOV, different durations)
   - [ ] Verify thumbnails generated
   - [ ] Verify durations displayed correctly

2. **Timeline Phase**
   - [ ] Drag all clips onto timeline
   - [ ] Verify clips arrange sequentially
   - [ ] Verify clip widths match durations
   - [ ] Click each clip to select

3. **Playback Phase**
   - [ ] Play through entire timeline
   - [ ] Verify playhead moves smoothly
   - [ ] Verify video preview syncs
   - [ ] Verify audio plays correctly
   - [ ] Pause and resume playback

4. **Trim Phase**
   - [ ] Select middle clip
   - [ ] Trim middle clip (set in/out points using handles)
   - [ ] Verify visual trim indicators show
   - [ ] Play again - verify trim applied in preview

5. **Export Phase**
   - [ ] Export timeline to MP4
   - [ ] Verify progress bar updates (0% → 100%)
   - [ ] Wait for export to complete

6. **Verification Phase**
   - [ ] Verify exported MP4 file exists on disk
   - [ ] Open exported video in VLC/QuickTime
   - [ ] Verify video plays correctly
   - [ ] Verify audio is synchronized
   - [ ] Verify trimmed portion is correct

7. **Performance Check**
   - [ ] Check timeline remains responsive
   - [ ] Check memory usage (Task Manager / Activity Monitor)
   - [ ] No memory leaks after 15min session

---

### Export Test Matrix:

Test all combinations to ensure export pipeline works correctly:

| Scenario | Clips | Trim | Expected Result |
|----------|-------|------|-----------------|
| **Test 1** | 1 | No | Full clip exported (e.g., 30s → 30s) |
| **Test 2** | 1 | Yes | Trimmed portion only (e.g., 30s → 10s) |
| **Test 3** | 3 | No | All clips concatenated (10s + 15s + 20s = 45s) |
| **Test 4** | 3 | Yes | Trimmed portions concatenated (5s + 10s + 15s = 30s) |
| **Test 5** | 3 | Some | Mix of trimmed + untrimmed (10s + 5s + 20s = 35s) |

**How to Run:**

For each test:
1. Set up the scenario (import clips, trim as needed)
2. Click Export and choose output location
3. Wait for export to complete
4. Open exported MP4 in video player
5. Verify duration matches expected result
6. Verify audio is synchronized
7. Verify video quality is acceptable

---

### Performance Test:

Run this test to ensure the app can handle typical usage:

**Setup:**
- [ ] Import 10 video clips (various durations: 5s-60s each)
- [ ] Add all clips to timeline

**Tests:**
1. **Playback Performance**
   - [ ] Play through entire timeline
   - [ ] Verify smooth playback (30fps minimum)
   - [ ] No stuttering or frame drops
   - [ ] Audio remains synchronized

2. **Timeline Interaction**
   - [ ] Drag clips around timeline
   - [ ] Verify responsive (<100ms lag)
   - [ ] Select different clips quickly
   - [ ] Trim multiple clips

3. **Export Performance**
   - [ ] Export 2min video (multiple clips)
   - [ ] Verify export completes without crash
   - [ ] Progress updates smoothly
   - [ ] Exported video plays correctly

4. **Memory Usage**
   - [ ] Check memory usage during operation
   - [ ] Should stay under 500MB for typical usage
   - [ ] No memory leaks after 15min session
   - [ ] App remains responsive throughout

**Performance Benchmarks:**
- App launch time: < 5 seconds
- Import clip: < 2 seconds
- Timeline drag: < 100ms response
- Playback start: < 500ms
- Export 1min video: ~30-60 seconds (depends on hardware)

---

## Emergency Fallback Plan

**If running out of time on Day 2:**

### Minimum Viable MVP (Absolute Minimum):

If you're behind schedule and need to submit SOMETHING by the MVP deadline, implement this bare-bones version:

1. **Import ONE clip** (file picker only)
   - Skip: drag-and-drop
   - Skip: thumbnails
   - Just: file path and duration in text

2. **Show clip in simple list**
   - Skip: visual media library
   - Just: `<div>{clip.filename} - {clip.duration}s</div>`

3. **Manual text input for trim times**
   - Skip: visual timeline
   - Skip: canvas rendering
   - Just: Two input boxes for start/end times

4. **Export with hardcoded trim values**
   - Skip: timeline visualization
   - Just: Run FFmpeg with trim values from inputs

5. **No progress bar**
   - Skip: progress tracking
   - Just: "Exporting..." text, button disabled

6. **Basic packaging**
   - Skip: icons, optimization
   - Just: `pnpm package:mac` with defaults

**This ensures you have SOMETHING to submit by the MVP deadline.**

### Fallback Timeline:

**2 hours before deadline:**
- [ ] Assess which features are complete
- [ ] Identify critical missing features
- [ ] Decide: finish current work OR switch to fallback

**1 hour before deadline:**
- [ ] If using fallback: implement bare minimum
- [ ] Test basic import → trim → export flow
- [ ] Package app (even if rough)

**30 minutes before deadline:**
- [ ] Stop coding new features
- [ ] Test packaged app one final time
- [ ] Prepare submission (README, download link)

**10 minutes before deadline:**
- [ ] Submit what you have
- [ ] Better to submit something than nothing

---

## Key Reminders

### Before Each PR:
- [ ] Test the feature thoroughly in dev mode
- [ ] Run `pnpm test:run` if PR has unit tests
- [ ] Check for TypeScript errors (`pnpm build`)
- [ ] Ensure no console errors during normal usage
- [ ] Write clear commit messages
- [ ] Review your own code before pushing

### Before MVP Submission (Tuesday 10:59 PM CT):
- [ ] Run ALL unit tests: `pnpm test:run`
- [ ] Test packaged app (not dev mode!)
- [ ] Verify all MVP requirements met:
  - [ ] Import video files
  - [ ] Timeline displays clips
  - [ ] Video preview plays
  - [ ] Trim functionality works
  - [ ] Export to MP4 successful
- [ ] Check acceptance criteria
- [ ] Test on clean machine if possible
- [ ] Create GitHub release with download link
- [ ] Submit before 10:59 PM CT

### Before Final Submission (Wednesday 10:59 PM CT):
- [ ] README is complete and comprehensive
- [ ] Demo video uploaded (3-5 min)
- [ ] Download links work (GitHub Releases)
- [ ] All documentation clear and accurate
- [ ] Final testing complete (run integration test)
- [ ] Code is clean and commented where necessary
- [ ] No critical bugs remaining
- [ ] Submit before 10:59 PM CT

### Daily Check-ins:

**End of Day 1:**
- [ ] Can I launch the app in dev mode?
- [ ] Can I import a video file?
- [ ] Does FFmpeg extract metadata correctly?
- [ ] Am I on track for Day 2?

**End of Day 2:**
- [ ] Does the packaged app work?
- [ ] Can I import → timeline → trim → export?
- [ ] Are all MVP features functional?
- [ ] Is the MVP submitted on time?

**End of Day 3:**
- [ ] Is the UI polished?
- [ ] Is the documentation complete?
- [ ] Is the demo video ready?
- [ ] Is the final submission ready?

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

**Acceptance Criteria:**
- Can import MP4/MOV files
- Can drag clips onto canvas timeline
- Can play video with audio sync
- Can trim clips visually
- Can export single or multiple clips
- Exported MP4 plays correctly
- App packaged as DMG/EXE

### Final Success (Wednesday):
✅ All MVP features polished  
✅ UI is clean and intuitive  
✅ Demo video showcases features  
✅ Documentation is comprehensive  
✅ No critical bugs  
✅ Submitted on time  

**Acceptance Criteria:**
- Loading states during operations
- Error messages are user-friendly
- Keyboard shortcuts work
- README explains installation/usage
- Demo video shows all features
- GitHub releases has download links
- Tested on clean machine

---

## Quick Reference

### Essential Commands:
```bash
# Development
pnpm dev          # Start dev mode
pnpm build        # Build for production
pnpm test         # Run tests (watch mode)
pnpm test:run     # Run tests once

# Packaging
pnpm package:mac  # Package for macOS
pnpm package:win  # Package for Windows

# Testing
pnpm test ffmpeg      # Run specific test
pnpm test timeline    # Run specific test
pnpm test:ui          # Open test UI
```

### File Locations:
- Tests: `src/utils/__tests__/`
- Components: `src/components/`
- Utils: `src/utils/`
- Electron handlers: `electron/handlers/`
- Types: `src/types/index.ts`
- Store: `src/store/useStore.ts`

### Important Constants:
- PIXELS_PER_SECOND = 100 (timeline scale)
- Timeline height = 100px
- Trim handle width = 10px
- Max zoom (Day 3) = 2x

### Deadlines:
- **MVP:** Tuesday, Oct 28 at 10:59 PM CT
- **Final:** Wednesday, Oct 29 at 10:59 PM CT

---

## Motivational Reminders

### Remember:

**Done is better than perfect.**

You're building a functional video editor in 3 days. That's impressive! Focus on:
1. ✅ Making it work
2. ✅ Making it stable
3. ✅ Making it shippable

Don't worry about:
- ❌ Perfect code
- ❌ Edge cases
- ❌ Advanced features

### When Stuck:

1. **Check the docs** - Review relevant tasklist section
2. **Run the tests** - Tests document expected behavior
3. **Simplify** - Can you do a simpler version first?
4. **Ask for help** - Use the fallback plan if needed
5. **Ship it** - Better to ship something than nothing

### Final Thoughts:

You've got this! The tasklists are comprehensive, the tests guide you, and the timeline is realistic. Follow the plan, test as you go, and ship on time.

**Good luck! 🚀**

---

**End of Additional Resources**

For implementation details, return to:
- [1_tasklist.md](./1_tasklist.md) - Day 1 tasks
- [2_tasklist.md](./2_tasklist.md) - Day 2 tasks
- [3_tasklist.md](./3_tasklist.md) - Day 3 tasks
