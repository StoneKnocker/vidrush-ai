# VideoWorkspace Index Specification

## Overview
- **Target file:** `app/components/video-workspace/index.tsx`
- **Screenshot:** `docs/design-references/seedance2.ai/page-multi-reference.png`
- **Interaction model:** click-driven tabs inside the form; this component is the layout wrapper

## Component API
```ts
interface VideoWorkspaceProps {
  // No props needed for the demo clone; all data is internal/mock.
}
```

## DOM Structure
```
<VideoWorkspace>
  <div className="workspace-container">
    <GenerationForm />
    <VideoPreview />
  </div>
</VideoWorkspace>
```

## Computed Styles (from `getComputedStyle`)

### Workspace Container
- `tag`: `div`
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
- `fontSize`: `16px`
- `fontWeight`: `400`
- `lineHeight`: `24px`
- `maxWidth`: `1440px` (or full width of parent)

## Children

### Left: GenerationForm
- File: `app/components/video-workspace/generation-form.tsx`
- Width: `100%` mobile, `450px` tablet/desktop `lg`, `500px` on `xl`.
- Contains tabs, AI model dropdown, tab-specific content, prompt, settings, generate button.
- It manages the active tab state internally.

### Right: VideoPreview
- File: `app/components/video-workspace/video-preview.tsx`
- Width: `flex-1`, fills remaining width on desktop; full width on mobile.
- Receives `showGuide` prop based on active tab: `true` only when Multi Reference is active.

## State Management
- The active tab state lives inside `GenerationForm`.
- `VideoPreview` needs to know whether to show the guide card.
- Options:
  1. Keep `activeTab` in `VideoWorkspace` and pass it to both children.
  2. Keep `activeTab` in `GenerationForm` and let `VideoWorkspace` show the guide based on it (e.g., via state lifted to `VideoWorkspace`).
- Recommended: lift `activeTab` state to `VideoWorkspace` so both children can receive it. `GenerationForm` receives `activeTab` and `onTabChange` props; `VideoPreview` receives `showGuide={activeTab === 'multi-reference'}`.

## Responsive Behavior
- **Desktop (≥1024px):** container is a row, form on left (fixed width), preview on right (flex-1).
- **Tablet (768px–1023px):** container stacks vertically (`flex-col`), form full width, preview full width below.
- **Mobile (<768px):** same vertical stack, smaller padding/gaps, tabs may wrap.

## Classes to Use
```
flex flex-col lg:flex-row items-start gap-8 my-4 h-full mx-auto p-6 rounded-3xl border border-border/50 bg-card shadow-xl
```

## Implementation Notes
- Import `GenerationForm` from `./generation-form`.
- Import `VideoPreview` from `./video-preview`.
- Import `cn` from `~/lib/utils` if class merging is needed.
- Use `useState` for active tab: `const [activeTab, setActiveTab] = useState('multi-reference')`.
- The component should be self-contained and render correctly without external props.
- Verify `npx tsc --noEmit` and `pnpm build` pass after this component is created.

## Assets
- None directly in this file; assets are referenced by sub-components.

## Completion Checklist
- [ ] `app/components/video-workspace/index.tsx` created
- [ ] `app/components/video-workspace/generation-form.tsx` exists and is imported
- [ ] `app/components/video-workspace/video-preview.tsx` exists and is imported
- [ ] Active tab state is lifted and shared with `VideoPreview`
- [ ] `npx tsc --noEmit` passes
- [ ] `pnpm build` passes (or at least the component compiles)
