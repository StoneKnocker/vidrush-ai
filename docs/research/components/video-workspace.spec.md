# VideoWorkspace Specification

## Overview
- **Target directory:** `app/components/video-workspace/`
- **Main component:** `app/components/video-workspace/index.tsx`
- **Sub-components:** `generation-form.tsx`, `video-preview.tsx`, `settings-panel.tsx`, `upload-area.tsx`
- **Reference screenshots:**
  - `docs/design-references/seedance2.ai/page-multi-reference.png`
  - `docs/design-references/seedance2.ai/page-image-to-video.png`
  - `docs/design-references/seedance2.ai/page-text-to-video.png`
  - `docs/design-references/seedance2.ai/page-text-to-video-tablet.png`
  - `docs/design-references/seedance2.ai/page-text-to-video-mobile.png`
- **Interaction model:** click-driven tabs (Multi Reference / Image to Video / Text to Video)
- **Source:** Seedance 2.0 generation workspace UI from https://seedance2.ai/

## Project Context
The code lives in an existing React Router v7 + Cloudflare Workers project that already uses:
- Tailwind CSS v4
- shadcn/ui (variables already defined in `app/app.css` or globals)
- `lucide-react` for icons
- `class-variance-authority` / `clsx` / `tailwind-merge` (via `cn()` utility)

Use the existing shadcn components and `cn()` helper. Do not install new dependencies unless strictly necessary. All icons in this component are available in `lucide-react`.

## Global Color Tokens (shadcn dark theme observed on target)
From `getComputedStyle(document.documentElement)`:
- `--background`: `hsl(223.8136 0.0000% 3.9388%)` (~ `#0a0a0a`)
- `--foreground`: `hsl(223.8136 0.0004% 98.0256%)` (~ `#fafafa`)
- `--card`: `hsl(223.8136 0.0000% 9.0527%)` (~ `#171717`)
- `--card-foreground`: `hsl(223.8136 0.0004% 98.0256%)` (~ `#fafafa`)
- `--primary`: `hsl(223.8136 0.0001% 89.8161%)` (~ `#e5e5e5`)
- `--primary-foreground`: `hsl(223.8136 0.0000% 9.0527%)` (~ `#171717`)
- `--muted`: `hsl(223.8136 0.0000% 14.9382%)` (~ `#262626`)
- `--muted-foreground`: `hsl(223.8136 0.0000% 63.0163%)` (~ `#a1a1a1`)
- `--border`: `hsl(223.8136 0.0000% 15.5096%)` (~ `#282828`)
- `--input`: `hsl(223.8136 0.0000% 20.3885%)` (~ `#343434`)
- `--ring`: `hsl(223.8136 0.0000% 45.1519%)` (~ `#737373`)

Use the shadcn CSS variable classes (`bg-card`, `text-foreground`, `bg-primary`, `text-primary-foreground`, etc.) where possible. The exact computed values above are the reference.

## Component Layout

```
VideoWorkspace (container)
├── GenerationForm (left column, #generation-form)
│   ├── Tab bar (3 tabs)
│   ├── AI Model dropdown
│   ├── Tab-specific content (uploads / prompt / virtual portrait / return last frame)
│   ├── Prompt section
│   ├── Settings panel (resolution, duration, aspect ratio, advanced)
│   └── Generate button
└── VideoPreview (right column, flex-1)
    ├── Video player (example output)
    └── Multi Reference Guide card (only in Multi Reference tab)
```

## 1. Workspace Container

### Selector / DOM
- `div.flex.flex-col.lg:flex-row.items-start.gap-8.my-4.h-full.mx-auto.p-6.rounded-3xl.border.border-border/50.bg-card.shadow-xl`
- Contains two children: `#generation-form` (left) and the preview `div.flex-1` (right).

