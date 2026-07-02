# VideoPreview Specification

## Overview
- **Target file:** `app/components/video-workspace/video-preview.tsx`
- **Screenshot:** `docs/design-references/seedance2.ai/page-multi-reference.png` (right column)
- **Interaction model:** static (video player + conditional guide card)

## Component API
```ts
interface VideoPreviewProps {
  showGuide?: boolean; // true only for Multi Reference tab
}
```

## DOM Structure
```
<VideoPreview>
  <div className="video-container">
    <video poster="..." controls>
      <source src="..." type="video/mp4" />
    </video>
  </div>
  {showGuide && (
    <div className="guide-card">
      <h3>Multi Reference Guide</h3>
      <p>...</p>
      <a href="#">Full Guide <ExternalLink /></a>
      <div className="guide-details">...</div>
    </div>
  )}
</VideoPreview>
```

## Computed Styles (from `getComputedStyle`)

### Preview Container
- `display`: `flex`
- `flexDirection`: `column`
- `gap`: `16px`
- `width`: `auto` on desktop (`lg:w-auto`), `100%` on mobile
- `flex`: `1`

### Video Container
- `display`: `block` or `flex`
- `width`: `100%`
- `borderRadius`: `12px` or `16px`
- `overflow`: `hidden`
- `backgroundColor`: `rgb(0, 0, 0)` or dark
- `aspectRatio`: `9/16` (portrait, because video is 720×1280)

### Video Element
- `width`: `100%`
- `height`: `100%`
- `objectFit`: `cover` or `contain`
- `poster`: `public/seedance2-assets/example-poster.webp`
- Native controls visible.

### Guide Card
- `backgroundColor`: `rgb(23, 23, 23)` or `bg-card`
- `borderRadius`: `12px` or `16px`
- `border`: `1px solid rgba(40, 40, 40, 0.5)`
- `padding`: `16px`–`24px`
- `display`: `flex`
- `flexDirection`: `column`
- `gap`: `12px`

### Guide Title
- Text: "Multi Reference Guide"
- `fontSize`: `16px` or `18px`
- `fontWeight`: `600`
- `color`: `rgb(250, 250, 250)`

### Guide Body
- Text: "Seedance 2.0 supports text, image, video, and audio as input references. Combine multiple types of materials to guide AI video generation with greater precision and creative control."
- `fontSize`: `14px`
- `color`: `rgb(161, 161, 161)` or `rgb(250,250,250)`
- `lineHeight`: `20px` or `24px`

### Full Guide Link
- Text: "For a detailed Seedance 2.0 tutorial, check out our Full Guide"
- `fontSize`: `14px`
- `color`: `rgb(250, 250, 250)` or `text-primary`
- Icon: `ExternalLink` from lucide-react, `w-4 h-4`

### Guide Details (collapsible or expanded by default in the original)
Sections and text:
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

## Text Content (verbatim)
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

## Assets
- `public/seedance2-assets/example-video.mp4`
- `public/seedance2-assets/example-poster.webp`
- Icons from `lucide-react`: `ExternalLink`, `FileText`, `Info`

## Responsive Behavior
- Desktop: preview is the right column, flex-1, next to the form.
- Tablet/Mobile: preview stacks below the form, full width.
- Video keeps 9:16 portrait aspect ratio on all sizes; may become smaller on narrow screens.

## Implementation Notes
- Use a native `<video>` element with `controls` and `poster`.
- The guide card only appears when `showGuide={true}` (Multi Reference tab).
- Use `cn()` for class merging.
- Verify `npx tsc --noEmit` passes.
