# Project context

## Related repos

- **story-editor**: `/Users/kevingraff/WebstormProjects/story-editor` — local web app (React + ReactFlow) to visualize and edit story branches. Contains story design resources (briefs, templates, schemas).

## Code style rules

### Design System (DS)

- All reusable UI components live in `src/components/` organized by category:
  - `layout/` — screen structure, containers, backgrounds (ScreenContainer, ContentContainer, BackgroundArt, TiledBackground)
  - `display/` — content presentation, text, decorations (Typography, FramedTitle, AnimatedBarFill)
  - `input/` — user interactions (TexturedButton, CodeInput, PillButton)
- `src/components/index.ts` is the barrel — all consumers import from `@/components`
- All components use `export default`
- Feature-specific / domain components go in `src/features/`, NOT in `src/components/`

### Styling

- No `StyleSheet.create` — inline styles directly where used
- No hardcoded colors — every color must exist in `src/constants/colors.ts` and be referenced as `colors.xxx`
- Style config objects (like tone styles) go in `src/constants/`, not in component files
- Use `Typography` instead of `Text`, and DS button components (TexturedButton, PillButton) instead of raw `Pressable`

### Exports & imports

- Components: `export default`
- Import from `@/components` barrel, not from individual files (except internal cross-references within components/)
- Respect Biome linting: `import type` for type-only imports, sorted imports/exports

### General

- Reusable layout logic (responsive calculations, etc.) goes in `src/utils/` as custom hooks
- Keep feature files thin: they should compose DS components, not redefine UI primitives