### Computed Styles (from `getComputedStyle`)
- `width`: `100%` of content area (max-width: `1440px` on the site)
- `display`: `flex`
- `flexDirection`: `row` on desktop (`lg:flex-row`), `column` on mobile
- `alignItems`: `flex-start`
- `gap`: `32px`
- `padding`: `24px`
- `margin`: `16px 0`
- `backgroundColor`: `rgb(23, 23, 23)` (`bg-card`)
- `borderRadius`: `24px`
- `border`: `1px solid rgba(40, 40, 40, 0.5)` (`border-border/50`)
- `boxShadow`: `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)`
- `color`: `rgb(250, 250, 250)` (`text-foreground`)
- `fontSize`: `16px`, `fontWeight`: `400`, `lineHeight`: `24px`
- `fontFamily`: `ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`

## 2. Left Form (`#generation-form`)

### Selector / DOM
- `div.w-full.lg:w-[450px].xl:w-[500px].flex-shrink-0.flex.flex-col.gap-5.h-fit`

### Computed Styles
- `width`: `500px` on `xl` screens, `450px` on `lg`, `100%` below `lg`
- `display`: `flex`
- `flexDirection`: `column`
- `gap`: `20px`
- `flexShrink`: `0`
- `height`: `fit-content`

## 3. Tab Bar

### Selector / DOM
- `div.flex.w-full.rounded-lg.border.border-border/50.bg-muted/30.p-1`
- Contains three `<button>` tabs.

### Computed Styles (tab bar container)
- `display`: `flex`
- `width`: `100%`
- `padding`: `4px`
- `borderRadius`: `8px`
- `border`: `1px solid rgba(40, 40, 40, 0.5)`
- `backgroundColor`: `rgba(38, 38, 38, 0.3)` (`bg-muted/30`)

### Tab Button Base
- `display`: `flex`
- `flex`: `1` (`flex-1`)
- `justifyContent`: `center`
- `alignItems`: `center`
- `gap`: `6px`
- `padding`: `10px 8px`
- `fontSize`: `12px`
- `fontWeight`: `500`
- `lineHeight`: `16px`
- `borderRadius`: `8px`
- `transition`: `0.15s cubic-bezier(0.4, 0, 0.2, 1)`
- `cursor`: `pointer`
- `whiteSpace`: `nowrap` on `sm` and up (`sm:whitespace-nowrap`)
- Class: `min-w-0 flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-md text-xs font-medium transition-all whitespace-normal sm:whitespace-nowrap`

### Active Tab State
- Classes: `bg-primary text-primary-foreground shadow-sm`
- Computed:
  - `backgroundColor`: `rgb(229, 229, 229)`
  - `color`: `rgb(23, 23, 23)`
  - `boxShadow`: `0 1px 2px 0 rgba(0,0,0,0.05)`

### Inactive Tab Normal State
- Classes: `text-muted-foreground hover:text-foreground hover:bg-muted/50`
- Computed:
  - `backgroundColor`: `transparent`
  - `color`: `rgb(161, 161, 161)` (`text-muted-foreground`)

### Inactive Tab Hover State
- Classes: `text-muted-foreground hover:text-foreground hover:bg-muted/50`
- Computed (when hovered):
  - `backgroundColor`: `rgba(38, 38, 38, 0.5)` (`bg-muted/50`)
  - `color`: `rgb(250, 250, 250)` (`text-foreground`)
- Transition: `0.15s cubic-bezier(0.4, 0, 0.2, 1)`

### Tab Text
- Multi Reference
- Image to Video
- Text to Video

## 4. AI Model Dropdown

### Selector / DOM
- `button` with role `combobox` (or styled `div` acting as combobox)
- Class: `flex items-center justify-between whitespace-nowrap border text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground ...`
- Contains left icon, model name, chip, description, and right chevron.

### Computed Styles
- `width`: `100%` (of form, i.e., 500px on desktop)
- `minHeight`: `56px`
- `padding`: `8px 16px`
- `display`: `flex`
- `justifyContent`: `space-between`
- `alignItems`: `center`
- `borderRadius`: `12px`
- `border`: `1px solid rgba(40, 40, 40, 0.5)`
- `backgroundColor`: `rgba(10, 10, 10, 0.5)`
- `backdropFilter`: `blur(4px)`
- `boxShadow`: `0 1px 2px 0 rgba(0,0,0,0.05)`
- `fontSize`: `14px`
- `fontWeight`: `400`
- `lineHeight`: `20px`
- `color`: `rgb(250, 250, 250)`
- `transition`: `all`
- `cursor`: `pointer`
- `marginTop`: `8px` (it is inside a wrapper with `space-y-2` or similar)

