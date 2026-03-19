# The Eternal Thread — Project Guide

## Project overview

- **Site name:** The Eternal Thread (theeternalthread.org)
- **Deployed on:** Netlify, auto-deploys from this repo on push to `main`
- **Purpose:** Interactive theological flowcharts tracing themes through Scripture
- **Theological framework:** Rooted in Watchman Nee, Devern Fromke, Frank Viola, W. Ian Thomas, T. Austin-Sparks. Central theme is Galatians 2:20 — Christ's indwelling life, not self-improvement
- **Audience:** The site owner is an engineer by profession, not a theologian. Content must be accessible without academic jargon, but theologically precise and substantive

---

## File structure

```
/
├── index.html                  ← homepage, driven by site-map.json
├── site-map.json               ← single source of truth for all pages, sections, themes
├── nav-widget.css / .js        ← floating hamburger nav (injected on every page)
├── audio-widget.css / .js      ← audio player widget (injected on every page)
├── audio/                      ← one .mp3 per flowchart (filename matches HTML)
├── [flowchart].html            ← each flowchart is a fully self-contained HTML file
├── CNAME                       ← Netlify custom domain
└── generate-audio.py           ← utility for generating audio files
```

No build tooling. No bundler. Pure HTML/CSS/JS. Everything deployed as-is.

---

## File inventory (from site-map.json)

### The Christian Life (theme: gold)
| # | File | Title |
|---|------|-------|
| 01 | `romans6-flowchart.html` | Romans 6 — Reckoning |
| 02 | `baptism-flowchart.html` | Baptism — Burying a Dead Man |
| 03 | `galatians-flowchart.html` | Galatians — The Whole Letter |
| 04 | `all-things-good-flowchart.html` | All Things Work Together for Good |
| 05 | `to-will-is-present-flowchart.html` | To Will Is Present with Me |
| 06 | `two-adams-figure.html` | The Two Adams |
| 07 | `vine-and-branches-flowchart.html` | The Vine and the Branches |
| 08 | `agape-love-flowchart.html` | Agape |
| 09 | `fact-faith-experience-flowchart.html` | What Faith Actually Is |
| 10 | `god-and-mammon-flowchart.html` | God and Mammon |

### God's Grand Narrative (theme: purple)
| # | File | Title |
|---|------|-------|
| 11 | `eternal-purpose-flowchart.html` | God's Eternal Purpose |
| 12 | `mystery-flowchart.html` | The Mystery |
| 13 | `fromke-ultimate-intention-flowchart.html` | The Ultimate Intention |
| 14 | `image-of-god-flowchart.html` | The Image of God |
| 15 | `where-you-begin-flowchart.html` | Where You Begin |
| 16 | `kingdom-of-god-flowchart.html` | The Kingdom of God |
| 17 | `final-judgment-flowchart.html` | Final Judgment |
| 18 | `your-sins-i-remember-no-more-flowchart.html` | Your Sins I Remember No More |

### Spiritual Growth (theme: silver)
| # | File | Title |
|---|------|-------|
| 19 | `children-youngmen-fathers-flowchart.html` | Children, Young Men, Fathers |
| 20 | `two-operating-systems-flowchart.html` | Two Operating Systems |
| 21 | `soul-vs-spirit-flowchart.html` | Soul vs Spirit |
| 22 | `three-kinds-of-man-flowchart.html` | Three Kinds of Man |
| 23 | `addon-vs-operating-system-flowchart.html` | Add-On vs Operating System |
| 24 | `school-of-christ-flowchart.html` | The School of Christ |

### Church & Culture (theme: warm)
| # | File | Title |
|---|------|-------|
| 25 | `head-and-body-flowchart.html` | The Head and the Body |

---

## Design system

### Fonts
```
Cormorant Garamond — serif, used for headings, scripture quotes, verse refs, large decorative numbers
DM Sans — sans-serif, used for body text, labels, section headers, UI chrome

Google Fonts import:
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=DM+Sans:wght@400;500;700;800&display=swap
```

### Colour palette

**Backgrounds:**
- `#0f0f17` — standard dark body background (most pages)
- `#0a0a10` — slightly deeper dark (soul-vs-spirit, school-of-christ)
- `#08080e` — deepest dark (two-operating-systems)

**Body text:** `#d4c5a0` (warm cream)
**Muted text:** `#a09880`, `#888070`, `#808070`
**Faint text / tap hints:** `#606068`, `#504840`

**Accent colours by theme:**
| Theme | Accent hex | Used for |
|-------|-----------|----------|
| gold | `#e6c068` | The Christian Life section |
| purple | `#d4a0f0` / `#c0a0e8` | God's Grand Narrative section |
| silver | `#c0c0d8` | Spiritual Growth section |
| warm | `#e6a868` | Church & Culture section |
| green | `#68e6a0` | Result / positive nodes (cross-section) |
| red | `#e66868` | Failure / warning nodes (cross-section) |
| blue | `#68a0e6` | (reserved on index.html, unused so far) |

