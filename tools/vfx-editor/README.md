# VFX Editor

Standalone local browser tool for authoring VFX JSON for the in-game runtime.

## Open It

From the repo root:

```bash
python3 -m http.server 4174
```

Then open:

```text
http://127.0.0.1:4174/tools/vfx-editor/
```

Important:

- Serve the **repo root**, not `tools/vfx-editor`, so the quick-load buttons can read the existing effect files from `src/features/vfx/assets/effects/`.
- For direct "Save Back to File", use a Chromium-based browser like Chrome, Arc, or Edge. Safari/Firefox will still work for preview and download.

## Workflow

1. Click `Quick Load` to inspect an existing effect, or `Open Effect JSON` to load one from disk.
2. Drag the `Spawn` and `Target` anchors in the preview stage.
3. Edit layer properties and `over lifetime` values from the right panel.
4. Toggle between `Keyframe List` and `Bezier Curve` mode for each track.
5. In `Bezier Curve` mode, drag anchors and weighted tangents; the editor bakes that curve back into linear runtime keys on export.
6. Scrub the timeline to inspect the full effect lifetime.
7. Use `Save Back to File` or `Download JSON`.

## Notes

- The editor is standalone and does not affect the app bundle unless you intentionally wire it into the app.
- The output format matches the current runtime JSON shape used by the VFX module.
