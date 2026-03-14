#!/usr/bin/env python3
"""
generate-audio.py — Generate MP3 narrations for The Eternal Thread pages.

Uses ElevenLabs API to convert page text into natural speech.
Run from the root of your site directory.

Setup:
  1. pip install requests beautifulsoup4
  2. Sign up at https://elevenlabs.io and get an API key
  3. Pick a voice from https://elevenlabs.io/voice-library
     (recommended: a calm, measured male or female voice —
      e.g. "Adam", "Antoni", "Rachel", or "Bella")
  4. Set your API key and voice ID below, or use environment variables:
       export ELEVENLABS_API_KEY=your_key_here
       export ELEVENLABS_VOICE_ID=your_voice_id_here

Usage:
  python generate-audio.py                    # Generate all pages
  python generate-audio.py romans6            # Generate one page (partial match)
  python generate-audio.py --list-voices      # List available voices
  python generate-audio.py --dry-run          # Show text that would be narrated
"""

import os
import re
import sys
import json
import glob
import requests
from pathlib import Path

# ─── Configuration ───────────────────────────────────────────
API_KEY = os.environ.get("ELEVENLABS_API_KEY", "YOUR_API_KEY_HERE")
VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "YOUR_VOICE_ID_HERE")
MODEL_ID = "eleven_multilingual_v2"  # High quality; use "eleven_flash_v2_5" for cheaper/faster
OUTPUT_DIR = "audio"
BASE_URL = "https://api.elevenlabs.io/v1"

# Voice settings — calm, measured delivery for theological content
VOICE_SETTINGS = {
    "stability": 0.65,        # Slightly varied for natural feel
    "similarity_boost": 0.80, # Strong fidelity to chosen voice
    "style": 0.15,            # Subtle expressiveness
    "use_speaker_boost": True
}


def get_headers():
    return {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json"
    }


def list_voices():
    """Print available voices."""
    r = requests.get(f"{BASE_URL}/voices", headers=get_headers())
    r.raise_for_status()
    voices = r.json().get("voices", [])
    print(f"\n{'Name':<20} {'Voice ID':<28} {'Category'}")
    print("-" * 70)
    for v in voices:
        print(f"{v['name']:<20} {v['voice_id']:<28} {v.get('category', '')}")
    print(f"\nTotal: {len(voices)} voices")


def extract_text_from_html(filepath):
    """
    Extract readable text from a page's HTML in proper narration order.
    Handles both inline HTML content and JS-rendered data arrays.
    """
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    lines = []

    # 1. Extract page title from <title> tag
    title_match = re.search(r"<title>(.+?)</title>", content)
    if title_match:
        title = title_match.group(1)
        # Clean up — remove " — The Eternal Thread" suffix if present
        title = re.sub(r"\s*[—–-]\s*The Eternal Thread.*", "", title)
        lines.append(title + ".")
        lines.append("")  # Pause

    # 2. Extract header subtitle (italic text under h1)
    header_p = re.search(r'<p[^>]*class="[^"]*"[^>]*font-style:\s*italic[^>]*>(.+?)</p>', content)
    if not header_p:
        header_p = re.search(r'class="header".*?<p>(.+?)</p>', content, re.DOTALL)
    if header_p:
        lines.append(clean_html(header_p.group(1)))
        lines.append("")

    # 3. Extract data from JavaScript arrays (the main content)
    # Match patterns like: { title: "...", verse: "...", scripture: "...", summary: "..." }
    node_pattern = re.compile(
        r"""\{\s*(?:num:\s*\d+\s*,\s*)?"""
        r"""title:\s*["'](.+?)["']\s*,\s*"""
        r"""verse:\s*["'](.+?)["']\s*,\s*"""
        r"""(?:cls:\s*["'].*?["']\s*,\s*)?"""
        r"""(?:hinge:\s*\w+\s*,\s*)?"""
        r"""scripture:\s*["'](.+?)["']\s*,\s*"""
        r"""summary:\s*["'](.+?)["']""",
        re.DOTALL
    )

    matches = node_pattern.findall(content)
    if matches:
        for title, verse, scripture, summary in matches:
            lines.append(clean_js_string(title) + ".")
            lines.append(clean_js_string(verse) + ".")
            lines.append(clean_js_string(scripture))
            lines.append(clean_js_string(summary))
            lines.append("")  # Pause between nodes

    # 4. Also extract simpler node patterns (like failure nodes)
    simple_pattern = re.compile(
        r"""\{\s*title:\s*["'](.+?)["']\s*,\s*text:\s*["'](.+?)["']""",
        re.DOTALL
    )
    simple_matches = simple_pattern.findall(content)
    if simple_matches and not any("TEMPTATION" in m[0] for m in matches):
        # Only add if not already captured
        for title, text in simple_matches:
            lines.append(clean_js_string(title) + ". " + clean_js_string(text))

    # 5. Extract closing quote from footer area
    closing_pattern = re.search(
        r'<p[^>]*style="[^"]*font-style:\s*italic[^"]*"[^>]*>\s*"(.+?)"',
        content, re.DOTALL
    )
    if closing_pattern:
        lines.append("")
        lines.append(clean_html(closing_pattern.group(1)))

    text = "\n".join(lines).strip()

    # Final cleanup
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def clean_html(s):
    """Remove HTML tags and decode entities."""
    s = re.sub(r"<[^>]+>", "", s)
    s = s.replace("&amp;", "&").replace("&mdash;", "—")
    s = s.replace("&ldquo;", '"').replace("&rdquo;", '"')
    s = s.replace("&lsquo;", "'").replace("&rsquo;", "'")
    s = s.replace("&#x27;", "'").replace("&nbsp;", " ")
    return s.strip()


