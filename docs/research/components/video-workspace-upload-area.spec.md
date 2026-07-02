# UploadArea Specification

## Overview
- **Target file:** `app/components/video-workspace/upload-area.tsx`
- **Screenshot:** `docs/design-references/seedance2.ai/page-multi-reference.png` (dashed upload boxes)
- **Interaction model:** static (visual only, no real upload logic)

## Component API
```ts
interface UploadAreaProps {
  icon: React.ReactNode;
  title: string;
  hint: string;
  secondaryAction?: {
    label: string;
    icon: React.ReactNode;
  };
  onClick?: () => void;
}
```

## DOM Structure
```
<UploadArea>
  <div className="dashed-box">
    {icon}
    <p className="title">{title}</p>
    <p className="hint">{hint}</p>
    {secondaryAction && (
      <button className="secondary-action">
        {secondaryAction.icon}
        {secondaryAction.label}
      </button>
    )}
  </div>
</UploadArea>
```

## Computed Styles (from `getComputedStyle`)

### Dashed Box Container
- `display`: `flex`
- `flexDirection`: `column`
- `justifyContent`: `center`
- `alignItems`: `center`
- `width`: `100%`
- `height`: `184px`
- `padding`: `40px 0px`
- `marginTop`: `10px`
- `borderRadius`: `10px`
- `border`: `2px dashed rgba(161, 161, 161, 0.25)`
- `backgroundColor`: `transparent`
- `cursor`: `pointer`
- `transition`: `0.2s cubic-bezier(0.4, 0, 0.2, 1)`

### Hover State
- `backgroundColor`: `rgba(38, 38, 38, 0.5)` (`bg-muted/50`)
- `border-color`: keep dashed, maybe slightly more opaque
- Transition: `0.2s cubic-bezier(0.4, 0, 0.2, 1)`

### Title Text
- `fontSize`: `14px`
- `fontWeight`: `500`
- `lineHeight`: `20px`
- `color`: `rgb(250, 250, 250)` (`text-foreground`)
- Class: `text-sm font-medium text-foreground`

### Hint Text
- `fontSize`: `12px`
- `fontWeight`: `400`
- `lineHeight`: `16px`
- `color`: `rgb(161, 161, 161)` (`text-muted-foreground`)
- Class: `text-xs text-muted-foreground`

### Icon
- Use any `lucide-react` icon passed in.
- Size: approximately `w-8 h-8` (32px)
- Color: `text-muted-foreground`
- Margin bottom: `12px` (approx)

### Secondary Action (only in Image to Video)
- Text: "Generate images with AI"
- Icon: `Sparkles` from lucide-react
- `fontSize`: `12px`
- `color`: `rgb(250, 250, 250)` or `text-muted-foreground` with hover to `text-foreground`
- Style: small inline link/button with icon gap

## Text Content (verbatim)
- Title examples:
  - "Click to upload images"
  - "Click to upload videos"
  - "Click to upload audio"
  - "Click to upload or drag & drop"
- Hint examples:
  - "png, jpg, jpeg, webp (9 remaining)"
  - "mp4, mov (3 remaining)"
  - "Max 50MB"
  - "mp3, wav (3 remaining)"
- Secondary action: "Generate images with AI"

## Assets
- Icons from `lucide-react`: `Upload`, `Video`, `Music`, `Sparkles`

## Responsive Behavior
- Width is always 100% of the parent form.
- Height remains 184px on desktop and tablet; on mobile may reduce to 160px.

## Implementation Notes
- Use `cn()` for class merging.
- Use Tailwind CSS v4 classes: `border-2 border-dashed border-border/25 rounded-[10px]`, `hover:bg-muted/50`, etc.
- No real file input or upload logic is required; just the visual UI.
- Verify `npx tsc --noEmit` passes.
