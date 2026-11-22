---
version: 1.0
name: Dri4n-Creative-Industrialist-Swiss
description: Design system for Adrian's (Dri4n) Creative Mode (/art) — fusing a full-bleed oversized Aguafina Script masthead in industrial vermilion (#EA6A12) with an austere Swiss-Industrialist editorial archive inspired by Gaurav Mishra (jackingcactus.com): sharp 0px media edges, tight 12px uppercase micro-typography, asymmetric whitespace-driven grids, raw 1px steel hairlines, and tactile material micro-controls.
dial: ENERGY 3 / RHYTHM 3 / MOTION 2
---

# Dri4n Creative Mode (`/art`) — Design System

## 1. Visual Direction & Philosophy

- **Identity**: A single-page **Swiss-Industrialist Creative Archive** where typography and raw media do all the work.
- **Hero Masthead (Locked)**: Full-bleed edge-to-edge oversized **`Aguafina Script`** wordmark (`"Adrian"`) in fiery industrial vermilion (`#EA6A12`), bleeding off the top, left, and right edges (`46.5vw`, `line-height: 0.78`, `margin-top: -0.11em`), with clean uppercase geometric sans micro-copy (`Inter` Light, zero background box) floating directly over the lower-right strokes.
- **Archive Body (Inspired by Gaurav Mishra / `jackingcactus.com`)**:
  - **Zero-Radius (`0px`) Sharp Media Framing**: Every photograph, poster, editorial spread, and video frame uses sharp `0px` corners with zero drop shadows. Artwork carries the color; UI chrome stays strictly achromatic plus one industrial vermilion accent.
  - **Austere Swiss Micro-Typography**: `12px` uppercase labels with tight negative tracking (`-0.34px`), `14px` line-height, and `4px–14px` caption offsets directly beneath media.
  - **Whitespace & Tight Grid Rhythm**: Separation comes from deliberate Swiss grid gaps (`6px–9px` inside dense media grids, `56px–120px` between discipline bands) and `1px` steel hairlines only on industrial chassis headers.
  - **Anti-Slop Dials**: `ENERGY 3 / RHYTHM 3 / MOTION 2`.

---

## 2. Color Palette (Constrained: 2 Core Neutrals + 1 Accent)

### Dark Mode (Default — Matte Obsidian Industrial)
| Token | Value | Role |
|---|---|---|
| `--ind-bg` | `#0B0B0B` | Primary page canvas (matte obsidian) |
| `--ind-surface` | `#121212` | Industrial chassis & row container surface |
| `--ind-surface-raised` | `#191919` | Control strips, active tabs, metadata rails |
| `--ind-border` | `#272727` | `1px` steel hairline dividers |
| `--ind-border-strong` | `#3B3B3B` | Active/hover control borders & registration ticks |
| `--ind-ink` | `#F2EFE9` | Primary text, nav, titles (`17.15:1` on `#0B0B0B`) |
| `--ind-ink-soft` | `#B5B1A8` | Secondary descriptions & subtitles |
| `--ind-ink-muted` | `#7E7A72` | Frame numbers, dates, credits, metadata labels |
| `--ind-accent` | `#EA6A12` | Signature industrial vermilion (`"Adrian"`, index badge, viewfinder brackets, active selection) |
| `--ind-accent-ink` | `#0B0B0B` | Text on `#EA6A12` surfaces (`6.16:1` WCAG AA) |

### Light Mode (Swiss Paper / Concrete)
| Token | Value | Role |
|---|---|---|
| `--ind-bg` | `#F2EFE9` | Primary concrete/paper canvas (or pure `#FFFFFF` on editorial detail views) |
| `--ind-surface` | `#E9E5DC` | Industrial chassis surface |
| `--ind-surface-raised` | `#FFFFFF` | Control strips, active tabs, metadata rails |
| `--ind-border` | `#D0CBBF` | `1px` hairline dividers |
| `--ind-border-strong` | `#AFA99B` | Hover borders & ticks |
| `--ind-ink` | `#141413` | Primary ink (`16.06:1` on `#F2EFE9`) |
| `--ind-ink-soft` | `#3D3A35` | Secondary copy |
| `--ind-ink-muted` | `#656159` | Metadata & micro-captions |
| `--ind-accent` | `#D95B08` | Industrial vermilion tuned for light-mode contrast |
| `--ind-accent-ink` | `#FFFFFF` | Text on `#D95B08` surfaces |