def clean_js_string(s):
    """Clean escaped characters from JS string literals."""
    s = s.replace("\\'", "'").replace('\\"', '"')
    s = s.replace("\\n", " ").replace("\\t", " ")
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def generate_audio(text, output_path):
    """Call ElevenLabs API and save MP3."""
    url = f"{BASE_URL}/text-to-speech/{VOICE_ID}"

    payload = {
        "text": text,
        "model_id": MODEL_ID,
        "voice_settings": VOICE_SETTINGS
    }

    r = requests.post(url, json=payload, headers=get_headers(), stream=True)

    if r.status_code != 200:
        print(f"  ERROR: {r.status_code} — {r.text[:200]}")
        return False

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "wb") as f:
        for chunk in r.iter_content(chunk_size=4096):
            f.write(chunk)

    size_kb = os.path.getsize(output_path) / 1024
    print(f"  Saved: {output_path} ({size_kb:.0f} KB)")
    return True


def main():
    if "--list-voices" in sys.argv:
        list_voices()
        return

    dry_run = "--dry-run" in sys.argv
    filter_name = None
    for arg in sys.argv[1:]:
        if not arg.startswith("--"):
            filter_name = arg
            break

    # Find all HTML pages (exclude index)
    html_files = sorted(glob.glob("*.html"))
    html_files = [f for f in html_files if f != "index.html"]

    if filter_name:
        html_files = [f for f in html_files if filter_name.lower() in f.lower()]

    if not html_files:
        print("No matching HTML files found.")
        return

    print(f"\nProcessing {len(html_files)} page(s)...\n")

    total_chars = 0
    for filepath in html_files:
        name = os.path.splitext(filepath)[0]
        output_path = os.path.join(OUTPUT_DIR, name + ".mp3")

        print(f"─ {filepath}")
        text = extract_text_from_html(filepath)
        chars = len(text)
        total_chars += chars
        print(f"  Characters: {chars}")

        if dry_run:
            print(f"  Preview (first 300 chars):")
            print(f"  {text[:300]}...")
            print()
            continue

        if os.path.exists(output_path):
            print(f"  Skipping (already exists). Delete to regenerate.")
            print()
            continue

        success = generate_audio(text, output_path)
        if not success:
            print(f"  FAILED — skipping.")
        print()

    print(f"{'─' * 40}")
    print(f"Total characters: {total_chars:,}")
    est_credits = total_chars  # 1 credit per char for multilingual v2
    print(f"Estimated credits: {est_credits:,} (Multilingual v2)")
    print(f"              or: {total_chars // 2:,} (Flash v2.5)")

    if dry_run:
        print("\n(Dry run — no audio generated. Remove --dry-run to generate.)")


if __name__ == "__main__":
    main()