**index.html card classes:** `.card.gold`, `.card.purple`, `.card.green`, `.card.silver`, `.card.blue`, `.card.warm`

### Layout
```css
.container {
  max-width: 460px;
  margin: 0 auto;
  padding: 40px 20px 60px;
}
```
Single-column, mobile-first. No responsive breakpoints beyond 460px container cap.

### Header (per flowchart page)
```html
<div class="header">
  <h1>Title Here</h1>           <!-- Cormorant Garamond, ~26–32px, font-weight 300, accent colour, letter-spacing 3px -->
  <div class="header-line"></div> <!-- 40px wide, 1.5px tall, gradient line in accent colour -->
  <p>Verse reference or tagline</p> <!-- Cormorant Garamond, 16px, italic, muted -->
</div>
```

### Expandable node cards
The core interaction pattern — clicking a node reveals scripture and commentary:

```html
<div class="node gold" onclick="toggle(this)">
  <div class="node-header">
    <span class="node-number">01</span>   <!-- Cormorant Garamond, ~26–28px, weight 300, accent, opacity 0.4–0.5 -->
    <span class="node-title">TITLE</span> <!-- DM Sans, 12px, weight 700, letter-spacing 2px, accent colour -->
  </div>
  <div class="node-verse">Verse ref</div>  <!-- Cormorant Garamond, 13px, italic, accent at ~50% opacity -->
  <div class="node-scripture">…</div>      <!-- Hidden until active. Italic, border-left 2px accent at 25% opacity -->
  <div class="node-summary">…</div>        <!-- Hidden until active. DM Sans 13.5px, line-height 1.65 -->
  <div class="node-tap">tap to expand</div> <!-- Hidden on active -->
</div>
```

**Active state:**
```css
.node.active {
  border-color: [full accent];
  box-shadow: 0 0 30px rgba([accent-rgb], 0.12), 0 4px 20px rgba(0,0,0,0.3);
  transform: scale(1.02);
}
.node.active .node-scripture { display: block; }
.node.active .node-summary { display: block; }
.node.active .node-tap { display: none; }
```

Toggle JS pattern (inline or in a script block):
```js
function toggle(el) {
  el.classList.toggle('active');
}
```

### Flow arrows
Between nodes, to show logical progression:
```html
<div class="arrow [theme]">
  <div class="arrow-line"></div>    <!-- thin vertical line, ~20–30px, gradient in accent -->
  <div class="arrow-label">THEREFORE</div>
  <div class="arrow-head"></div>    <!-- CSS triangle pointing down -->
</div>
```

### Verse box / definition box
Centred block used to present a key scripture or definition at the top of a page:
```html
<div class="verse-box">              <!-- or .def, .scripture-block -->
  <div class="verse-text">…</div>   <!-- Cormorant Garamond, ~17–18px, italic, accent colour -->
  <div class="verse-ref">…</div>    <!-- DM Sans, 11px, letter-spacing 1.5px, muted -->
</div>
```
Background: `rgba([accent-dark], 0.5)`, border: `1px solid rgba([accent-rgb], 0.12)`

### Section dividers / labels
```html
<div class="section-label"><span>SECTION HEADING</span></div>
```
DM Sans, 9px, font-weight 800, letter-spacing 2–3px, accent colour. Often in a badge/pill style.

---

## The metaphor key widget

The bicycle/car analogy appears across multiple flowcharts. Files that use the analogy must include the **Metaphor Key** widget — a collapsible section placed near the top of the page body (after the header, before the main content).

**The analogy (exact wording varies per page, but the core meaning is fixed):**
- 🚲 **Bicycle** — self-effort. You as the engine: you pedal, you steer, you produce the motion. Religious accessories can be bolted on, but the source is still self.
- 🚗 **Car** — Christ Himself. You have been placed inside Him. A wholly different source, not more effort.

**Widget HTML:**
```html
<!-- Metaphor Key -->
<div class="metaphor-key" id="metaphor-key">
  <div class="metaphor-key-toggle" onclick="document.getElementById('metaphor-key').classList.toggle('open')">
    <span class="metaphor-key-label">METAPHOR KEY</span>
    <span class="metaphor-key-arrow">&#9660;</span>
  </div>
  <div class="metaphor-key-content">
    <div class="metaphor-key-item">
      <span class="metaphor-key-icon">&#x1F6B2;</span>
      <span class="metaphor-key-text"><em>Bicycle</em> — [page-specific description of self-effort].</span>
    </div>
    <div class="metaphor-key-item">
      <span class="metaphor-key-icon">&#x1F697;</span>
      <span class="metaphor-key-text"><em>Car</em> — [page-specific description of Christ as source].</span>
    </div>
    <a href="two-operating-systems-flowchart.html" class="metaphor-key-link">SEE: TWO OPERATING SYSTEMS &rarr;</a>
  </div>
</div>
```