### Palette Rules
- Never introduce purple, cyan, neon green, or multi-color gradients into UI chrome.
- Active navigation links use `text-decoration: underline` with `text-underline-offset: 2px` rather than colored pills.
- All chromatic variety comes strictly from the photographs, posters, prints, and film frames themselves.

---

## 3. Typography

| Tier | Font Family | Size | Weight | Line Height | Tracking | Case / Use |
|---|---|---|---|---|---|---|
| **Hero Wordmark** | `Aguafina Script` (`--font-art-script`) | `46.5vw` | `400` | `0.78` | `-0.015em` | Edge-to-edge `"Adrian"`, `margin-top: -0.11em`, zero clipping wrapper margins |
| **Hero Micro-Copy** | `Inter` (`--font-inter`) | `clamp(10px, 1.2vw, 16px)` | `300` | `1.35` | `0.025em` | Uppercase, zero background box, overlaid on lower-right `left: 50%; right: 4%; bottom: 12%` |
| **Swiss Nav & Footer** | `Inter` / `DM Mono` | `12px` | `400` | `14px` | `-0.34px` | Uppercase (`©ADRIAN`, `PHOTO`, `DESIGN`, `PRINT`, `VIDEO`, `ABOUT`) |
| **Section Index & HUD** | `DM Mono` (`--font-dm-mono`) | `10px–11px` | `400–500` | `1.2` | `0.12em` | Uppercase technical codes (`01`, `FRM_01 / 18`, `35MM ROLL`), `tabular-nums` |
| **Card Title / Caption** | `Inter` (`--font-inter`) | `12px` | `400–500` | `14.4px` | `-0.12px` | Uppercase, sits `4px–10px` below sharp `0px` media |
| **Tag Pills** | `Inter` / `DM Mono` | `10px` | `400` | `12px` | `0.06em` | Uppercase inside `2px`-radius flat rectangular tags (`padding: 5px 14px`) |
| **Case Study Sidebar Body** | `Inter` (`--font-inter`) | `11px–12px` | `400` | `1.45` | `0` | Sentence case for readable project narratives & credits |
| **Long-Form Essay Body** | `Inter` (`--font-inter`) | `16px` | `400` | `21px` | `0` | Sentence case in 50/50 Swiss split reading layout |

---

## 4. Layout System & Row-by-Row Rhythm

### Sticky Swiss Top Utility Bar
- Compact fixed bar (`32px–44px` height, `padding: 0 16px`), 2-column Swiss midpoint grid (`1fr 1fr`):
  - Left column: `← DEV` portal button + `©ADRIAN`.
  - Right column (starts at `50%` midpoint): inline uppercase section jumps (`PHOTO`, `DESIGN`, `PRINT`, `VIDEO`, `ABOUT`, `gap: 14px`) with `CONTACT` + Light/Dark toggle aligned far-right.
  - Active section marked exclusively with `underline` (`text-underline-offset: 2px`).

### Hero Band (Full-Bleed)
- Spans `100%` viewport width, zero horizontal padding, zero bottom gap before Row 01.
- `"Adrian"` in `Aguafina Script` at `46.5vw` (`#EA6A12`), overlaid lower-right with clean uppercase `Inter` Light micro-copy (no background box).

