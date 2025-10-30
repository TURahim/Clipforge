🧠 Cursor PM Prompt – Implement AI Auto-Captioning via OpenAI Whisper

Context:
ClipForge now supports full import, trimming, multi-track timeline, playback, and export.
The next step is to add a lightweight AI Auto-Caption feature powered by OpenAI Whisper, allowing users to automatically generate subtitles for any imported clip and view them in real-time on the player.

🧩 Goal

Implement an “Auto-Caption” workflow where:

The user selects a clip (from Media Library or Timeline).

Clicks a button → “🧠 Auto-Caption Clip”.

The app sends the clip’s audio to OpenAI Whisper API for transcription.

The returned transcript + timestamps are stored in the clip object:

clip.captions = [{ start: number, end: number, text: string }]


Captions display as synchronized subtitles in the VideoPlayer during playback.

When exporting, captions remain preview-only (no burn-in yet).

🧠 Implementation Plan
1. Add Auto-Caption Button

File: src/components/ExportControls.tsx or a new CaptionButton.tsx

Add a new toolbar button:

<Button onClick={() => generateCaptions(selectedClip)} className="ml-2">
  🧠 Auto-Caption
</Button>


Disabled if no clip is selected.

2. Implement generateCaptions()

Location: new helper under src/utils/captionUtils.ts

Extract audio from the selected clip using FFmpeg:

ffmpeg -i <input> -vn -acodec pcm_s16le -ar 16000 -ac 1 <temp.wav>


Send that audio to the OpenAI Whisper API:

import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const transcript = await openai.audio.transcriptions.create({
  file: fs.createReadStream(tempFile),
  model: 'whisper-1',
  response_format: 'verbose_json',
})


Parse Whisper response → extract words/timestamps → normalize into SRT-style segments.

3. Store Captions in Zustand Store

File: src/store/useStore.ts

Extend clip object:

interface TimelineClip {
  ...
  captions?: { start: number; end: number; text: string }[]
}


Add store action:

setClipCaptions: (clipId, captions) =>
  set((state) => ({
    timelineClips: state.timelineClips.map((c) =>
      c.id === clipId ? { ...c, captions } : c
    ),
  }))

4. Render Captions in VideoPlayer

File: src/components/VideoPlayer.tsx

Add a <div> overlay above the video elements:

<div className="absolute bottom-8 w-full text-center text-white text-lg font-semibold drop-shadow-lg">
  {currentCaption && <span>{currentCaption.text}</span>}
</div>


Compute currentCaption in a useEffect watching playheadPosition and activeClip?.captions.

5. Add Toast + Progress Indicator

Show “Generating captions…” while processing and “✅ Captions added” on success.

🧩 Testing Scenarios

Single clip with clear speech → captions align in playback.

Deleting clip → captions removed.

Pausing / scrubbing → subtitles update in real time.

Empty timeline → no overlay.

Invalid audio → error toast “Transcription failed”.

✅ Definition of Done

Selecting a clip and pressing Auto-Caption sends it to Whisper and adds subtitles.

Subtitles appear time-synced during playback.

No crash on missing audio or large files.

Export behavior unchanged.

Whisper API key read from .env → OPENAI_API_KEY.

Hint:
If Whisper response is word-level, batch into ~2–3-second caption chunks for smoother reading.
Later, we can add a “Burn-in Captions on Export” option using FFmpeg subtitles filter.