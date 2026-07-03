# GenerationForm Specification

## Overview
- **Target file:** `app/components/video-workspace/generation-form.tsx`
- **Screenshot:** `docs/design-references/seedance2.ai/page-multi-reference.png` (left column)
- **Interaction model:** click-driven tabs; tab-specific content swaps below the tab bar

## Component API
```ts
interface GenerationFormProps {
  activeTab: "multi-reference" | "image-to-video" | "text-to-video";
}
```

## DOM Structure
```
<GenerationForm>
  <div className="tab-bar">
    <button className="active-tab">Multi Reference</button>
    <button className="inactive-tab">Image to Video</button>
    <button className="inactive-tab">Text to Video</button>
  </div>
  <div className="ai-model-dropdown">
    <img src="seedance2-icon.png" />
    <div>
      <span>Seedance 2.0</span>
      <span className="badge">With Audio</span>
      <p>Multimodal input with powerful reference capabilities</p>
    </div>
    <ChevronDown />
  </div>
  <div className="tab-content">
    <!-- Multi Reference content -->
    <!-- Image to Video content -->
    <!-- Text to Video content -->
  </div>
  <div className="prompt-section">
    <label>Prompt</label>
    <div className="prompt-input">
      <div className="placeholder">Type @ to reference uploaded materials...</div>
      <div className="editable" contentEditable></div>
      <span className="counter">0/5000</span>
    </div>
  </div>
  <SettingsPanel ... />
  <button className="generate-btn" disabled>
    <WandSparkles /> Generate
  </button>
</GenerationForm>
```

## Computed Styles (from `getComputedStyle`)

### Form Container
- `width`: `100%` (lg: 450px, xl: 500px)
- `display`: `flex`
- `flexDirection`: `column`
- `gap`: `20px`
- `flexShrink`: `0`
- `height`: `fit-content`

### Tab Bar
- `display`: `flex`
- `width`: `100%`
- `padding`: `4px`
- `borderRadius`: `8px`
- `border`: `1px solid rgba(40, 40, 40, 0.5)`
- `backgroundColor`: `rgba(38, 38, 38, 0.3)`

### Tab Button Base
- `flex`: `1`
- `justifyContent`: `center`
- `alignItems`: `center`
- `gap`: `6px`
- `padding`: `10px 8px`
- `fontSize`: `12px`
- `fontWeight`: `500`
- `lineHeight`: `16px`
- `borderRadius`: `8px`
- `transition`: `0.15s cubic-bezier(0.4, 0, 0.2, 1)`

### Active Tab
- `backgroundColor`: `rgb(229, 229, 229)`
- `color`: `rgb(23, 23, 23)`
- `boxShadow`: `0 1px 2px 0 rgba(0,0,0,0.05)`
- Classes: `bg-primary text-primary-foreground shadow-sm`

### Inactive Tab Normal
- `backgroundColor`: `transparent`
- `color`: `rgb(161, 161, 161)`
- Classes: `text-muted-foreground`

### Inactive Tab Hover
- `backgroundColor`: `rgba(38, 38, 38, 0.5)`
- `color`: `rgb(250, 250, 250)`
- Classes: `text-muted-foreground hover:text-foreground hover:bg-muted/50`

### AI Model Dropdown
- `width`: `100%`
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
- `color`: `rgb(250, 250, 250)`
- `cursor`: `pointer`
- `marginTop`: `8px`

### AI Model Left Content
- Icon: `public/seedance2-assets/seedance2-icon.png`, 28×28, `object-fit: contain`
- Model name: "Seedance 2.0", font-weight 500, color foreground
- Badge: "With Audio", small rounded badge (likely `bg-muted` or `bg-primary/10`, `text-xs`)
- Description: "Multimodal input with powerful reference capabilities", `text-xs text-muted-foreground`
- Right icon: `ChevronDown` from lucide-react

### Tab Content Sections

#### Multi Reference Sections
1. **Select Virtual Portrait** button
   - Text: "Select Virtual Portrait"
   - Class: `text-sm font-medium text-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors`
2. **Reference Images (max 9)**
   - Label: `text-sm font-medium text-foreground`
   - Counter: `0/9` in `text-muted-foreground`
   - Uses `<UploadArea icon={<Upload />} title="Click to upload images" hint="png, jpg, jpeg, webp (9 remaining)" />`
3. **Reference Videos (max 3, total 15s)**
   - Label: "Reference Videos (max 3, total 15s)"
   - Counter: `0/3 | 0.0s/15s`
   - Uses `<UploadArea icon={<Video />} title="Click to upload videos" hint="mp4, mov (3 remaining)" />`
   - Extra hint below: "Max 50MB"
4. **Reference Audios (max 3, total 15s)**
   - Label: "Reference Audios (max 3, total 15s)"
   - Counter: `0/3 | 0.0s/15s`
   - Uses `<UploadArea icon={<Music />} title="Click to upload audio" hint="mp3, wav (3 remaining)" />`