### Row 01: Full-Bleed Industrialist Photo Archive (`01 / PHOTOGRAPHY ARCHIVE`)
- Flush `w-full` chassis directly beneath the masthead (`border-top` & `border-bottom` `1px solid var(--ind-border)`).
- **Mechanical Control Strip**: Index badge `01`, title, `[ 01 / NN FRAMES ]` tabular counter, `Filmstrip | All (N)` mode switch, and `←` / `→` stepper buttons.
- **Filmstrip Light-Table Mode**: Main viewfinder stage with 4 corner `#EA6A12` registration brackets (`┌ ┐ └ ┘`), technical metadata rail on the right (`280px`), and full 35mm sprocket horizontal rail of ALL photos at the bottom.
- **Contact Sheet Mode**: Tight Swiss grid (`gap: 6px–9px`, `0px` radius) showing all photos simultaneously, with every 5th frame spanning 2 columns for editorial rhythm.

### Row 02+ (Asymmetric Swiss Editorial Bands — Built Row by Row)
Follow Gaurav Mishra's varied section compositions so no two consecutive rows repeat the same template (`R-05`):
- **Asymmetric 2-Column Editorial Row** (matching Figma `Rectangles 4–7`): `grid-template-columns: repeat(12, 1fr)` with deliberate offset proportions (`col-span-5` compact landscape block paired with `col-span-7` tall portrait block, or `2-column` `gap: 14px 7px` full-bleed showcase).
- **3-Column Tight Archive Grid**: `grid-template-columns: repeat(3, 1fr)`, `gap: 9px`, portrait aspect ratio `468 / 522`, sharp `0px` corners, `12px` uppercase caption `6px` underneath.
- **Offset Editorial Band**: Intro copy indented to `margin-left: 50%` (`max-width: min(600px, 50% - 16px)`), or fixed left-margin discipline label (`170px` wide) paired with right media stream (`gap: 6px`).
- **Detail / Case-Study Modal or View**: Fixed `170px–210px` left metadata rail (Title, `2px`-radius flat category pills, concise description, credits) + right stacked media stream (`6px` vertical gaps across 1-, 2-, and 3-column `.mrow` rows) + `34×34px` square `×` close button at top-right.

### Responsive Breakpoints
- **Desktop (`>= 1200px`)**: Full Swiss midpoint nav, 3-col / 12-col asymmetric grids, fixed metadata rails.
- **Tablet (`810px – 1199px`)**: 3-col grids collapse to 2-col; tighter vertical spacing.
- **Mobile (`<= 809px`)**: Single-column stacking, `44×44px` minimum tap targets, hero description reflows cleanly below `"Adrian"` so text never collides with tight strokes, zero horizontal overflow.

---

## 5. Component & Material Rules

- **Border Radius**:
  - `0px`: All photographs, posters, video thumbnails, case-study media, and full-bleed row containers.
  - `2px`: Rectangular tag pills, mechanical stepper buttons, index badges (`01`), and viewfinder stamps.
  - `8px`: Reserved strictly for frosted-glass floating audio/media player overlays (if used), max 1–2 glass elements per page (`R-10`).
- **Shadows & Glows**: None on cards, grids, or buttons. Flat industrial materiality with `1px` hairlines only where structural separation is required.
- **Icons**: Minimal functional icons only (arrows, close `×`, expand, grid/filmstrip toggle, theme toggle). No decorative emojis or generic AI icons (`R-04`).
- **Close Control**: `34×34px` sharp/2px square button (`border: 1px solid var(--ind-border-strong)`, `×` SVG) in top-right of lightboxes and project detail views.
- **Motion (`MOTION 2`)**: Crisp mechanical snap transitions (`150ms–300ms ease-out`), subtle `scale(1.015)` image inspection hover, keyboard `←`/`→`/`Esc` navigation, and full `prefers-reduced-motion` support (`R-19`, `R-39`).

---

## 6. Anti-Slop Quality Locks

- **No em dashes (`—`)** in any UI copy; use periods, commas, colons, or slashes (`R-02`).
- **No fabricated stats, awards, or filler text**; every frame, caption, and project comes from real Supabase data or explicitly labeled upcoming row slots (`R-17`, `R-38`).
- **Every data view ships Loading, Empty, and Error states** with clear cause and retry action (`R-27`).
- **Both Dark and Light modes must pass WCAG AA** (`>= 4.5:1` normal text, `>= 3:1` large text and non-text borders) (`R-25`, `R-34`).