### Inner Content
- Left icon: Seedance 2.0 logo (`public/seedance2-assets/seedance2-icon.png`, 28×28, object-fit `contain`)
- Model name: **Seedance 2.0**
- Chip/badge: **With Audio** (small, likely `bg-muted` or `bg-primary/10`)
- Description: **Multimodal input with powerful reference capabilities**
- Right icon: `ChevronDown` from lucide-react

## 5. Tab-Specific Content

### 5.1 Multi Reference Tab
Sections appear in this order:
1. **Select Virtual Portrait** button/link
   - Text: "Select Virtual Portrait"
2. **Reference Images (max 9)**
   - Counter: `0/9`
   - Upload area: dashed border box, icon `Upload` from lucide-react
   - Text: "Click to upload images" / "png, jpg, jpeg, webp (9 remaining)"
3. **Reference Videos (max 3, total 15s)**
   - Counter: `0/3 | 0.0s/15s`
   - Upload area: dashed border box
   - Text: "Click to upload videos" / "mp4, mov (3 remaining)" / "Max 50MB"
   - Icon: `Video` from lucide-react
4. **Reference Audios (max 3, total 15s)**
   - Counter: `0/3 | 0.0s/15s`
   - Upload area: dashed border box
   - Text: "Click to upload audio" / "mp3, wav (3 remaining)"
   - Icon: `Music` or `Volume2` from lucide-react
5. **Return Last Frame** checkbox/toggle (appears after audio sections)

### 5.2 Image to Video Tab
1. **Select Virtual Portrait** button/link
2. **Images** section
   - Counter: `0/9`
   - Upload area: dashed border box
   - Text: "Click to upload or drag & drop" / "png, jpg, jpeg, webp (9 remaining)"
   - Secondary link: "Generate images with AI"
3. **Add end frame** section (similar upload area)
4. **Return Last Frame** checkbox/toggle

### 5.3 Text to Video Tab
1. **Return Last Frame** checkbox/toggle only
2. Prompt section directly follows

## 6. Upload Area (reusable)

### Selector / DOM
- `div` inside `space-y-2.5` wrapper
- Contains icon, title, and file-type hint.

### Computed Styles (the dashed box itself)
- `width`: `100%` (of form)
- `height`: `184px`
- `padding`: `40px 0`
- `marginTop`: `10px`
- `display`: `flex`
- `flexDirection`: `column`
- `justifyContent`: `center`
- `alignItems`: `center`
- `borderRadius`: `10px`
- `border`: `2px dashed rgba(161, 161, 161, 0.25)`
- `backgroundColor`: `transparent`
- `cursor`: `pointer`
- `transition`: `0.2s cubic-bezier(0.4, 0, 0.2, 1)`
- Hover: `hover:bg-muted/50` (or `hover:border-primary/50`) — implement a subtle muted background hover.

### Inner Content
- Icon: `Upload` (or `Video`, `Music` for video/audio sections), `w-8 h-8` or similar, color `muted-foreground`
- Title: `<p class="text-sm font-medium text-foreground">Click to upload ...</p>`
- Hint: `<p class="text-xs text-muted-foreground">... file types and remaining count ...</p>`
- For Image to Video: additional link "Generate images with AI" with `Sparkles` icon.

### Section Label (above upload area)
- `fontSize`: `14px`, `fontWeight`: `500`, `color`: `rgb(250, 250, 250)`
- Includes counter text `0/9` in `text-muted-foreground`.
- Examples:
  - "Reference Images (max 9) 0/9"
  - "Reference Videos (max 3, total 15s) 0/3 | 0.0s/15s"
  - "Reference Audios (max 3, total 15s) 0/3 | 0.0s/15s"
  - "Images 0/9"
  - "Add end frame"

## 7. Prompt Section

