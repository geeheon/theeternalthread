# Navigation & Audio Widgets — Integration Guide

## Files Overview

```
your-site/
├── site-map.json          ← Single source of truth for all pages
├── nav-widget.css         ← Navigation panel styles
├── nav-widget.js          ← Navigation panel logic
├── audio-widget.css       ← Audio player styles
├── audio-widget.js        ← Audio player logic
├── generate-audio.py      ← Run locally to create MP3s
├── audio/                 ← Generated MP3s go here
│   ├── romans6-flowchart.mp3
│   ├── galatians-flowchart.mp3
│   └── ...
├── index.html
├── romans6-flowchart.html
└── ...
```

## Step 1 — Add to Each Page

Add these 4 lines inside the `<head>` of every page (including index.html for the nav):

```html
<link rel="stylesheet" href="nav-widget.css">
<link rel="stylesheet" href="audio-widget.css">
<script defer src="nav-widget.js"></script>
<script defer src="audio-widget.js"></script>
```

That's it. Both widgets are self-contained.

**What you'll see:**
- Bottom-left: ☰ hamburger → opens navigation panel
- Bottom-right: ▶ play button → plays page audio (only shows if MP3 exists)
- Index page: nav button only (audio button auto-hides)


## Step 2 — Generate Audio

One-time setup:
```bash
pip install requests beautifulsoup4
export ELEVENLABS_API_KEY=your_key
export ELEVENLABS_VOICE_ID=your_voice_id
```

Preview what text will be narrated (no API call):
```bash
python generate-audio.py --dry-run
```

Generate all pages:
```bash
python generate-audio.py
```

Generate one specific page:
```bash
python generate-audio.py romans6
```

List available voices:
```bash
python generate-audio.py --list-voices
```

The script skips pages that already have an MP3. Delete the MP3 to regenerate.


## Step 3 — Adding a New Page

When you add a new page to the site:

1. **Add its entry to `site-map.json`** in the correct section
2. Add the 4 widget lines to the new page's `<head>`
3. Run `python generate-audio.py new-page-name` to generate its audio
4. Update `index.html` with the new card (as before)

The navigation on every existing page updates automatically —
no need to touch any other files.


## Navigation Behaviour

- Loads `site-map.json` on each page
- Auto-detects which page you're on and highlights it
- Auto-expands the section containing the current page
- Sections are collapsible (tap the heading)
- Closes on overlay click, × button, or Escape key
- "← All Figures" link at bottom returns to index


## Audio Behaviour

- Checks if `audio/[page-name].mp3` exists via HEAD request
- If no MP3 → button stays hidden (no error, no broken UI)
- Play/pause on tap
- Progress ring shows playback position
- Long press or right-click → speed menu (0.75×, 1×, 1.25×, 1.5×, 2×)
- Resets on track end


## Voice Recommendation

For the theological, structural tone of The Eternal Thread, look for
a voice that is calm, measured, and clear — not dramatic or overly warm.

Good starting points in ElevenLabs' library:
- "Adam" — clear, neutral male
- "Antoni" — calm, slightly deeper
- "Rachel" — measured, articulate female

You can preview voices at https://elevenlabs.io/voice-library
before committing to one.


## Cost Estimate

Your 17 pages contain roughly 50,000–70,000 characters total.
- Multilingual v2 (best quality): ~60,000 credits
- Flash v2.5 (faster, cheaper): ~30,000 credits

The Creator plan ($11/month for 30,000 credits) would cover your
entire site in Flash, or about half in Multilingual v2.

Since you only regenerate when content changes, ongoing costs
are near zero after the initial generation.
