import type { Caption } from '../types'

interface WhisperWord {
  word: string
  start: number
  end: number
}

/**
 * Chunk words into readable caption segments
 * Groups words into 2-3 second chunks, breaking at sentence boundaries
 */
function chunkWordsToCaptions(words: WhisperWord[]): Caption[] {
  const captions: Caption[] = []
  let currentChunk: WhisperWord[] = []
  let chunkStart = 0
  
  for (const word of words) {
    if (currentChunk.length === 0) {
      chunkStart = word.start
    }
    
    currentChunk.push(word)
    
    // Create chunk if duration > 3s or end of sentence
    const duration = word.end - chunkStart
    const isEndOfSentence = word.word.match(/[.!?]$/)
    
    if (duration > 3 || isEndOfSentence) {
      captions.push({
        start: chunkStart,
        end: word.end,
        text: currentChunk.map(w => w.word).join(' ').trim()
      })
      currentChunk = []
    }
  }
  
  // Add remaining words
  if (currentChunk.length > 0) {
    const lastWord = currentChunk[currentChunk.length - 1]
    captions.push({
      start: chunkStart,
      end: lastWord.end,
      text: currentChunk.map(w => w.word).join(' ').trim()
    })
  }
  
  return captions
}

interface WhisperSegment {
  start: number
  end: number
  text: string
}

interface WhisperResponse {
  words?: WhisperWord[]
  segments?: WhisperSegment[]
}

/**
 * Parse Whisper API response and extract captions
 */
function parseWhisperResponse(response: WhisperResponse): Caption[] {
  if (!response.words || response.words.length === 0) {
    // Fallback: use segments if words not available
    if (response.segments && response.segments.length > 0) {
      return response.segments.map((segment) => ({
        start: segment.start,
        end: segment.end,
        text: segment.text.trim()
      }))
    }
    
    return []
  }
  
  // Use word-level timestamps for better precision
  return chunkWordsToCaptions(response.words)
}

/**
 * Generate captions for a video clip using OpenAI Whisper API
 */
export async function generateCaptions(
  clipId: string,
  filePath: string
): Promise<Caption[]> {
  console.log('[Captions] Generating captions for clip:', clipId)
  
  // Step 1: Extract audio from video
  const extractResult = await window.electron.invoke('extract-audio', filePath) as {
    success: boolean
    audioPath?: string
    error?: string
  }
  
  if (!extractResult.success || !extractResult.audioPath) {
    throw new Error(extractResult.error || 'Failed to extract audio')
  }
  
  const audioPath = extractResult.audioPath
  
  try {
    // Step 2: Get API key from environment
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in .env.local')
    }
    
    // Step 3: Read audio file
    console.log('[Captions] Reading audio file:', audioPath)
    const audioBuffer = await window.electron.invoke('read-audio-file', audioPath) as {
      success: boolean
      data?: ArrayBuffer
      error?: string
    }
    
    if (!audioBuffer.success || !audioBuffer.data) {
      throw new Error(audioBuffer.error || 'Failed to read audio file')
    }
    
    // Step 4: Create FormData and send to Whisper API
    console.log('[Captions] Sending to Whisper API...')
    const formData = new FormData()
    const audioBlob = new Blob([audioBuffer.data], { type: 'audio/wav' })
    formData.append('file', audioBlob, 'audio.wav')
    formData.append('model', 'whisper-1')
    formData.append('response_format', 'verbose_json')
    formData.append('timestamp_granularities[]', 'word')
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Whisper API error: ${response.status} ${errorText}`)
    }
    
    const result = await response.json()
    console.log('[Captions] Whisper response received')
    
    // Step 5: Parse response and generate captions
    const captions = parseWhisperResponse(result)
    
    // Step 6: Clean up temp audio file
    await window.electron.invoke('delete-audio-file', audioPath)
    
    console.log('[Captions] Generated', captions.length, 'caption segments')
    return captions
    
  } catch (error) {
    // Clean up temp file on error
    try {
      await window.electron.invoke('delete-audio-file', audioPath)
    } catch (cleanupError) {
      console.warn('[Captions] Failed to clean up audio file:', cleanupError)
    }
    
    throw error
  }
}