### Selector / DOM
- Wrapper class: `space-y-2 flex-1 flex flex-col min-h-[140px]`
- Contains a label "Prompt", a custom input area, and a character counter.

### Computed Styles (wrapper)
- `width`: `100%`
- `minHeight`: `140px`
- `display`: `flex`
- `flexDirection`: `column`
- `gap`: `8px`

### Prompt Input Area
- Relative container: `relative flex-1`
- `width`: `100%`
- `height`: `150px`
- `marginTop`: `8px`
- Contains:
  - Placeholder `<div>` absolutely positioned at `top: 16px; left: 16px` with text `pointer-events-none select-none text-muted-foreground text-base`
  - Actual editable `<div>` or `<textarea>` with padding, `border`, `borderRadius`, `bg-input/background`, etc.
  - Character counter `0/5000` at bottom-right, `text-xs text-muted-foreground`

### Placeholder Text Per Tab
- **Multi Reference**: "Type @ to reference uploaded materials, e.g. @Image1 as first frame..."
- **Image to Video**: "Prompt" (or empty prompt placeholder)
- **Text to Video**: "Prompt" (or empty prompt placeholder)

### Counter
- Text: `0/5000`
- Position: bottom-right of input area
- `fontSize`: `12px`, `color`: `rgb(161, 161, 161)`

## 8. Settings Panel

### Layout
Horizontal row of button groups with labels above each group.
Labels: **Resolution**, **Duration**, **Aspect Ratio**

### Resolution Buttons
- Options: `480p`, `720p`, `1080p`, `4K`
- Selected state: `bg-primary text-primary-foreground` (light bg, dark text)
- Unselected state: `bg-transparent text-muted-foreground border-border`
- Default selected: `720p` or `1080p` (verify from screenshots)
- Style: small buttons, rounded, border, padding `6px 12px` approx.

### Duration Buttons
- Options: `5s` (and possibly others; verify from screenshots)
- Same selected/unselected styling as resolution.

### Aspect Ratio Buttons
- Options: `Auto`, `16:9`, `9:16`, `4:3`, `3:4`, `21:9`, `1:1`
- Same selected/unselected styling.
- Default selected: `Auto`

### Advanced Button
- Text: "Advanced"
- Class: `flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors`
- Icon: `ChevronDown` or `ChevronRight` depending on expanded state (default collapsed, pointing down)
- Position: right side of the settings row, aligned with the other controls.

## 9. Generate Button

### Selector / DOM
- `button` containing text "Generate" and a `WandSparkles` icon from lucide-react.
- Class: `inline-flex items-center justify-center gap-2 whitespace-nowrap ...`

### Computed Styles
- `width`: `100%` (of form)
- `height`: `56px`
- `padding`: `8px 16px`
- `display`: `inline-flex`
- `justifyContent`: `center`
- `alignItems`: `center`
- `gap`: `8px`
- `borderRadius`: `12px`
- `fontSize`: `16px`
- `fontWeight`: `600`
- `lineHeight`: `24px`
- `color`: `rgb(23, 23, 23)` (`primary-foreground`)
- `background`: `linear-gradient(to right, rgb(229, 229, 229), rgb(147, 51, 234))`
- `boxShadow`: `0 10px 15px -3px rgba(229,229,229,0.2), 0 4px 6px -4px rgba(229,229,229,0.2)`
- `overflow`: `hidden`
- `position`: `relative`
- `transition`: `0.3s cubic-bezier(0.4, 0, 0.2, 1)`

### Disabled State (default, no prompt)
- `opacity`: `0.5`
- `cursor`: `default`
- Class includes `disabled:opacity-50 disabled:pointer-events-none` or similar.

### Enabled State (when form has content)
- `opacity`: `1`
- `cursor`: `pointer`
- Hover: subtle brightness increase or shadow change.

### Icon
- `WandSparkles` from lucide-react, `w-3.5 h-3.5 shrink-0`

## 10. Right Preview Area (`VideoPreview`)

### Selector / DOM
- `div.flex-1.w-full.lg:w-auto.flex.flex-col.gap-4`
- Contains the example video and the guide card.