**Widget CSS (styled to page accent colour — change hover colour to match):**
```css
.metaphor-key {
  margin: 0 0 24px;
  border-radius: 8px;
  border: 1px solid rgba([accent-rgb], 0.12);
  background: rgba([accent-dark], 0.3);
  overflow: hidden;
}
.metaphor-key-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
}
.metaphor-key-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 2px;
  color: [accent];
}
.metaphor-key-arrow {
  font-size: 10px;
  color: [accent];
  opacity: 0.5;
  transition: transform 0.2s;
}
.metaphor-key.open .metaphor-key-arrow { transform: rotate(180deg); }
.metaphor-key-content {
  display: none;
  padding: 0 16px 14px;
}
.metaphor-key.open .metaphor-key-content { display: block; }
.metaphor-key-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}
.metaphor-key-item:last-child { margin-bottom: 0; }
.metaphor-key-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
.metaphor-key-text {
  font-size: 13px;
  line-height: 1.55;
  color: #a09880;
}
.metaphor-key-text em { color: [accent]; font-style: normal; }
.metaphor-key-link {
  display: block;
  margin-top: 12px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #707870;
  text-decoration: none;
}
.metaphor-key-link:hover { color: [accent]; }
```

**Files that have the metaphor key (verified):**
- `addon-vs-operating-system-flowchart.html` ✓
- `baptism-flowchart.html` ✓
- `soul-vs-spirit-flowchart.html` ✓
- `three-kinds-of-man-flowchart.html` ✓
- `to-will-is-present-flowchart.html` ✓

**Files that use the bicycle/car analogy but do NOT have the full widget:**
- `school-of-christ-flowchart.html` — has a simpler inline "cross-ref" block instead

**Source / definition page (no widget needed — IS the key):**
- `two-operating-systems-flowchart.html`

---

## External widgets (nav + audio)

Every flowchart HTML file must include these four lines at the top of `<head>`:

```html
<link rel="stylesheet" href="nav-widget.css">
<link rel="stylesheet" href="audio-widget.css">
<script defer src="nav-widget.js"></script>
<script defer src="audio-widget.js"></script>
```

- `nav-widget.js` reads `site-map.json` and injects a floating hamburger nav drawer
- `audio-widget.js` looks for an audio file at `audio/[current-filename].mp3` and injects a player if found
- **`school-of-christ-flowchart.html` is currently missing these widget links** — an inconsistency to be aware of

When adding a new page, also:
1. Add an `.mp3` file to `/audio/` with the same base filename
2. Add the page entry to `site-map.json`

---

## Content rules

- **No personal references or real names** in any public-facing content
- **Sensitive behavioural struggles** — use soft, non-graphic language. Describe the pattern, not the specifics
- **Scripture references** use standard abbreviation format: `Rom. 6:6`, `Gal. 2:20`, `Heb. 4:12`
- **Each HTML file must be fully self-contained** — inline all CSS in `<style>` tags; no external stylesheets except nav/audio widgets and Google Fonts
- **New flowcharts must match the dark aesthetic** — do not introduce light backgrounds, bright colours, or different font stacks
- **Always update `site-map.json` when adding or removing pages** — this drives both the homepage and the nav widget

---

## Editing rules

- **Keep changes minimal.** Only do what is directly requested. Do not refactor, reorganise, or "improve" unless asked.
- **When creating a new flowchart,** copy the structure from the most recent or most representative existing flowchart file. Use an existing file as the template — do not generate from scratch.
- **Colour palette assignment:** Gold and purple are heavily used. Silver is the Spiritual Growth section. Warm/orange is Church & Culture. Blue (`#68a0e6`) exists on the index but has not been used for a flowchart page yet.
- **Metaphor key:** any flowchart that references the bicycle/car analogy must include the metaphor key widget, styled to its page's accent colour.
- **`site-map.json` is authoritative** for page listing, ordering, theme colour, and section grouping. The index.html reads from it; edit the JSON to change how pages appear.

---

## Background context

- The original flowcharts were built in a single Claude.ai session. Some were subsequently revised to remove personal references before public deployment. The current repo files are authoritative.
- The **bicycle/car analogy** originated with the site owner. It has since been updated: the metaphor uses a plain **car** (not "self-driving car") as that is more theologically correct — a car is still externally powered and directed, which is the point.
- The site owner's contributions also include the "add-on feature vs operating system" critique of consumer Christianity.
- **Key Scripture anchors:** Romans 6, Galatians 2:20, Ephesians 1:4–6, Ephesians 3:9–11, 1 Corinthians 2:14–3:3, Philippians 2:12–13, Romans 8:28–30

**Planned future flowcharts (do not create unless asked):**
- The Tabernacle
- Created vs Uncreated Life
- Work vs Way of the Cross
- The Bride
- Law vs Grace
