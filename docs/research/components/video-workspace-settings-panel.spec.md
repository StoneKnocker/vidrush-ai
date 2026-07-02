# SettingsPanel Specification

## Overview
- **Target file:** `app/components/video-workspace/settings-panel.tsx`
- **Screenshot:** `docs/design-references/seedance2.ai/page-multi-reference.png` (Resolution / Duration / Aspect Ratio row)
- **Interaction model:** click-driven option selection + collapsible Advanced toggle

## Component API
```ts
interface SettingsPanelProps {
  resolution: "480p" | "720p" | "1080p" | "4K";
  onResolutionChange: (val: string) => void;
  duration: string; // e.g. "5s"
  onDurationChange: (val: string) => void;
  aspectRatio: string;
  onAspectRatioChange: (val: string) => void;
  advancedOpen: boolean;
  onAdvancedToggle: () => void;
}
```

## DOM Structure
```
<SettingsPanel>
  <div className="settings-row">
    <OptionGroup label="Resolution" options={["480p","720p","1080p","4K"]} value={...} onChange={...} />
    <OptionGroup label="Duration" options={["5s"]} value={...} onChange={...} />
    <OptionGroup label="Aspect Ratio" options={["Auto","16:9","9:16","4:3","3:4","21:9","1:1"]} value={...} onChange={...} />
    <button className="advanced-toggle">Advanced <ChevronDown /></button>
  </div>
  {advancedOpen && <div className="advanced-content">...</div>}
</SettingsPanel>
```

## Computed Styles (from `getComputedStyle`)

### Settings Row Container
- `display`: `flex`
- `flexDirection`: `row`
- `justifyContent`: `space-between` (or `flex-start` with gap)
- `alignItems`: `center`
- `gap`: `16px`
- `width`: `100%`
- `marginTop`: `8px` (inside the form's gap)
- Wraps on mobile.

### Option Group Label
- `fontSize`: `12px`
- `fontWeight`: `500`
- `lineHeight`: `16px`
- `color`: `rgb(161, 161, 161)` (`text-muted-foreground`)
- `marginBottom`: `8px` (approx)
- Class: `text-xs font-medium text-muted-foreground`

### Option Button Base
- `display`: `inline-flex`
- `padding`: `6px 12px` (approx)
- `fontSize`: `12px`
- `fontWeight`: `500`
- `lineHeight`: `16px`
- `borderRadius`: `6px` (approx)
- `border`: `1px solid rgba(40, 40, 40, 0.5)` (`border-border`)
- `transition`: `0.15s cubic-bezier(0.4, 0, 0.2, 1)`

### Option Button Selected
- `backgroundColor`: `rgb(229, 229, 229)` (`bg-primary`)
- `color`: `rgb(23, 23, 23)` (`text-primary-foreground`)
- `borderColor`: transparent or `border-primary`

### Option Button Unselected
- `backgroundColor`: `transparent`
- `color`: `rgb(161, 161, 161)` (`text-muted-foreground`)
- `borderColor`: `rgba(40, 40, 40, 0.5)`

### Advanced Toggle
- Text: "Advanced"
- Class: `flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors`
- `fontSize`: `12px`
- `fontWeight`: `500`
- `color`: `rgb(161, 161, 161)` normal, `rgb(250, 250, 250)` on hover
- `transition`: `color 0.15s ease, background-color 0.15s ease, ...`
- `cursor`: `pointer`
- Icon: `ChevronDown` from lucide-react, rotates to `ChevronUp` when expanded

## Text Content (verbatim)
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

## Assets
- Icons from `lucide-react`: `ChevronDown`, `ChevronUp`

## Responsive Behavior
- Desktop: row layout with all groups side by side.
- Tablet/Mobile: row wraps, groups stay in a row but may wrap if needed.
- Mobile: Advanced button may move to its own line.

## Implementation Notes
- Use `cn()` for conditional selected/unselected classes.
- Use existing shadcn Button if available; otherwise custom buttons.
- The Advanced section content is optional mock content for this clone (e.g., a few placeholder sliders/switches).
- Verify `npx tsc --noEmit` passes.