### Computed Styles
- `width`: `auto` on desktop, `100%` on mobile
- `display`: `flex`
- `flexDirection`: `column`
- `gap`: `16px`
- `flex`: `1`

### Video Player
- Video: `public/seedance2-assets/example-video.mp4`
- Poster: `public/seedance2-assets/example-poster.webp`
- Aspect ratio: `9:16` (portrait) based on video dimensions 720×1280
- Default controls: play/pause, volume, mute, fullscreen, progress bar
- Rounded corners: `rounded-xl` or similar (`borderRadius`: `12px` or `16px`)
- Background: dark

### Multi Reference Guide Card (only shown in Multi Reference tab)
- Title: **Multi Reference Guide**
- Body: "Seedance 2.0 supports text, image, video, and audio as input references. Combine multiple types of materials to guide AI video generation with greater precision and creative control."
- Link: "For a detailed Seedance 2.0 tutorial, check out our Full Guide"
- The link uses `ExternalLink` or `FileText` icon.
- Expanded content (likely in a collapsible or tooltip) includes:
  - **Prompt Guide**
    - "Type @ to quickly insert your uploaded files into the prompt."
    - "Select a file to insert it as a reference (e.g. @Image1, @Video1, @Audio1), so the AI knows exactly which material to use."
  - **Material Limits**
    - "Up to 9 reference images"
    - "Up to 3 reference videos, total duration ≤ 15 seconds"
    - "Up to 3 reference audios, total duration ≤ 15 seconds"
    - "Maximum 12 materials in total across all types"
  - **Supported Input Combinations**
    - "Text + Image"
    - "Text + Video"
    - "Text + Image + Video"
    - "Text + Image + Audio"
    - "Text + Video + Audio"
    - "Text + Image + Video + Audio"
  - **Note**: "Audio cannot be used alone with text — at least one image or video is required."

## 11. States & Behaviors

### Tab Switching
- **Interaction model:** click-driven.
- **Trigger:** click on any of the three tab buttons.
- **Effect:** form content below the tab bar swaps to the corresponding tab's sections; preview area may toggle the guide card.
- **Transition:** content switches instantly (no observed cross-fade). The active tab background/text color changes with `0.15s` transition.

### Button Hover (Generate when enabled)
- Implement a subtle hover effect (e.g., `brightness-110` or slight shadow increase) with `transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1)`.

### Upload Area Hover
- Background changes to `bg-muted/50` on hover with `0.2s` transition.

### Advanced Toggle
- Clicking "Advanced" expands additional settings below the row.
- Chevron icon rotates from down to up (or vice versa).
- Default: collapsed.

### Return Last Frame Toggle
- A checkbox/toggle switch.
- Default: unchecked.

## 12. Assets

Downloaded and placed in `public/seedance2-assets/`:
- `example-video.mp4` — preview video
- `example-poster.webp` — video poster frame
- `seedance2-icon.png` — AI model icon

## 13. Icons (all from lucide-react)

Unique icons observed:
- `WandSparkles` — Generate button
- `Upload` — upload areas
- `Video` — video upload
- `Music` / `Volume2` — audio upload
- `Sparkles` — "Generate images with AI" link
- `ChevronDown` — dropdown chevron
- `ChevronLeft` / `ChevronRight` — carousel/pagination if needed
- `Clock` — duration
- `ExternalLink` / `FileText` — guide link
- `Image` — image-related UI
- `Info` — info tooltips
- `Layers` — model/features
- `Monitor` — display
- `Type` — text
- `UserRound` — virtual portrait

## 14. Responsive Behavior

- **Desktop (≥1024px / `lg`):**
  - Container is a row: form on left (450–500px), preview on right (flex-1).
- **Tablet (768px–1023px):**
  - Container stacks vertically (`flex-col`).
  - Form is full width.
  - Preview is full width below the form.
- **Mobile (<768px):**
  - Same vertical stack.
  - Reduced padding/spacing.
  - Tab text may wrap (`whitespace-normal` on small screens, `sm:whitespace-nowrap`).
  - Settings row may wrap to multiple lines.

