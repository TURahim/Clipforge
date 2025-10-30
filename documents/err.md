Implement Picture-in-Picture (PiP) Playback View

Context:
The timeline system now supports two tracks — the main track (index 0) and the overlay track (index 1) — and clips can be correctly added, moved, and trimmed on both.

However, the video player currently only displays the main track’s clip. When both tracks contain clips (e.g., one in the main track and one in the overlay), playback ignores the overlay and shows only the main clip.

We now want to render a Picture-in-Picture (PiP) view in the player — showing the overlay clip as a smaller, inset video layer on top of the main one during playback.

🧠 Goal

Enable the player to composite both video layers during playback:

Main track → fills the full video player (base layer).

Overlay track → appears as a smaller, movable/resizable inset (top-right corner by default).

Both play in sync (same current time, play/pause, trimming respected).

Export behavior remains unchanged (only affects preview, not final render yet).

🧩 What you’ll need to look into

VideoPlayer.tsx logic:

It currently likely renders a single <video> element or canvas context bound to the active clip.

Update it to handle two concurrent video elements:

One for mainTrackClip

One for overlayTrackClip

They should share the same playback controls and time position from the store (playheadPosition, isPlaying).

Sync logic:

When play/pause triggers, both videos should respond together.

On seek/scrub, set both video.currentTime values to match the playhead.

UI / styling:

Use absolute positioning to render the overlay clip inside the same player container.

Example (React JSX hint):

<div className="relative w-full h-full">
  <video ref={mainRef} className="w-full h-full object-contain" />
  <video
    ref={overlayRef}
    className="absolute bottom-4 right-4 w-1/4 h-auto rounded-lg shadow-lg border border-gray-600"
  />
</div>


Zustand store usage:

You can derive active clips for each track:

const mainClip = timelineClips.find(c => c.track === 0)
const overlayClip = timelineClips.find(c => c.track === 1)


Ensure VideoPlayer updates both refs when these change.

Edge cases:

Only one clip present → behave as before.

Overlay clip without main → overlay fills the frame.

When deleting clips, reset inactive players.

✅ Definition of Done

When both tracks contain clips:

The player displays the main clip full-size.

The overlay clip appears as a small PiP in the corner (configurable in future).

Both videos stay in sync on play, pause, and scrubbing.

When only one track is active, the player defaults to that track’s clip.

The rest of the editing pipeline (trimming, exporting) remains unchanged.

Hint:
If performance becomes an issue with two <video> elements, consider a <canvas> compositing approach later. For now, focus on functional two-layer playback using synchronized <video> tags.