5. **Return Last Frame** toggle
   - Text: "Return Last Frame"
   - Use shadcn Checkbox or custom toggle.

#### Image to Video Sections
1. **Select Virtual Portrait** button
2. **Images**
   - Label: "Images" + counter `0/9`
   - Uses `<UploadArea icon={<Upload />} title="Click to upload or drag & drop" hint="png, jpg, jpeg, webp (9 remaining)" secondaryAction={{ label: "Generate images with AI", icon: <Sparkles /> }} />`
3. **Add end frame**
   - Label: "Add end frame"
   - Uses `<UploadArea icon={<Upload />} title="Click to upload or drag & drop" hint="png, jpg, jpeg, webp (remaining)" />`
4. **Return Last Frame** toggle

#### Text to Video Sections
1. **Return Last Frame** toggle

### Prompt Section Wrapper
- Class: `space-y-2 flex-1 flex flex-col min-h-[140px]`
- `width`: `100%`
- `minHeight`: `140px`
- `display`: `flex`
- `flexDirection`: `column`
- `gap`: `8px`

### Prompt Label
- Text: "Prompt"
- `fontSize`: `14px`
- `fontWeight`: `500`
- `color`: `rgb(250, 250, 250)`

### Prompt Input Area
- Container: `relative flex-1`
- `width`: `100%`
- `height`: `150px`
- `marginTop`: `8px`
- `borderRadius`: `12px`
- `border`: `1px solid rgba(40, 40, 40, 0.5)`
- `backgroundColor`: `rgba(10, 10, 10, 0.5)` or `bg-input`
- Contains absolutely positioned placeholder and editable content.

### Prompt Placeholder
- `position`: `absolute`
- `top`: `16px`
- `left`: `16px`
- `fontSize`: `16px`
- `color`: `rgb(161, 161, 161)`
- `pointerEvents`: `none`
- `select`: `none`
- Text per tab:
  - Multi Reference: "Type @ to reference uploaded materials, e.g. @Image1 as first frame..."
  - Image to Video: "Prompt" (or empty)
  - Text to Video: "Prompt" (or empty)

### Prompt Counter
- `position`: `absolute`
- `bottom`: `12px`
- `right`: `12px`
- Text: `0/5000`
- `fontSize`: `12px`
- `color`: `rgb(161, 161, 161)`

### Generate Button
- `width`: `100%`
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
- `color`: `rgb(23, 23, 23)`
- `background`: `linear-gradient(to right, rgb(229, 229, 229), rgb(147, 51, 234))`
- `boxShadow`: `0 10px 15px -3px rgba(229,229,229,0.2), 0 4px 6px -4px rgba(229,229,229,0.2)`
- `overflow`: `hidden`
- `position`: `relative`
- `transition`: `0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- Disabled state: `opacity: 0.5`, `cursor: default`
- Icon: `WandSparkles` from lucide-react, `w-3.5 h-3.5 shrink-0`

## States & Behaviors

### Tab Switching
- Clicking a tab sets it as active.
- Content below the tab bar updates immediately.
- Active/inactive styles transition with `0.15s` ease.

### Prompt Input
- Visual only: placeholder and counter are static; no real typing logic needed.
- Use a `<div contentEditable>` or `<textarea>` for the input area.

### Generate Button
- Disabled by default (opacity 0.5, cursor default).
- Hover (when enabled): subtle brightness increase.

## Text Content (verbatim)
- Tabs: Multi Reference, Image to Video, Text to Video
- AI Model: Seedance 2.0, With Audio, Multimodal input with powerful reference capabilities
- Multi Reference labels and counters:
  - Select Virtual Portrait
  - Reference Images (max 9) 0/9
  - Reference Videos (max 3, total 15s) 0/3 | 0.0s/15s
  - Reference Audios (max 3, total 15s) 0/3 | 0.0s/15s
  - Return Last Frame
- Image to Video labels and counters:
  - Select Virtual Portrait
  - Images 0/9
  - Add end frame
  - Generate images with AI
  - Return Last Frame
- Text to Video labels:
  - Return Last Frame
- Prompt placeholder: "Type @ to reference uploaded materials, e.g. @Image1 as first frame..."
- Generate button: Generate

## Assets
- `public/seedance2-assets/seedance2-icon.png` (AI model icon)
- Icons from `lucide-react`: `ChevronDown`, `Upload`, `Video`, `Music`, `Sparkles`, `WandSparkles`

## Dependencies
- Import `<UploadArea>` from `./upload-area`
- Import `<SettingsPanel>` from `./settings-panel`
- Import `cn` from `~/lib/utils`
- Use existing shadcn Checkbox for Return Last Frame if available.

## Implementation Notes
- Keep tab state internal with `useState`.
- The content switch should be instant.
- Make sure the form is visually identical to the reference screenshots.
- Verify `npx tsc --noEmit` passes.