## 15. Text Content (verbatim)

### Tabs
- Multi Reference
- Image to Video
- Text to Video

### AI Model Dropdown
- Seedance 2.0
- With Audio
- Multimodal input with powerful reference capabilities

### Multi Reference Tab
- Reference Images (max 9)
- 0/9
- Select Virtual Portrait
- Click to upload images
- png, jpg, jpeg, webp (9 remaining)
- Reference Videos (max 3, total 15s)
- 0/3 | 0.0s/15s
- Click to upload videos
- mp4, mov (3 remaining)
- Max 50MB
- Reference Audios (max 3, total 15s)
- 0/3 | 0.0s/15s
- Click to upload audio
- mp3, wav (3 remaining)
- Return Last Frame
- Prompt
- Type @ to reference uploaded materials, e.g. @Image1 as first frame...
- 0/5000
- Resolution
- 480p
- 720p
- 1080p
- 4K
- Duration
- 5s
- Aspect Ratio
- Auto
- 16:9
- 9:16
- 4:3
- 3:4
- 21:9
- 1:1
- Advanced
- Generate
- Multi Reference Guide
- Seedance 2.0 supports text, image, video, and audio as input references. Combine multiple types of materials to guide AI video generation with greater precision and creative control.
- For a detailed Seedance 2.0 tutorial, check out our
- Full Guide
- Prompt Guide
- Type @ to quickly insert your uploaded files into the prompt.
- Select a file to insert it as a reference (e.g. @Image1, @Video1, @Audio1), so the AI knows exactly which material to use.
- Material Limits
- Up to 9 reference images
- Up to 3 reference videos, total duration ≤ 15 seconds
- Up to 3 reference audios, total duration ≤ 15 seconds
- Maximum 12 materials in total across all types
- Supported Input Combinations
- Text + Image
- Text + Video
- Text + Image + Video
- Text + Image + Audio
- Text + Video + Audio
- Text + Image + Video + Audio
- Note: Audio cannot be used alone with text — at least one image or video is required.

### Image to Video Tab
- Select Virtual Portrait
- Images
- 0/9
- Add end frame
- Click to upload or drag & drop
- png, jpg, jpeg, webp (9 remaining)
- Generate images with AI
- Return Last Frame
- Prompt
- 0/5000
- Resolution
- 480p, 720p, 1080p, 4K
- Duration
- 5s
- Aspect Ratio
- Auto, 16:9, 9:16, 4:3, 3:4, 21:9, 1:1
- Advanced
- Generate

### Text to Video Tab
- Return Last Frame
- Prompt
- 0/5000
- Resolution
- 480p, 720p, 1080p, 4K
- Duration
- 5s
- Aspect Ratio
- Auto, 16:9, 9:16, 4:3, 3:4, 21:9, 1:1
- Advanced
- Generate

## 16. Implementation Notes for Builder

- Create a folder `app/components/video-workspace/`.
- `index.tsx` exports the main `VideoWorkspace` component and wires `GenerationForm` + `VideoPreview`.
- `generation-form.tsx` handles tab state (`useState<'multi-reference' | 'image-to-video' | 'text-to-video'>`) and renders the tab bar, AI model dropdown, tab-specific content, prompt, settings, and generate button.
- `video-preview.tsx` renders the example video and conditionally the Multi Reference Guide card.
- `settings-panel.tsx` renders Resolution / Duration / Aspect Ratio button groups and the Advanced toggle.
- `upload-area.tsx` is a reusable dashed-border upload box used by all three tabs.
- Use `cn()` from `~/lib/utils` (or wherever the project keeps it) for conditional classes.
- Use existing shadcn Button, Select, Checkbox, etc., if they exist in `app/components/ui/`; otherwise build custom styled buttons with Tailwind.
- Do **not** implement real upload logic; use mock handlers and empty state counters.
- The generate button should be disabled by default (opacity 0.5, cursor default) and visually match the gradient.
- Keep the component self-contained and demo-ready with the provided mock data.
- Verify `npx tsc --noEmit` passes before finishing.
