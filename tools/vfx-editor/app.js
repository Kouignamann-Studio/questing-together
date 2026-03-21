const STAGE = { width: 720, height: 420 };

const DEMO_EFFECTS = {
  'fireball-travel': '../../src/features/vfx/assets/effects/fireball-travel.json',
  'fireball-impact': '../../src/features/vfx/assets/effects/fireball-impact.json',
  'frostbolt-travel': '../../src/features/vfx/assets/effects/frostbolt-travel.json',
  'frostbolt-impact': '../../src/features/vfx/assets/effects/frostbolt-impact.json',
};

const TRACK_LABELS = {
  scale: 'Scale over lifetime',
  alpha: 'Opacity over lifetime',
  glow: 'Glow over lifetime',
  x: 'Offset X over lifetime',
  y: 'Offset Y over lifetime',
  travel: 'Travel over lifetime',
};

const TRACKS_BY_LAYER_TYPE = {
  orb: ['scale', 'alpha', 'glow', 'x', 'y'],
  ring: ['scale', 'alpha', 'x', 'y'],
  trail: ['scale', 'alpha', 'x', 'y'],
};

const PREVIEW_BACKDROPS = {
  ember: {
    label: 'Ember Cavern',
    top: '#1c1214',
    bottom: '#0d0b10',
    glow: '#df945c',
    grid: 'rgba(255, 227, 187, 0.08)',
    ground: 'rgba(255, 235, 211, 0.08)',
  },
  frost: {
    label: 'Frozen Hall',
    top: '#0f1822',
    bottom: '#091017',
    glow: '#8fd7ff',
    grid: 'rgba(207, 238, 255, 0.09)',
    ground: 'rgba(201, 240, 255, 0.08)',
  },
  arcane: {
    label: 'Arcane Chamber',
    top: '#1a1630',
    bottom: '#0f0d1b',
    glow: '#9e8bff',
    grid: 'rgba(228, 217, 255, 0.08)',
    ground: 'rgba(219, 204, 255, 0.07)',
  },
  poison: {
    label: 'Poison Bog',
    top: '#132116',
    bottom: '#0d140d',
    glow: '#7ad96b',
    grid: 'rgba(215, 255, 196, 0.08)',
    ground: 'rgba(222, 255, 203, 0.07)',
  },
  void: {
    label: 'Void Rift',
    top: '#141018',
    bottom: '#040407',
    glow: '#ff6fb2',
    grid: 'rgba(255, 223, 241, 0.08)',
    ground: 'rgba(255, 221, 240, 0.06)',
  },
  custom: {
    label: 'Custom',
    top: '#181017',
    bottom: '#0e0b10',
    glow: '#df945c',
    grid: 'rgba(255,255,255,0.08)',
    ground: 'rgba(255,255,255,0.04)',
  },
};

const CURVE_PRESETS = {
  linear: { label: 'Linear', x1: 0.333, y1: 0.333, x2: 0.667, y2: 0.667 },
  easeInQuad: { label: 'Ease In Quad', x1: 0.55, y1: 0.085, x2: 0.68, y2: 0.53 },
  easeOutQuad: { label: 'Ease Out Quad', x1: 0.25, y1: 0.46, x2: 0.45, y2: 0.94 },
  easeInOutQuad: { label: 'Ease In Out Quad', x1: 0.455, y1: 0.03, x2: 0.515, y2: 0.955 },
  easeInCubic: { label: 'Ease In Cubic', x1: 0.55, y1: 0.055, x2: 0.675, y2: 0.19 },
  easeOutCubic: { label: 'Ease Out Cubic', x1: 0.215, y1: 0.61, x2: 0.355, y2: 1 },
  easeInOutCubic: { label: 'Ease In Out Cubic', x1: 0.645, y1: 0.045, x2: 0.355, y2: 1 },
  easeInQuart: { label: 'Ease In Quart', x1: 0.895, y1: 0.03, x2: 0.685, y2: 0.22 },
  easeOutQuart: { label: 'Ease Out Quart', x1: 0.165, y1: 0.84, x2: 0.44, y2: 1 },
  easeInOutSine: { label: 'Ease In Out Sine', x1: 0.445, y1: 0.05, x2: 0.55, y2: 0.95 },
};

const CURVE_EDITOR = {
  width: 320,
  height: 190,
  padX: 22,
  padY: 18,
  bakeSamplesPerSegment: 16,
};

const ui = {
  assetPanel: document.getElementById('assetPanel'),
  layersPanel: document.getElementById('layersPanel'),
  layerInspectorPanel: document.getElementById('layerInspectorPanel'),
  stageSvg: document.getElementById('stageSvg'),
  effectTitleLabel: document.getElementById('effectTitleLabel'),
  fileStatusLabel: document.getElementById('fileStatusLabel'),
  saveStatusLabel: document.getElementById('saveStatusLabel'),
  progressPercentLabel: document.getElementById('progressPercentLabel'),
  progressTimeLabel: document.getElementById('progressTimeLabel'),
  progressSlider: document.getElementById('progressSlider'),
  jsonEditor: document.getElementById('jsonEditor'),
  jsonStatusLabel: document.getElementById('jsonStatusLabel'),
  openFileButton: document.getElementById('openFileButton'),
  saveFileButton: document.getElementById('saveFileButton'),
  downloadFileButton: document.getElementById('downloadFileButton'),
  copyJsonButton: document.getElementById('copyJsonButton'),
  jsonCollapseButton: document.getElementById('jsonCollapseButton'),
  togglePlaybackButton: document.getElementById('togglePlaybackButton'),
  restartPlaybackButton: document.getElementById('restartPlaybackButton'),
  resetTemplateButton: document.getElementById('resetTemplateButton'),
  applyJsonButton: document.getElementById('applyJsonButton'),
  fallbackFileInput: document.getElementById('fallbackFileInput'),
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function stringifyAsset(asset) {
  return `${JSON.stringify(asset, null, 2)}\n`;
}

function parseColorToRgba(color) {
  if (typeof color !== 'string') return null;

  const value = color.trim();
  if (!value) return null;

  if (value.startsWith('#')) {
    const hex = value.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      const expanded = hex
        .split('')
        .map((part) => part + part)
        .join('');
      const red = Number.parseInt(expanded.slice(0, 2), 16);
      const green = Number.parseInt(expanded.slice(2, 4), 16);
      const blue = Number.parseInt(expanded.slice(4, 6), 16);
      const alpha =
        expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1;
      return { red, green, blue, alpha };
    }

    if (hex.length === 6 || hex.length === 8) {
      const red = Number.parseInt(hex.slice(0, 2), 16);
      const green = Number.parseInt(hex.slice(2, 4), 16);
      const blue = Number.parseInt(hex.slice(4, 6), 16);
      const alpha = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;
      return { red, green, blue, alpha };
    }
  }

  const rgbMatch = value.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i,
  );

  if (rgbMatch) {
    return {
      red: clamp(Number(rgbMatch[1]), 0, 255),
      green: clamp(Number(rgbMatch[2]), 0, 255),
      blue: clamp(Number(rgbMatch[3]), 0, 255),
      alpha: rgbMatch[4] == null ? 1 : clamp(Number(rgbMatch[4]), 0, 1),
    };
  }

  return null;
}

function rgbaToHex({ red, green, blue }) {
  const toHex = (channel) => Math.round(channel).toString(16).padStart(2, '0');
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function getColorInputValue(color, fallback = '#ffffff') {
  const parsed = parseColorToRgba(color);
  return parsed ? rgbaToHex(parsed) : fallback;
}

function mergePickedHexWithSource(sourceColor, pickedHex) {
  const parsedSource = parseColorToRgba(sourceColor);
  const parsedPicked = parseColorToRgba(pickedHex);
  if (!parsedPicked) return sourceColor;

  if (parsedSource && parsedSource.alpha < 1) {
    return `rgba(${Math.round(parsedPicked.red)}, ${Math.round(parsedPicked.green)}, ${Math.round(parsedPicked.blue)}, ${Number(parsedSource.alpha.toFixed(3))})`;
  }

  return pickedHex;
}

function renderColorField({ label, value, field, datasetName, fallback = '#ffffff' }) {
  return `
    <label class="field">
      <span class="field-label">${escapeHtml(label)}</span>
      <div class="color-input-row">
        <span class="swatch" style="background: ${escapeHtml(value || fallback)};"></span>
        <input
          class="field-color"
          type="color"
          value="${escapeHtml(getColorInputValue(value, fallback))}"
          data-${datasetName}="${field}"
          data-color-picker="true"
        />
        <input
          class="field-input"
          type="text"
          value="${escapeHtml(value ?? '')}"
          data-${datasetName}="${field}"
        />
      </div>
      <span class="section-note">Accepts CSS color strings like <code>#ff8844</code>, <code>#ff8844cc</code>, <code>rgb(...)</code>, or <code>rgba(...)</code>.</span>
    </label>
  `;
}

function createStarterAsset() {
  return {
    id: 'fireball-travel',
    label: 'Fireball Travel',
    durationMs: 320,
    motion: {
      mode: 'line',
      tracks: {
        travel: [
          { at: 0, value: 0 },
          { at: 0.72, value: 0.78 },
          { at: 1, value: 1 },
        ],
      },
    },
    layers: [
      {
        id: 'trail',
        type: 'trail',
        radius: 14,
        segments: 8,
        spacing: 0.055,
        falloff: 0.08,
        color: 'rgba(255, 140, 60, 0.72)',
        tracks: {
          scale: [
            { at: 0, value: 0.65 },
            { at: 0.5, value: 0.9 },
            { at: 1, value: 1.05 },
          ],
          alpha: [
            { at: 0, value: 0.25 },
            { at: 0.12, value: 0.9 },
            { at: 1, value: 0.35 },
          ],
        },
      },
      {
        id: 'glow',
        type: 'orb',
        radius: 16,
        color: 'rgba(255, 171, 72, 0.4)',
        glowColor: 'rgba(255, 111, 23, 0.35)',
        glowScale: 2.8,
        tracks: {
          scale: [
            { at: 0, value: 0.7 },
            { at: 0.4, value: 0.95 },
            { at: 1, value: 1.1 },
          ],
          alpha: [
            { at: 0, value: 0.4 },
            { at: 0.15, value: 1 },
            { at: 1, value: 0.85 },
          ],
          glow: [
            { at: 0, value: 0.4 },
            { at: 0.45, value: 1 },
            { at: 1, value: 0.7 },
          ],
        },
      },
      {
        id: 'core',
        type: 'orb',
        radius: 8,
        color: '#fff1c9',
        glowColor: 'rgba(255, 214, 133, 0.65)',
        glowScale: 1.9,
        tracks: {
          scale: [
            { at: 0, value: 0.8 },
            { at: 0.55, value: 1 },
            { at: 1, value: 0.92 },
          ],
          alpha: [
            { at: 0, value: 0.35 },
            { at: 0.12, value: 1 },
            { at: 1, value: 1 },
          ],
          glow: [
            { at: 0, value: 0.2 },
            { at: 0.5, value: 0.85 },
            { at: 1, value: 0.55 },
          ],
        },
      },
    ],
  };
}

function createInstance() {
  return {
    x: 120,
    y: 308,
    targetX: 560,
    targetY: 120,
  };
}

function ensureMotion(asset) {
  if (!asset.motion) {
    asset.motion = { mode: 'fixed' };
  }

  if (!['fixed', 'line', 'path'].includes(asset.motion.mode)) {
    asset.motion.mode = 'fixed';
  }

  if (asset.motion.mode === 'line' || asset.motion.mode === 'path') {
    asset.motion.tracks ??= {};
  }
}

function normalizeTrack(track) {
  if (!Array.isArray(track)) return [];

  return track.map((keyframe) => ({
    at: Number.isFinite(Number(keyframe?.at)) ? Number(keyframe.at) : 0,
    value: Number.isFinite(Number(keyframe?.value)) ? Number(keyframe.value) : 0,
  }));
}

function normalizeAsset(rawAsset) {
  const asset = cloneData(rawAsset ?? {});

  asset.id = typeof asset.id === 'string' ? asset.id : 'new-effect';
  asset.label = typeof asset.label === 'string' ? asset.label : 'New Effect';
  asset.durationMs = Number.isFinite(Number(asset.durationMs)) ? Number(asset.durationMs) : 320;
  asset.loop = Boolean(asset.loop);
  asset.layers = Array.isArray(asset.layers) ? asset.layers : [];

  ensureMotion(asset);

  if (asset.motion?.tracks) {
    for (const trackName of ['travel', 'x', 'y']) {
      if (asset.motion.tracks[trackName]) {
        asset.motion.tracks[trackName] = normalizeTrack(asset.motion.tracks[trackName]);
      }
    }
  }

  asset.layers = asset.layers.map((layer, index) => {
    const nextLayer = cloneData(layer);
    nextLayer.id = typeof nextLayer.id === 'string' ? nextLayer.id : `layer-${index + 1}`;
    nextLayer.type = ['orb', 'ring', 'trail'].includes(nextLayer.type) ? nextLayer.type : 'orb';
    nextLayer.radius = Number.isFinite(Number(nextLayer.radius)) ? Number(nextLayer.radius) : 10;
    nextLayer.color = typeof nextLayer.color === 'string' ? nextLayer.color : '#ffffff';
    nextLayer.tracks = typeof nextLayer.tracks === 'object' && nextLayer.tracks ? nextLayer.tracks : {};

    for (const trackName of Object.keys(nextLayer.tracks)) {
      nextLayer.tracks[trackName] = normalizeTrack(nextLayer.tracks[trackName]);
    }

    if (nextLayer.type === 'orb') {
      nextLayer.glowScale = Number.isFinite(Number(nextLayer.glowScale))
        ? Number(nextLayer.glowScale)
        : undefined;
      nextLayer.glowColor =
        typeof nextLayer.glowColor === 'string' ? nextLayer.glowColor : undefined;
    }

    if (nextLayer.type === 'ring') {
      nextLayer.thickness = Number.isFinite(Number(nextLayer.thickness))
        ? Number(nextLayer.thickness)
        : 4;
    }

    if (nextLayer.type === 'trail') {
      nextLayer.segments = Number.isFinite(Number(nextLayer.segments))
        ? Number(nextLayer.segments)
        : 6;
      nextLayer.spacing = Number.isFinite(Number(nextLayer.spacing))
        ? Number(nextLayer.spacing)
        : 0.06;
      nextLayer.falloff = Number.isFinite(Number(nextLayer.falloff))
        ? Number(nextLayer.falloff)
        : undefined;
    }

    return nextLayer;
  });

  return asset;
}

const state = {
  asset: normalizeAsset(createStarterAsset()),
  instance: createInstance(),
  selectedLayerId: 'trail',
  selectedLayerTrack: 'scale',
  progress: 0,
  playing: true,
  dragTarget: null,
  fileHandle: null,
  fileName: '',
  jsonDraft: '',
  jsonDirty: false,
  lastFrameTime: 0,
  curveStates: {},
  curveEditorModes: {},
  activeCurveDrag: null,
  previewBackground: {
    preset: 'ember',
    ...cloneData(PREVIEW_BACKDROPS.ember),
  },
  collapsedPanels: {
    assetBackdrop: false,
    assetAnchors: false,
    assetMotion: false,
    layersStack: false,
    layerProperties: false,
    layerCurves: false,
    jsonPanel: false,
  },
  undoStack: [],
  redoStack: [],
  pendingHistorySnapshot: null,
  isRestoringHistory: false,
};

state.jsonDraft = stringifyAsset(state.asset);

function clearCurveEditors() {
  state.curveStates = {};
  state.curveEditorModes = {};
  state.activeCurveDrag = null;
}

function isPanelCollapsed(panelKey) {
  return Boolean(state.collapsedPanels[panelKey]);
}

function togglePanelCollapse(panelKey) {
  state.collapsedPanels[panelKey] = !isPanelCollapsed(panelKey);
}

function renderCollapsibleSection({
  panelKey,
  kicker,
  title,
  note = '',
  body,
  className = 'subpanel',
}) {
  const collapsed = isPanelCollapsed(panelKey);
  return `
    <div class="${className} ${collapsed ? 'is-collapsed' : ''}">
      <div class="subpanel-heading">
        <div class="subpanel-copy">
          <p class="panel-kicker">${escapeHtml(kicker)}</p>
          <h3>${escapeHtml(title)}</h3>
          ${note ? `<div class="subpanel-note">${note}</div>` : ''}
        </div>
        <div class="collapse-actions">
          <button
            class="stack-button stack-button-compact icon-toggle-button"
            data-action="toggle-collapse"
            data-panel-key="${panelKey}"
            aria-label="${collapsed ? 'Expand section' : 'Collapse section'}"
            title="${collapsed ? 'Expand section' : 'Collapse section'}"
          >
            ${collapsed ? '▸' : '▾'}
          </button>
        </div>
      </div>
      ${collapsed ? '' : body}
    </div>
  `;
}

function renderStaticPanelState() {
  const jsonBody = document.getElementById('jsonPanelBody');
  const jsonToggleButton = document.getElementById('jsonCollapseButton');
  if (!jsonBody || !jsonToggleButton) return;

  const collapsed = isPanelCollapsed('jsonPanel');
  jsonBody.hidden = collapsed;
  jsonToggleButton.textContent = collapsed ? '▸' : '▾';
  jsonToggleButton.setAttribute('aria-label', collapsed ? 'Expand JSON panel' : 'Collapse JSON panel');
  jsonToggleButton.setAttribute('title', collapsed ? 'Expand JSON panel' : 'Collapse JSON panel');
}

function createHistorySnapshot() {
  return {
    asset: cloneData(state.asset),
    instance: cloneData(state.instance),
    selectedLayerId: state.selectedLayerId,
    selectedLayerTrack: state.selectedLayerTrack,
    curveStates: cloneData(state.curveStates),
    curveEditorModes: cloneData(state.curveEditorModes),
    previewBackground: cloneData(state.previewBackground),
  };
}

function getHistorySignature(snapshot) {
  return JSON.stringify(snapshot);
}

function clearHistory() {
  state.undoStack = [];
  state.redoStack = [];
  state.pendingHistorySnapshot = null;
}

function pushUndoCheckpoint(snapshot = createHistorySnapshot()) {
  if (state.isRestoringHistory) return;

  const signature = getHistorySignature(snapshot);
  const previous = state.undoStack[state.undoStack.length - 1];

  if (previous && getHistorySignature(previous) === signature) {
    return;
  }

  state.undoStack.push(snapshot);
  if (state.undoStack.length > 200) {
    state.undoStack.shift();
  }
  state.redoStack = [];
}

function beginHistoryGesture() {
  if (state.pendingHistorySnapshot) return;
  state.pendingHistorySnapshot = createHistorySnapshot();
}

function endHistoryGesture() {
  if (!state.pendingHistorySnapshot) return;

  const before = state.pendingHistorySnapshot;
  state.pendingHistorySnapshot = null;

  if (getHistorySignature(before) !== getHistorySignature(createHistorySnapshot())) {
    pushUndoCheckpoint(before);
  }
}

function restoreHistorySnapshot(snapshot) {
  state.isRestoringHistory = true;
  state.asset = normalizeAsset(snapshot.asset);
  state.instance = cloneData(snapshot.instance);
  state.selectedLayerId = snapshot.selectedLayerId;
  state.selectedLayerTrack = snapshot.selectedLayerTrack;
  state.curveStates = cloneData(snapshot.curveStates ?? {});
  state.curveEditorModes = cloneData(snapshot.curveEditorModes ?? {});
  state.previewBackground = cloneData(snapshot.previewBackground ?? PREVIEW_BACKDROPS.ember);
  ensureSelection();
  syncJsonFromAsset();
  renderPanels();
  renderPreview();
  state.isRestoringHistory = false;
}

function undoHistory() {
  if (state.pendingHistorySnapshot) {
    endHistoryGesture();
  }

  const snapshot = state.undoStack.pop();
  if (!snapshot) {
    setSaveStatus('Nothing to undo.', 'info');
    return;
  }

  state.redoStack.push(createHistorySnapshot());
  restoreHistorySnapshot(snapshot);
  setSaveStatus('Undo applied.', 'success');
}

function redoHistory() {
  const snapshot = state.redoStack.pop();
  if (!snapshot) {
    setSaveStatus('Nothing to redo.', 'info');
    return;
  }

  state.undoStack.push(createHistorySnapshot());
  restoreHistorySnapshot(snapshot);
  setSaveStatus('Redo applied.', 'success');
}

function getCurveDefaultValue(trackName) {
  return ['scale', 'alpha'].includes(trackName) ? 1 : 0;
}

function getCurveStateKey(scope, trackName, layerId = state.selectedLayerId) {
  return scope === 'motion' ? `motion:${trackName}` : `layer:${layerId}:${trackName}`;
}

function parseCurveStateKey(key) {
  const [scope, identifier, trackName] = key.split(':');

  if (scope === 'motion') {
    return { scope, trackName: identifier, layerId: null };
  }

  return { scope, layerId: identifier, trackName };
}

function getRawTrack(scope, trackName, layerId = state.selectedLayerId) {
  if (scope === 'motion') {
    return cloneData(state.asset.motion?.tracks?.[trackName] ?? []);
  }

  const layer = state.asset.layers.find((item) => item.id === layerId);
  return cloneData(layer?.tracks?.[trackName] ?? []);
}

function sanitizeCurvePoints(points) {
  const sorted = points
    .map((point) => ({
      at: Number.isFinite(Number(point.at)) ? Number(point.at) : 0,
      value: Number.isFinite(Number(point.value)) ? Number(point.value) : 0,
      inX: Number.isFinite(Number(point.inX)) ? Number(point.inX) : Number(point.at),
      inY: Number.isFinite(Number(point.inY)) ? Number(point.inY) : Number(point.value),
      outX: Number.isFinite(Number(point.outX)) ? Number(point.outX) : Number(point.at),
      outY: Number.isFinite(Number(point.outY)) ? Number(point.outY) : Number(point.value),
    }))
    .sort((left, right) => left.at - right.at);

  if (sorted.length === 0) {
    return [];
  }

  for (let index = 0; index < sorted.length; index += 1) {
    const point = sorted[index];
    const previous = sorted[index - 1];
    const next = sorted[index + 1];
    const minAt = previous ? previous.at + 0.001 : 0;
    const maxAt = next ? next.at - 0.001 : 1;

    point.at = clamp(point.at, minAt, maxAt >= minAt ? maxAt : minAt);

    if (previous) {
      point.inX = clamp(point.inX, previous.at, point.at);
    } else {
      point.inX = point.at;
      point.inY = point.value;
    }

    if (next) {
      point.outX = clamp(point.outX, point.at, next.at);
    } else {
      point.outX = point.at;
      point.outY = point.value;
    }
  }

  return sorted;
}

function sanitizeCurveRange(rangeMin, rangeMax) {
  const min = Number.isFinite(Number(rangeMin)) ? Number(rangeMin) : -1;
  const max = Number.isFinite(Number(rangeMax)) ? Number(rangeMax) : 1;

  if (min === max) {
    return {
      min: min - 0.001,
      max: max + 0.001,
    };
  }

  return min < max ? { min, max } : { min: max, max: min };
}

function clampCurvePointValues(points, range) {
  for (const point of points) {
    point.value = clamp(point.value, range.min, range.max);
    point.inY = clamp(point.inY, range.min, range.max);
    point.outY = clamp(point.outY, range.min, range.max);
  }

  return points;
}

function cubicBezier(p0, p1, p2, p3, t) {
  const oneMinusT = 1 - t;
  return (
    oneMinusT ** 3 * p0 +
    3 * oneMinusT ** 2 * t * p1 +
    3 * oneMinusT * t ** 2 * p2 +
    t ** 3 * p3
  );
}

function buildCurveStateFromTrack(track, trackName) {
  const normalizedTrack = normalizeTrack(track);
  const points =
    normalizedTrack.length >= 2
      ? normalizedTrack
      : [
          { at: 0, value: normalizedTrack[0]?.value ?? getCurveDefaultValue(trackName) },
          { at: 1, value: normalizedTrack[0]?.value ?? getCurveDefaultValue(trackName) },
        ];

  const curvePoints = points.map((point, index) => {
    const previous = points[index - 1];
    const next = points[index + 1];
    const previousDistance = previous ? (point.at - previous.at) / 3 : 0;
    const nextDistance = next ? (next.at - point.at) / 3 : 0;
    const slope =
      previous && next
        ? (next.value - previous.value) / Math.max(0.001, next.at - previous.at)
        : next
          ? (next.value - point.value) / Math.max(0.001, next.at - point.at)
          : previous
            ? (point.value - previous.value) / Math.max(0.001, point.at - previous.at)
            : 0;

    return {
      at: point.at,
      value: point.value,
      inX: previous ? point.at - previousDistance : point.at,
      inY: previous ? point.value - slope * previousDistance : point.value,
      outX: next ? point.at + nextDistance : point.at,
      outY: next ? point.value + slope * nextDistance : point.value,
    };
  });

  const autoRange = getAutoCurveValueRangeFromPoints(curvePoints);

  return {
    points: clampCurvePointValues(sanitizeCurvePoints(curvePoints), autoRange),
    baked: [],
    modified: false,
    rangeMin: autoRange.min,
    rangeMax: autoRange.max,
  };
}

function bakeCurveState(curveState) {
  const range = sanitizeCurveRange(curveState.rangeMin, curveState.rangeMax);
  const points = clampCurvePointValues(sanitizeCurvePoints(curveState.points), range);

  if (points.length === 0) {
    return [];
  }

  if (points.length === 1) {
    return [{ at: clamp01(points[0].at), value: points[0].value }];
  }

  const samples = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];

    for (let sampleIndex = 0; sampleIndex <= CURVE_EDITOR.bakeSamplesPerSegment; sampleIndex += 1) {
      if (index > 0 && sampleIndex === 0) {
        continue;
      }

      const t = sampleIndex / CURVE_EDITOR.bakeSamplesPerSegment;
      samples.push({
        at: clamp01(cubicBezier(start.at, start.outX, end.inX, end.at, t)),
        value: clamp(
          cubicBezier(start.value, start.outY, end.inY, end.value, t),
          range.min,
          range.max,
        ),
      });
    }
  }

  samples.sort((left, right) => left.at - right.at);

  const baked = [];
  for (const sample of samples) {
    const previous = baked[baked.length - 1];
    if (!previous || Math.abs(previous.at - sample.at) > 0.0005) {
      baked.push(sample);
    } else {
      previous.at = sample.at;
      previous.value = sample.value;
    }
  }

  baked[0] = {
    at: clamp01(points[0].at),
    value: clamp(points[0].value, range.min, range.max),
  };
  baked[baked.length - 1] = {
    at: clamp01(points[points.length - 1].at),
    value: clamp(points[points.length - 1].value, range.min, range.max),
  };

  return baked;
}

function refreshCurveState(curveState) {
  const range = sanitizeCurveRange(curveState.rangeMin, curveState.rangeMax);
  curveState.rangeMin = range.min;
  curveState.rangeMax = range.max;
  curveState.points = clampCurvePointValues(sanitizeCurvePoints(curveState.points), range);
  curveState.baked = bakeCurveState(curveState);
  return curveState;
}

function ensureCurveState(scope, trackName, layerId = state.selectedLayerId) {
  const key = getCurveStateKey(scope, trackName, layerId);

  if (!state.curveStates[key]) {
    state.curveStates[key] = refreshCurveState(
      buildCurveStateFromTrack(getRawTrack(scope, trackName, layerId), trackName),
    );
  }

  return state.curveStates[key];
}

function hasCurveState(scope, trackName, layerId = state.selectedLayerId) {
  return Boolean(state.curveStates[getCurveStateKey(scope, trackName, layerId)]);
}

function getCurveEditorMode(scope, trackName, layerId = state.selectedLayerId) {
  return state.curveEditorModes[getCurveStateKey(scope, trackName, layerId)] ?? 'list';
}

function setCurveEditorMode(scope, trackName, mode, layerId = state.selectedLayerId) {
  if (mode === 'curve') {
    ensureCurveState(scope, trackName, layerId);
  }

  state.curveEditorModes[getCurveStateKey(scope, trackName, layerId)] = mode;
}

function applyCurvePreset(scope, trackName, presetId) {
  const preset = CURVE_PRESETS[presetId];
  if (!preset) return;

  pushUndoCheckpoint();

  const curveState = ensureCurveState(scope, trackName);
  const range = getCurveValueRange(curveState);
  const existingPoints = curveState.points;
  const startPoint = existingPoints[0] ?? { at: 0, value: getCurveDefaultValue(trackName) };
  const endPoint =
    existingPoints[existingPoints.length - 1] ?? { at: 1, value: getCurveDefaultValue(trackName) };
  const startAt = startPoint.at;
  const endAt = endPoint.at > startAt ? endPoint.at : startAt + 0.001;
  const startValue = clamp(startPoint.value, range.min, range.max);
  const endValue = clamp(endPoint.value, range.min, range.max);

  curveState.points = [
    {
      at: startAt,
      value: startValue,
      inX: startAt,
      inY: startValue,
      outX: lerp(startAt, endAt, preset.x1),
      outY: clamp(lerp(startValue, endValue, preset.y1), range.min, range.max),
    },
    {
      at: endAt,
      value: endValue,
      inX: lerp(startAt, endAt, preset.x2),
      inY: clamp(lerp(startValue, endValue, preset.y2), range.min, range.max),
      outX: endAt,
      outY: endValue,
    },
  ];

  curveState.modified = true;
  refreshCurveState(curveState);
  setCurveEditorMode(scope, trackName, 'curve');
  syncJsonFromAsset();
  renderPreview();
  rerenderCurveOwner(scope);
}

function getTrackEditorPoints(scope, trackName, layerId = state.selectedLayerId) {
  if (hasCurveState(scope, trackName, layerId)) {
    return cloneData(
      state.curveStates[getCurveStateKey(scope, trackName, layerId)].points.map((point) => ({
        at: point.at,
        value: point.value,
      })),
    );
  }

  return getRawTrack(scope, trackName, layerId);
}

function getTrackForSampling(scope, trackName, layerId = state.selectedLayerId) {
  if (hasCurveState(scope, trackName, layerId)) {
    const curveState = state.curveStates[getCurveStateKey(scope, trackName, layerId)];
    if (curveState.modified) {
      return curveState.baked;
    }
  }

  return scope === 'motion'
    ? state.asset.motion?.tracks?.[trackName]
    : state.asset.layers.find((layer) => layer.id === layerId)?.tracks?.[trackName];
}

function buildExportAsset() {
  const exported = cloneData(state.asset);

  for (const [key, curveState] of Object.entries(state.curveStates)) {
    if (!curveState.modified) {
      continue;
    }

    const bakedTrack = bakeCurveState(curveState);
    const parsed = parseCurveStateKey(key);

    if (parsed.scope === 'motion') {
      ensureMotion(exported);
      exported.motion.tracks ??= {};

      if (bakedTrack.length > 0) {
        exported.motion.tracks[parsed.trackName] = bakedTrack;
      } else {
        delete exported.motion.tracks[parsed.trackName];
      }

      continue;
    }

    const layer = exported.layers.find((item) => item.id === parsed.layerId);
    if (!layer) continue;

    layer.tracks ??= {};

    if (bakedTrack.length > 0) {
      layer.tracks[parsed.trackName] = bakedTrack;
    } else {
      delete layer.tracks[parsed.trackName];
    }
  }

  return normalizeAsset(exported);
}

function getAutoCurveValueRangeFromPoints(points) {
  const values = points.flatMap((point) => [point.value, point.inY, point.outY]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  if (minValue === maxValue) {
    const pad = Math.max(0.5, Math.abs(minValue) * 0.2 || 0.5);
    return { min: minValue - pad, max: maxValue + pad };
  }

  const padding = (maxValue - minValue) * 0.16;
  return {
    min: minValue - padding,
    max: maxValue + padding,
  };
}

function getCurveValueRange(curveState) {
  if (
    Number.isFinite(Number(curveState.rangeMin)) &&
    Number.isFinite(Number(curveState.rangeMax)) &&
    Number(curveState.rangeMin) < Number(curveState.rangeMax)
  ) {
    return {
      min: Number(curveState.rangeMin),
      max: Number(curveState.rangeMax),
    };
  }

  return getAutoCurveValueRangeFromPoints(curveState.points);
}

function curvePointToScreen(at, value, range) {
  const usableWidth = CURVE_EDITOR.width - CURVE_EDITOR.padX * 2;
  const usableHeight = CURVE_EDITOR.height - CURVE_EDITOR.padY * 2;
  return {
    x: CURVE_EDITOR.padX + clamp01(at) * usableWidth,
    y:
      CURVE_EDITOR.padY +
      (1 - (value - range.min) / Math.max(0.001, range.max - range.min)) * usableHeight,
  };
}

function screenToCurvePoint(localX, localY, range) {
  const usableWidth = CURVE_EDITOR.width - CURVE_EDITOR.padX * 2;
  const usableHeight = CURVE_EDITOR.height - CURVE_EDITOR.padY * 2;
  return {
    at: clamp01((localX - CURVE_EDITOR.padX) / usableWidth),
    value:
      range.min +
      (1 - clamp01((localY - CURVE_EDITOR.padY) / usableHeight)) *
        Math.max(0.001, range.max - range.min),
  };
}

function getSelectedLayerIndex() {
  return state.asset.layers.findIndex((layer) => layer.id === state.selectedLayerId);
}

function getSelectedLayer() {
  return state.asset.layers.find((layer) => layer.id === state.selectedLayerId) ?? null;
}

function ensureSelection() {
  const selectedLayer = getSelectedLayer();
  if (!selectedLayer && state.asset.layers.length > 0) {
    state.selectedLayerId = state.asset.layers[0].id;
  }

  const activeLayer = getSelectedLayer();
  if (!activeLayer) {
    state.selectedLayerTrack = 'scale';
    return;
  }

  const validTracks = TRACKS_BY_LAYER_TYPE[activeLayer.type];
  if (!validTracks.includes(state.selectedLayerTrack)) {
    state.selectedLayerTrack = validTracks[0];
  }
}

function setSaveStatus(message, type = 'info') {
  ui.saveStatusLabel.textContent = message;
  ui.saveStatusLabel.className =
    type === 'error' ? 'error-text' : type === 'success' ? 'success-text' : '';
}

function setJsonStatus(message, type = 'info') {
  ui.jsonStatusLabel.textContent = message;
  ui.jsonStatusLabel.className =
    type === 'error' ? 'error-text' : type === 'success' ? 'success-text' : '';
}

function syncJsonFromAsset() {
  state.jsonDraft = stringifyAsset(buildExportAsset());
  state.jsonDirty = false;
  ui.jsonEditor.value = state.jsonDraft;
  setJsonStatus('JSON is synced with the visual editor.');
}

function commitAsset(nextAsset, options = {}) {
  state.asset = normalizeAsset(nextAsset);
  ensureSelection();

  if (options.resetProgress) {
    state.progress = 0;
  }

  if (options.syncJson !== false) {
    syncJsonFromAsset();
  }

  ui.effectTitleLabel.textContent = `${state.asset.label} Preview`;
  renderPreview();

  if (options.renderPanels) {
    renderPanels();
  }
}

function sampleTrack(track, progress, fallback = 0) {
  if (!track || track.length === 0) return fallback;

  const t = clamp01(progress);

  if (t <= track[0].at) {
    return track[0].value;
  }

  const lastKey = track[track.length - 1];
  if (t >= lastKey.at) {
    return lastKey.value;
  }

  for (let index = 1; index < track.length; index += 1) {
    const previous = track[index - 1];
    const current = track[index];

    if (t > current.at) {
      continue;
    }

    const span = current.at - previous.at;
    if (span <= 0) return current.value;

    return lerp(previous.value, current.value, (t - previous.at) / span);
  }

  return lastKey.value;
}

function sampleLayerTrack(layer, name, progress, fallback = 0) {
  return sampleTrack(getTrackForSampling('layer', name, layer.id), progress, fallback);
}

function motionUsesTarget(mode) {
  return mode === 'line' || mode === 'path';
}

function sampleMotionPosition(asset, instance, progress) {
  if (motionUsesTarget(asset.motion?.mode) && instance.targetX != null && instance.targetY != null) {
    const travel = sampleTrack(getTrackForSampling('motion', 'travel'), progress, progress);
    const base = {
      x: lerp(instance.x, instance.targetX, travel),
      y: lerp(instance.y, instance.targetY, travel),
    };

    if (asset.motion?.mode === 'path') {
      return {
        x: base.x + sampleTrack(getTrackForSampling('motion', 'x'), progress, 0),
        y: base.y + sampleTrack(getTrackForSampling('motion', 'y'), progress, 0),
      };
    }

    return base;
  }

  if (asset.motion?.mode === 'path') {
    return {
      x: instance.x + sampleTrack(getTrackForSampling('motion', 'x'), progress, 0),
      y: instance.y + sampleTrack(getTrackForSampling('motion', 'y'), progress, 0),
    };
  }

  return {
    x: instance.x,
    y: instance.y,
  };
}

function renderMotionGuide() {
  const motionMode = state.asset.motion?.mode ?? 'fixed';

  if (!motionUsesTarget(motionMode)) {
    return '';
  }

  const targetX = state.instance.targetX ?? state.instance.x;
  const targetY = state.instance.targetY ?? state.instance.y;

  if (motionMode === 'line') {
    return `
      <line
        x1="${state.instance.x}"
        y1="${state.instance.y}"
        x2="${targetX}"
        y2="${targetY}"
        stroke="rgba(255,255,255,0.14)"
        stroke-dasharray="10 8"
      ></line>
    `;
  }

  const samples = Array.from({ length: 25 }, (_, index) => {
    const t = index / 24;
    const point = sampleMotionPosition(state.asset, state.instance, t);
    return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
  }).join(' ');

  return `
    <path
      d="${samples}"
      fill="none"
      stroke="rgba(255,255,255,0.18)"
      stroke-width="2"
      stroke-dasharray="10 8"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
  `;
}

function renderOrb(layer, progress) {
  const base = sampleMotionPosition(state.asset, state.instance, progress);
  const x = base.x + sampleLayerTrack(layer, 'x', progress, 0);
  const y = base.y + sampleLayerTrack(layer, 'y', progress, 0);
  const scale = sampleLayerTrack(layer, 'scale', progress, 1);
  const alpha = sampleLayerTrack(layer, 'alpha', progress, 1);
  const glow = sampleLayerTrack(layer, 'glow', progress, 0);
  const glowRadius = layer.radius * scale * (layer.glowScale ?? 2.3) * (1 + glow * 0.45);
  const coreRadius = Math.max(1, layer.radius * scale);
  const glowOpacity = Math.max(0, alpha * (0.18 + glow * 0.35));

  return `
    <circle cx="${x}" cy="${y}" r="${glowRadius}" fill="${escapeHtml(layer.glowColor ?? layer.color)}" opacity="${glowOpacity}"></circle>
    <circle cx="${x}" cy="${y}" r="${coreRadius}" fill="${escapeHtml(layer.color)}" opacity="${Math.max(0, alpha)}"></circle>
  `;
}

function renderRing(layer, progress) {
  const base = sampleMotionPosition(state.asset, state.instance, progress);
  const x = base.x + sampleLayerTrack(layer, 'x', progress, 0);
  const y = base.y + sampleLayerTrack(layer, 'y', progress, 0);
  const scale = sampleLayerTrack(layer, 'scale', progress, 1);
  const alpha = sampleLayerTrack(layer, 'alpha', progress, 1);

  return `
    <circle
      cx="${x}"
      cy="${y}"
      r="${Math.max(0.5, layer.radius * scale)}"
      fill="transparent"
      stroke="${escapeHtml(layer.color)}"
      stroke-width="${Math.max(1, layer.thickness * scale)}"
      opacity="${Math.max(0, alpha)}"
    ></circle>
  `;
}

function renderTrail(layer, progress) {
  const falloff = layer.falloff ?? 0.1;
  let svg = '';

  for (let index = 0; index < layer.segments; index += 1) {
    const segmentProgress = Math.max(0, progress - index * layer.spacing);
    const base = sampleMotionPosition(state.asset, state.instance, segmentProgress);
    const x = base.x + sampleLayerTrack(layer, 'x', segmentProgress, 0);
    const y = base.y + sampleLayerTrack(layer, 'y', segmentProgress, 0);
    const scale = sampleLayerTrack(layer, 'scale', segmentProgress, 1);
    const alpha = sampleLayerTrack(layer, 'alpha', segmentProgress, 1);
    const radius = Math.max(1, layer.radius * scale * (1 - index * falloff));
    const opacity = Math.max(0, alpha * (0.65 - index * (falloff * 0.9)));

    svg += `
      <circle
        cx="${x}"
        cy="${y}"
        r="${radius}"
        fill="${escapeHtml(layer.color)}"
        opacity="${opacity}"
      ></circle>
    `;
  }

  return svg;
}

function renderPreview() {
  const backdrop = state.previewBackground;
  const shapes = state.asset.layers
    .map((layer) => {
      if (layer.type === 'orb') return renderOrb(layer, state.progress);
      if (layer.type === 'ring') return renderRing(layer, state.progress);
      return renderTrail(layer, state.progress);
    })
    .join('');

  const motionMode = state.asset.motion?.mode ?? 'fixed';
  const showTarget = motionUsesTarget(motionMode);
  const targetX = state.instance.targetX ?? state.instance.x;
  const targetY = state.instance.targetY ?? state.instance.y;

  ui.stageSvg.innerHTML = `
    <defs>
      <linearGradient id="stage-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${escapeHtml(backdrop.top)}"></stop>
        <stop offset="100%" stop-color="${escapeHtml(backdrop.bottom)}"></stop>
      </linearGradient>
      <radialGradient id="warm-glow" cx="0.35" cy="0.2" r="0.8">
        <stop offset="0%" stop-color="${escapeHtml(backdrop.glow)}"></stop>
        <stop offset="100%" stop-color="rgba(0, 0, 0, 0)"></stop>
      </radialGradient>
    </defs>

    <rect x="0" y="0" width="${STAGE.width}" height="${STAGE.height}" rx="28" fill="url(#stage-bg)"></rect>
    <rect x="0" y="0" width="${STAGE.width}" height="${STAGE.height}" rx="28" fill="url(#warm-glow)"></rect>
    <path
      d="M 0 352 Q 180 334 340 360 T 720 350"
      fill="none"
      stroke="${escapeHtml(backdrop.ground)}"
      stroke-width="2"
    ></path>
    <line
      x1="0"
      y1="320"
      x2="${STAGE.width}"
      y2="320"
      stroke="${escapeHtml(backdrop.grid)}"
      stroke-dasharray="6 10"
    ></line>

    ${renderMotionGuide()}

    ${shapes}

    <g data-anchor="start" style="cursor: grab;">
      <circle cx="${state.instance.x}" cy="${state.instance.y}" r="12" fill="#df945c"></circle>
      <circle
        cx="${state.instance.x}"
        cy="${state.instance.y}"
        r="22"
        fill="transparent"
        stroke="rgba(223, 148, 92, 0.42)"
      ></circle>
      <text
        x="${state.instance.x - 26}"
        y="${state.instance.y - 28}"
        fill="rgba(245,234,216,0.78)"
        font-size="14"
      >Spawn</text>
    </g>

    ${
      showTarget
        ? `
      <g data-anchor="target" style="cursor: grab;">
        <circle cx="${targetX}" cy="${targetY}" r="12" fill="#8fd7ff"></circle>
        <circle
          cx="${targetX}"
          cy="${targetY}"
          r="22"
          fill="transparent"
          stroke="rgba(143, 215, 255, 0.42)"
        ></circle>
        <text
          x="${targetX - 20}"
          y="${targetY - 28}"
          fill="rgba(245,234,216,0.78)"
          font-size="14"
        >Target</text>
      </g>
    `
        : ''
    }
  `;

  ui.progressSlider.value = String(state.progress);
  ui.progressPercentLabel.textContent = `${Math.round(state.progress * 100)}%`;
  ui.progressTimeLabel.textContent = `${Math.round(state.progress * state.asset.durationMs)} ms`;
}

function renderBezierCurveEditor(scope, trackName) {
  const curveState = ensureCurveState(scope, trackName);
  const range = getCurveValueRange(curveState);
  const horizontalGuides = Array.from({ length: 5 }, (_, index) => {
    const t = index / 4;
    const y = CURVE_EDITOR.padY + t * (CURVE_EDITOR.height - CURVE_EDITOR.padY * 2);
    const value = (range.max - (range.max - range.min) * t).toFixed(2);
    return `
      <line x1="${CURVE_EDITOR.padX}" y1="${y}" x2="${CURVE_EDITOR.width - CURVE_EDITOR.padX}" y2="${y}" stroke="rgba(255,255,255,0.07)" stroke-dasharray="4 6"></line>
      <text x="6" y="${y + 4}" fill="rgba(245,234,216,0.48)" font-size="11">${value}</text>
    `;
  }).join('');

  const verticalGuides = Array.from({ length: 5 }, (_, index) => {
    const t = index / 4;
    const x = CURVE_EDITOR.padX + t * (CURVE_EDITOR.width - CURVE_EDITOR.padX * 2);
    return `
      <line x1="${x}" y1="${CURVE_EDITOR.padY}" x2="${x}" y2="${CURVE_EDITOR.height - CURVE_EDITOR.padY}" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4 6"></line>
      <text x="${x - 8}" y="${CURVE_EDITOR.height - 2}" fill="rgba(245,234,216,0.48)" font-size="11">${t.toFixed(2)}</text>
    `;
  }).join('');

  const segmentPath = curveState.points
    .map((point, index) => {
      const anchor = curvePointToScreen(point.at, point.value, range);

      if (index === 0) {
        return `M ${anchor.x} ${anchor.y}`;
      }

      const previous = curveState.points[index - 1];
      const previousOut = curvePointToScreen(previous.outX, previous.outY, range);
      const currentIn = curvePointToScreen(point.inX, point.inY, range);
      return `C ${previousOut.x} ${previousOut.y}, ${currentIn.x} ${currentIn.y}, ${anchor.x} ${anchor.y}`;
    })
    .join(' ');

  const handleLines = curveState.points
    .map((point, index) => {
      const anchor = curvePointToScreen(point.at, point.value, range);
      const handles = [];

      if (index > 0) {
        const inPoint = curvePointToScreen(point.inX, point.inY, range);
        handles.push(
          `<line x1="${anchor.x}" y1="${anchor.y}" x2="${inPoint.x}" y2="${inPoint.y}" stroke="rgba(143,215,255,0.32)" stroke-width="1.5"></line>`,
          `<circle cx="${inPoint.x}" cy="${inPoint.y}" r="5" fill="#8fd7ff" data-action="curve-handle" data-handle-type="in" data-curve-scope="${scope}" data-track-name="${trackName}" data-point-index="${index}"></circle>`,
        );
      }

      if (index < curveState.points.length - 1) {
        const outPoint = curvePointToScreen(point.outX, point.outY, range);
        handles.push(
          `<line x1="${anchor.x}" y1="${anchor.y}" x2="${outPoint.x}" y2="${outPoint.y}" stroke="rgba(223,148,92,0.34)" stroke-width="1.5"></line>`,
          `<circle cx="${outPoint.x}" cy="${outPoint.y}" r="5" fill="#df945c" data-action="curve-handle" data-handle-type="out" data-curve-scope="${scope}" data-track-name="${trackName}" data-point-index="${index}"></circle>`,
        );
      }

      return handles.join('');
    })
    .join('');

  const anchors = curveState.points
    .map((point, index) => {
      const anchor = curvePointToScreen(point.at, point.value, range);
      return `
        <circle
          cx="${anchor.x}"
          cy="${anchor.y}"
          r="7"
          fill="#f5ead8"
          stroke="#0e0b10"
          stroke-width="2"
          data-action="curve-handle"
          data-handle-type="anchor"
          data-curve-scope="${scope}"
          data-track-name="${trackName}"
          data-point-index="${index}"
        ></circle>
      `;
    })
    .join('');

  return `
    <div class="curve-viewport">
      <div class="curve-preset-row">
        <span class="field-label">Common Presets</span>
        <select
          class="field-select curve-preset-select"
          data-curve-preset-select="true"
          data-curve-scope="${scope}"
          data-track-name="${trackName}"
        >
          <option value="">Preset Curve...</option>
          ${Object.entries(CURVE_PRESETS)
            .map(
              ([presetId, preset]) => `
            <option value="${presetId}">${escapeHtml(preset.label)}</option>
          `,
            )
            .join('')}
        </select>
      </div>

      <div class="curve-range-row">
        <label class="field curve-range-field">
          <span class="field-label">Range Min</span>
          <input
            class="field-input"
            type="number"
            step="0.01"
            value="${range.min}"
            data-curve-scope="${scope}"
            data-track-name="${trackName}"
            data-range-field="min"
          />
        </label>

        <label class="field curve-range-field">
          <span class="field-label">Range Max</span>
          <input
            class="field-input"
            type="number"
            step="0.01"
            value="${range.max}"
            data-curve-scope="${scope}"
            data-track-name="${trackName}"
            data-range-field="max"
          />
        </label>
      </div>

      <svg
        class="curve-canvas"
        viewBox="0 0 ${CURVE_EDITOR.width} ${CURVE_EDITOR.height}"
        data-curve-canvas="true"
        data-curve-scope="${scope}"
        data-track-name="${trackName}"
      >
        <rect x="0" y="0" width="${CURVE_EDITOR.width}" height="${CURVE_EDITOR.height}" rx="16" fill="rgba(10,9,12,0.94)"></rect>
        ${horizontalGuides}
        ${verticalGuides}
        <path d="${segmentPath}" fill="none" stroke="#f6b26b" stroke-width="3"></path>
        ${handleLines}
        ${anchors}
      </svg>
      <p class="section-note">
        Curve mode uses weighted tangents. Once you edit the graph, the result is baked into linear runtime keys for preview and export.
      </p>
    </div>
  `;
}

function renderCurveEditor(scope, trackName) {
  const mode = getCurveEditorMode(scope, trackName);
  const track = getTrackEditorPoints(scope, trackName);

  return `
    <div class="curve-editor">
      <div class="curve-header">
        <div>
          <p class="panel-kicker">${escapeHtml(TRACK_LABELS[trackName])}</p>
          <p class="section-note">Key times are normalized from 0 to 1 across the full effect lifetime.</p>
        </div>
        <div class="curve-actions">
          <button class="stack-button ${mode === 'list' ? 'is-selected' : ''}" data-action="set-editor-mode" data-editor-mode="list" data-curve-scope="${scope}" data-track-name="${trackName}">Keyframe List</button>
          <button class="stack-button ${mode === 'curve' ? 'is-selected' : ''}" data-action="set-editor-mode" data-editor-mode="curve" data-curve-scope="${scope}" data-track-name="${trackName}">Bezier Curve</button>
          <button class="stack-button" data-action="add-keyframe" data-curve-scope="${scope}" data-track-name="${trackName}">Add Key</button>
          <button class="stack-button" data-action="sort-keyframes" data-curve-scope="${scope}" data-track-name="${trackName}">Sort Keys</button>
          <button class="stack-button" data-action="clear-keyframes" data-curve-scope="${scope}" data-track-name="${trackName}">Clear</button>
        </div>
      </div>

      ${
        mode === 'curve'
          ? renderBezierCurveEditor(scope, trackName)
          : `
        <div class="curve-table">
          ${
            track.length
              ? track
                  .map(
                    (keyframe, index) => `
                <div class="curve-row">
                  <label class="field">
                    <span class="field-label">Time</span>
                    <input
                      class="field-input"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value="${keyframe.at}"
                      data-curve-scope="${scope}"
                      data-track-name="${trackName}"
                      data-key-index="${index}"
                      data-key-field="at"
                    />
                  </label>

                  <label class="field">
                    <span class="field-label">Value</span>
                    <input
                      class="field-input"
                      type="number"
                      step="0.01"
                      value="${keyframe.value}"
                      data-curve-scope="${scope}"
                      data-track-name="${trackName}"
                      data-key-index="${index}"
                      data-key-field="value"
                    />
                  </label>

                  <button
                    class="icon-button"
                    title="Remove keyframe"
                    data-action="remove-keyframe"
                    data-curve-scope="${scope}"
                    data-track-name="${trackName}"
                    data-key-index="${index}"
                  >×</button>
                </div>
              `,
                  )
                  .join('')
              : '<p class="empty-note">No keyframes yet. Leave it empty for the runtime default, or add keys for a custom curve over lifetime.</p>'
          }
        </div>
      `
      }
    </div>
  `;
}

function renderAssetPanel() {
  const motionMode = state.asset.motion?.mode ?? 'fixed';
  const isLineMotion = motionMode === 'line';
  const isPathMotion = motionMode === 'path';
  const usesTargetMotion = motionUsesTarget(motionMode);
  const backdrop = state.previewBackground;

  ui.assetPanel.innerHTML = `
    <div class="field-grid">
      <label class="field">
        <span class="field-label">Effect ID</span>
        <input class="field-input" type="text" value="${escapeHtml(state.asset.id)}" data-asset-field="id" />
      </label>

      <label class="field">
        <span class="field-label">Display Label</span>
        <input class="field-input" type="text" value="${escapeHtml(state.asset.label)}" data-asset-field="label" />
      </label>

      <div class="field-grid two-up">
        <label class="field">
          <span class="field-label">Duration (ms)</span>
          <input class="field-input" type="number" min="1" value="${state.asset.durationMs}" data-asset-field="durationMs" />
        </label>

        <label class="field">
          <span class="field-label">Motion Mode</span>
          <select class="field-select" data-motion-field="mode">
            <option value="fixed" ${motionMode === 'fixed' ? 'selected' : ''}>Fixed</option>
            <option value="line" ${isLineMotion ? 'selected' : ''}>Line</option>
            <option value="path" ${isPathMotion ? 'selected' : ''}>Path</option>
          </select>
        </label>
      </div>

      <label class="field-checkbox">
        <input type="checkbox" ${state.asset.loop ? 'checked' : ''} data-asset-field="loop" />
        <span class="field-label">Loop playback in preview</span>
      </label>
    </div>

    ${renderCollapsibleSection({
      panelKey: 'assetBackdrop',
      kicker: 'Backdrop',
      title: 'Preview Environment',
      note:
        '<span class="section-note">Editor-only. Helps judge readability for fire, frost, poison, void, and more.</span>',
      body: `
      <div class="field-grid">
        <label class="field">
          <span class="field-label">Backdrop Preset</span>
          <select class="field-select" data-preview-field="preset">
            ${Object.entries(PREVIEW_BACKDROPS)
              .map(
                ([presetId, preset]) => `
              <option value="${presetId}" ${backdrop.preset === presetId ? 'selected' : ''}>${escapeHtml(preset.label)}</option>
            `,
              )
              .join('')}
          </select>
        </label>

        ${renderColorField({
          label: 'Top Color',
          value: backdrop.top,
          field: 'top',
          datasetName: 'preview-field',
          fallback: '#181017',
        })}

        ${renderColorField({
          label: 'Bottom Color',
          value: backdrop.bottom,
          field: 'bottom',
          datasetName: 'preview-field',
          fallback: '#0e0b10',
        })}

        ${renderColorField({
          label: 'Ambient Glow',
          value: backdrop.glow,
          field: 'glow',
          datasetName: 'preview-field',
          fallback: '#df945c',
        })}
      </div>
    `,
    })}

    ${renderCollapsibleSection({
      panelKey: 'assetAnchors',
      kicker: 'Anchors',
      title: 'Stage Positions',
      note:
        '<span class="section-note">These are preview anchors, not exported editor metadata.</span>',
      body: `
      <div class="field-grid two-up">
        <label class="field">
          <span class="field-label">Spawn X</span>
          <input class="field-input" type="number" value="${Math.round(state.instance.x)}" data-anchor-field="x" />
        </label>

        <label class="field">
          <span class="field-label">Spawn Y</span>
          <input class="field-input" type="number" value="${Math.round(state.instance.y)}" data-anchor-field="y" />
        </label>

        <label class="field">
          <span class="field-label">Target X</span>
          <input class="field-input" type="number" value="${Math.round(state.instance.targetX ?? state.instance.x)}" data-anchor-field="targetX" ${usesTargetMotion ? '' : 'disabled'} />
        </label>

        <label class="field">
          <span class="field-label">Target Y</span>
          <input class="field-input" type="number" value="${Math.round(state.instance.targetY ?? state.instance.y)}" data-anchor-field="targetY" ${usesTargetMotion ? '' : 'disabled'} />
        </label>
      </div>

      <p class="section-note">
        Use <strong>Line</strong> for straight projectile travel, <strong>Path</strong> for arcs and wiggle, and <strong>Fixed</strong> when the effect stays on its spawn point.
      </p>
    `,
    })}

    ${renderCollapsibleSection({
      panelKey: 'assetMotion',
      kicker: 'Motion',
      title: 'Motion Over Lifetime',
      body: `
      ${
        motionMode === 'fixed'
          ? '<p class="empty-note">Motion curves are disabled while Motion Mode is set to Fixed.</p>'
          : `
            <div class="curve-stack">
              ${renderCurveEditor('motion', 'travel')}
              ${
                isPathMotion
                  ? `
                    ${renderCurveEditor('motion', 'x')}
                    ${renderCurveEditor('motion', 'y')}
                    <p class="section-note">
                      <strong>Path</strong> mode keeps the spawn-to-target travel and adds root <strong>Offset X</strong> and <strong>Offset Y</strong> on top.
                    </p>
                  `
                  : ''
              }
            </div>
          `
      }
    `,
    })}
  `;
}

function renderLayersPanel() {
  ui.layersPanel.innerHTML = `
    <div class="layer-toolbar">
      <div class="button-row">
        <button class="chip-button" data-action="add-layer" data-layer-type="orb">Add Orb</button>
        <button class="chip-button" data-action="add-layer" data-layer-type="ring">Add Ring</button>
        <button class="chip-button" data-action="add-layer" data-layer-type="trail">Add Trail</button>
      </div>

      <div class="button-row">
        <button class="chip-button" data-action="duplicate-layer">Duplicate</button>
        <button class="chip-button" data-action="move-layer" data-direction="-1">Up</button>
        <button class="chip-button" data-action="move-layer" data-direction="1">Down</button>
        <button class="chip-button" data-action="remove-layer">Delete</button>
      </div>
    </div>

    ${
      isPanelCollapsed('layersStack')
        ? `
      <div class="layer-toolbar layer-collapse-row">
        <span class="section-note">Layer stack is collapsed.</span>
        <button
          class="stack-button stack-button-compact icon-toggle-button"
          data-action="toggle-collapse"
          data-panel-key="layersStack"
          aria-label="Expand layer stack"
          title="Expand layer stack"
        >▸</button>
      </div>
    `
        : ''
    }

    <div class="layer-stack">
      ${
        isPanelCollapsed('layersStack')
          ? ''
          : `
      ${
        state.asset.layers.length
          ? state.asset.layers
              .map(
                (layer) => `
            <button class="layer-card ${layer.id === state.selectedLayerId ? 'is-selected' : ''}" data-action="select-layer" data-layer-id="${escapeHtml(layer.id)}">
              <div class="layer-card-header">
                <strong>${escapeHtml(layer.id)}</strong>
                <span class="swatch" style="background: ${escapeHtml(layer.color)};"></span>
              </div>
              <div class="layer-card-header">
                <span class="layer-type">${escapeHtml(layer.type)}</span>
                <span class="section-note">${layer.tracks ? Object.keys(layer.tracks).length : 0} curve set${layer.tracks && Object.keys(layer.tracks).length === 1 ? '' : 's'}</span>
              </div>
            </button>
          `,
              )
              .join('')
          : '<p class="empty-note">No layers yet. Start by adding an orb, ring, or trail layer.</p>'
      }
      `
      }
    </div>
  `;
}

function renderLayerInspector() {
  const layer = getSelectedLayer();

  if (!layer) {
    ui.layerInspectorPanel.innerHTML =
      '<p class="empty-note">Select a layer to edit its properties and curves over lifetime.</p>';
    return;
  }

  const validTracks = TRACKS_BY_LAYER_TYPE[layer.type];
  const selectedTrack = validTracks.includes(state.selectedLayerTrack)
    ? state.selectedLayerTrack
    : validTracks[0];
  const currentTrack = layer.tracks?.[selectedTrack] ?? [];

  ui.layerInspectorPanel.innerHTML = `
    ${renderCollapsibleSection({
      panelKey: 'layerProperties',
      kicker: 'Selected Layer',
      title: layer.id,
      note: `<span class="layer-type">${escapeHtml(layer.type)}</span>`,
      className: 'inspector-block',
      body: `
      <div class="field-grid">
        <label class="field">
          <span class="field-label">Layer ID</span>
          <input class="field-input" type="text" value="${escapeHtml(layer.id)}" data-layer-field="id" />
        </label>

        ${renderColorField({
          label: 'Base Color',
          value: layer.color,
          field: 'color',
          datasetName: 'layer-field',
          fallback: '#ffffff',
        })}

        <div class="field-grid two-up">
          <label class="field">
            <span class="field-label">Radius</span>
            <input class="field-input" type="number" step="0.1" value="${layer.radius}" data-layer-field="radius" />
          </label>

          ${
            layer.type === 'ring'
              ? `
            <label class="field">
              <span class="field-label">Thickness</span>
              <input class="field-input" type="number" step="0.1" value="${layer.thickness}" data-layer-field="thickness" />
            </label>
          `
              : layer.type === 'orb'
                ? `
            <label class="field">
              <span class="field-label">Glow Scale</span>
              <input class="field-input" type="number" step="0.1" value="${layer.glowScale ?? 2.3}" data-layer-field="glowScale" />
            </label>
          `
                : `
            <label class="field">
              <span class="field-label">Segments</span>
              <input class="field-input" type="number" step="1" min="1" value="${layer.segments}" data-layer-field="segments" />
            </label>
          `
          }
        </div>

        ${
          layer.type === 'orb'
            ? `
          ${renderColorField({
            label: 'Glow Color',
            value: layer.glowColor ?? '',
            field: 'glowColor',
            datasetName: 'layer-field',
            fallback: getColorInputValue(layer.color, '#ffffff'),
          })}
        `
            : ''
        }

        ${
          layer.type === 'trail'
            ? `
          <div class="field-grid two-up">
            <label class="field">
              <span class="field-label">Spacing</span>
              <input class="field-input" type="number" step="0.01" value="${layer.spacing}" data-layer-field="spacing" />
            </label>

            <label class="field">
              <span class="field-label">Falloff</span>
              <input class="field-input" type="number" step="0.01" value="${layer.falloff ?? 0.1}" data-layer-field="falloff" />
            </label>
          </div>
        `
            : ''
        }
      </div>
    `,
    })}

    ${renderCollapsibleSection({
      panelKey: 'layerCurves',
      kicker: 'Curves',
      title: 'Properties Over Lifetime',
      className: 'inspector-block',
      body: `
      <div class="track-pills">
        ${validTracks
          .map(
            (trackName) => `
          <button class="track-pill ${trackName === selectedTrack ? 'is-active' : ''}" data-action="select-track" data-track-name="${trackName}">
            ${escapeHtml(TRACK_LABELS[trackName])}
          </button>
        `,
          )
          .join('')}
      </div>

      ${renderCurveEditor('layer', selectedTrack)}
    `,
    })}
  `;
}

function renderPanels() {
  renderAssetPanel();
  renderLayersPanel();
  renderLayerInspector();
  renderStaticPanelState();
  ui.effectTitleLabel.textContent = `${state.asset.label} Preview`;
  ui.fileStatusLabel.textContent = state.fileName
    ? state.fileHandle
      ? `Attached file: ${state.fileName}`
      : `Loaded source: ${state.fileName}`
    : 'No local file attached';
}

function createLayer(type) {
  const baseName = `${type}`;
  const usedIds = new Set(state.asset.layers.map((layer) => layer.id));
  let suffix = state.asset.layers.length + 1;
  let id = `${baseName}-${suffix}`;

  while (usedIds.has(id)) {
    suffix += 1;
    id = `${baseName}-${suffix}`;
  }

  if (type === 'orb') {
    return {
      id,
      type: 'orb',
      radius: 10,
      color: '#fff1c9',
      glowColor: 'rgba(255, 214, 133, 0.6)',
      glowScale: 2,
      tracks: {
        scale: [{ at: 0, value: 1 }],
        alpha: [{ at: 0, value: 1 }],
      },
    };
  }

  if (type === 'ring') {
    return {
      id,
      type: 'ring',
      radius: 16,
      thickness: 4,
      color: '#ffd27a',
      tracks: {
        scale: [{ at: 0, value: 1 }],
        alpha: [{ at: 0, value: 1 }],
      },
    };
  }

  return {
    id,
    type: 'trail',
    radius: 12,
    segments: 6,
    spacing: 0.06,
    falloff: 0.1,
    color: 'rgba(255, 140, 60, 0.66)',
    tracks: {
      scale: [{ at: 0, value: 1 }],
      alpha: [{ at: 0, value: 1 }],
    },
  };
}

function updateAssetField(field, rawValue) {
  pushUndoCheckpoint();
  const nextAsset = cloneData(state.asset);

  if (field === 'durationMs') {
    nextAsset.durationMs = Math.max(1, Number(rawValue) || 1);
  } else if (field === 'loop') {
    nextAsset.loop = Boolean(rawValue);
  } else {
    nextAsset[field] = rawValue;
  }

  commitAsset(nextAsset);
}

function updatePreviewField(field, rawValue, fromColorPicker = false) {
  pushUndoCheckpoint();
  if (field === 'preset') {
    const preset = PREVIEW_BACKDROPS[rawValue] ?? PREVIEW_BACKDROPS.custom;
    state.previewBackground = {
      preset: rawValue,
      ...cloneData(preset),
    };
    renderAssetPanel();
    renderPreview();
    return;
  }

  const currentValue = state.previewBackground[field];
  state.previewBackground[field] = fromColorPicker
    ? mergePickedHexWithSource(currentValue, rawValue)
    : rawValue;
  state.previewBackground.preset = 'custom';
  renderAssetPanel();
  renderPreview();
}

function updateMotionField(field, rawValue) {
  pushUndoCheckpoint();
  const nextAsset = cloneData(state.asset);
  ensureMotion(nextAsset);
  nextAsset.motion[field] = rawValue;
  commitAsset(nextAsset, { renderPanels: true });
}

function updateSelectedLayerField(field, rawValue, fromColorPicker = false) {
  pushUndoCheckpoint();
  const layerIndex = getSelectedLayerIndex();
  if (layerIndex < 0) return;

  const nextAsset = cloneData(state.asset);
  const layer = nextAsset.layers[layerIndex];

  if (['radius', 'glowScale', 'thickness', 'spacing', 'falloff'].includes(field)) {
    if (rawValue === '') {
      delete layer[field];
    } else {
      layer[field] = Number(rawValue);
    }
  } else if (field === 'segments') {
    layer.segments = Math.max(1, Math.round(Number(rawValue) || 1));
  } else if (field === 'color' || field === 'glowColor') {
    const currentValue = layer[field] ?? (field === 'glowColor' ? layer.color : '#ffffff');
    layer[field] = fromColorPicker ? mergePickedHexWithSource(currentValue, rawValue) : rawValue;
  } else {
    layer[field] = rawValue;
  }

  if (field === 'id') {
    clearCurveEditors();
    state.selectedLayerId = rawValue;
    commitAsset(nextAsset, { renderPanels: true });
    return;
  }

  commitAsset(nextAsset);

  if (field === 'color') {
    renderLayersPanel();
  }
}

function getCurveTrack(scope, trackName) {
  if (scope === 'motion') {
    return cloneData(state.asset.motion?.tracks?.[trackName] ?? []);
  }

  const layer = getSelectedLayer();
  return cloneData(layer?.tracks?.[trackName] ?? []);
}

function setRawTrack(scope, trackName, nextTrack, { rerenderPanels = false } = {}) {
  pushUndoCheckpoint();
  const normalizedTrack = normalizeTrack(nextTrack);
  const nextAsset = cloneData(state.asset);

  if (scope === 'motion') {
    ensureMotion(nextAsset);
    nextAsset.motion.tracks ??= {};

    if (normalizedTrack.length > 0) {
      nextAsset.motion.tracks[trackName] = normalizedTrack;
    } else {
      delete nextAsset.motion.tracks[trackName];
    }
  } else {
    const layerIndex = getSelectedLayerIndex();
    if (layerIndex < 0) return;
    const layer = nextAsset.layers[layerIndex];
    layer.tracks ??= {};

    if (normalizedTrack.length > 0) {
      layer.tracks[trackName] = normalizedTrack;
    } else {
      delete layer.tracks[trackName];
    }
  }

  commitAsset(nextAsset, { renderPanels: rerenderPanels });
}

function setCurveValueRange(scope, trackName, bound, rawValue) {
  pushUndoCheckpoint();
  const curveState = ensureCurveState(scope, trackName);
  const numericValue = Number(rawValue);
  if (!Number.isFinite(numericValue)) return;

  if (bound === 'min') {
    curveState.rangeMin = numericValue;
    if (numericValue >= curveState.rangeMax) {
      curveState.rangeMax = numericValue + 0.001;
    }
  } else {
    curveState.rangeMax = numericValue;
    if (numericValue <= curveState.rangeMin) {
      curveState.rangeMin = numericValue - 0.001;
    }
  }

  curveState.modified = true;
  refreshCurveState(curveState);
  syncJsonFromAsset();
  renderPreview();
  rerenderCurveOwner(scope);
}

function addKeyframe(scope, trackName) {
  if (hasCurveState(scope, trackName)) {
    pushUndoCheckpoint();
    const curveState = ensureCurveState(scope, trackName);
    const points = curveState.points;
    const last = points[points.length - 1];
    const nextAt = last ? clamp01(last.at + 0.1) : 0;
    const range = getCurveValueRange(curveState);
    const nextValue = clamp(
      last ? last.value : getCurveDefaultValue(trackName),
      range.min,
      range.max,
    );
    points.push({
      at: nextAt,
      value: nextValue,
      inX: nextAt,
      inY: nextValue,
      outX: nextAt,
      outY: nextValue,
    });
    curveState.modified = true;
    refreshCurveState(curveState);
    syncJsonFromAsset();
    renderPreview();
    renderPanels();
    return;
  }

  const track = getCurveTrack(scope, trackName);
  const last = track[track.length - 1];
  const nextAt = last ? clamp01(last.at + 0.1) : 0;
  const nextValue = last ? last.value : ['scale', 'alpha'].includes(trackName) ? 1 : 0;
  track.push({ at: nextAt, value: nextValue });
  setRawTrack(scope, trackName, track, { rerenderPanels: true });
}

function removeKeyframe(scope, trackName, index) {
  if (hasCurveState(scope, trackName)) {
    pushUndoCheckpoint();
    const curveState = ensureCurveState(scope, trackName);
    curveState.points.splice(index, 1);

    if (curveState.points.length === 0) {
      delete state.curveStates[getCurveStateKey(scope, trackName)];
      state.curveEditorModes[getCurveStateKey(scope, trackName)] = 'list';
    } else {
      curveState.modified = true;
      refreshCurveState(curveState);
    }

    syncJsonFromAsset();
    renderPreview();
    renderPanels();
    return;
  }

  const track = getCurveTrack(scope, trackName);
  track.splice(index, 1);
  setRawTrack(scope, trackName, track, { rerenderPanels: true });
}

function sortKeyframes(scope, trackName) {
  if (hasCurveState(scope, trackName)) {
    pushUndoCheckpoint();
    const curveState = ensureCurveState(scope, trackName);
    curveState.points.sort((left, right) => left.at - right.at);
    curveState.modified = true;
    refreshCurveState(curveState);
    syncJsonFromAsset();
    renderPreview();
    renderPanels();
    return;
  }

  const track = getCurveTrack(scope, trackName).sort((left, right) => left.at - right.at);
  setRawTrack(scope, trackName, track, { rerenderPanels: true });
}

function clearKeyframes(scope, trackName) {
  delete state.curveStates[getCurveStateKey(scope, trackName)];
  state.curveEditorModes[getCurveStateKey(scope, trackName)] = 'list';
  setRawTrack(scope, trackName, [], { rerenderPanels: true });
}

function updateKeyframe(scope, trackName, index, field, rawValue) {
  if (hasCurveState(scope, trackName)) {
    pushUndoCheckpoint();
    const curveState = ensureCurveState(scope, trackName);
    const point = curveState.points[index];
    if (!point) return;
    const range = getCurveValueRange(curveState);

    const numericValue = Number(rawValue);
    const nextValue = Number.isFinite(numericValue) ? numericValue : 0;

    if (field === 'at') {
      const previous = curveState.points[index - 1];
      const next = curveState.points[index + 1];
      const clampedAt = clamp(nextValue, previous ? previous.at + 0.001 : 0, next ? next.at - 0.001 : 1);
      const deltaAt = clampedAt - point.at;
      point.at = clampedAt;
      point.inX += deltaAt;
      point.outX += deltaAt;
    } else {
      const clampedValue = clamp(nextValue, range.min, range.max);
      const deltaValue = clampedValue - point.value;
      point.value = clampedValue;
      point.inY += deltaValue;
      point.outY += deltaValue;
    }

    curveState.modified = true;
    refreshCurveState(curveState);
    syncJsonFromAsset();
    renderPreview();
    return;
  }

  const track = getCurveTrack(scope, trackName);
  if (!track[index]) return;

  const nextValue = Number(rawValue);
  track[index][field] = Number.isFinite(nextValue) ? nextValue : 0;
  setRawTrack(scope, trackName, track);
}

function selectLayer(layerId) {
  state.selectedLayerId = layerId;
  ensureSelection();
  renderLayersPanel();
  renderLayerInspector();
}

function duplicateSelectedLayer() {
  pushUndoCheckpoint();
  const layerIndex = getSelectedLayerIndex();
  if (layerIndex < 0) return;

  const nextAsset = cloneData(state.asset);
  const source = cloneData(nextAsset.layers[layerIndex]);
  const usedIds = new Set(nextAsset.layers.map((layer) => layer.id));
  let suffix = 2;
  let nextId = `${source.id}-copy`;

  while (usedIds.has(nextId)) {
    nextId = `${source.id}-copy-${suffix}`;
    suffix += 1;
  }

  source.id = nextId;
  nextAsset.layers.splice(layerIndex + 1, 0, source);
  state.selectedLayerId = source.id;
  commitAsset(nextAsset, { renderPanels: true });
}

function removeSelectedLayer() {
  pushUndoCheckpoint();
  const layerIndex = getSelectedLayerIndex();
  if (layerIndex < 0) return;

  const nextAsset = cloneData(state.asset);
  nextAsset.layers.splice(layerIndex, 1);
  state.selectedLayerId = nextAsset.layers[layerIndex]?.id ?? nextAsset.layers[layerIndex - 1]?.id ?? '';
  commitAsset(nextAsset, { renderPanels: true });
}

function moveSelectedLayer(direction) {
  pushUndoCheckpoint();
  const layerIndex = getSelectedLayerIndex();
  if (layerIndex < 0) return;

  const nextIndex = layerIndex + direction;
  if (nextIndex < 0 || nextIndex >= state.asset.layers.length) return;

  const nextAsset = cloneData(state.asset);
  const [layer] = nextAsset.layers.splice(layerIndex, 1);
  nextAsset.layers.splice(nextIndex, 0, layer);
  state.selectedLayerId = layer.id;
  commitAsset(nextAsset, { renderPanels: true });
}

function addLayer(type) {
  pushUndoCheckpoint();
  const nextAsset = cloneData(state.asset);
  const layer = createLayer(type);
  nextAsset.layers.push(layer);
  state.selectedLayerId = layer.id;
  state.selectedLayerTrack = TRACKS_BY_LAYER_TYPE[type][0];
  commitAsset(nextAsset, { renderPanels: true });
}

function loadAssetFromObject(asset, { fileHandle = null, fileName = '' } = {}) {
  state.fileHandle = fileHandle;
  state.fileName = fileName;
  state.progress = 0;
  state.playing = true;
  state.lastFrameTime = 0;
  clearCurveEditors();
  clearHistory();
  ui.togglePlaybackButton.textContent = 'Pause';
  commitAsset(asset, { renderPanels: true, resetProgress: true });
  setSaveStatus(
    fileName
      ? `Loaded ${fileName}. You can now save directly back to that file.`
      : 'Loaded effect. Save directly if a local file is attached, or download JSON.',
    'success',
  );
}

async function loadDemoEffect(effectId) {
  const path = DEMO_EFFECTS[effectId];
  if (!path) return;

  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const asset = await response.json();
    loadAssetFromObject(asset, { fileName: `${effectId}.json` });
  } catch (error) {
    setSaveStatus(
      `Could not load ${effectId} from the repo. Serve the repo root with http.server and open /tools/vfx-editor/.`,
      'error',
    );
    console.error(error);
  }
}

async function openEffectFile() {
  try {
    if ('showOpenFilePicker' in window) {
      const [handle] = await window.showOpenFilePicker({
        excludeAcceptAllOption: false,
        multiple: false,
        types: [
          {
            description: 'VFX JSON',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });

      const file = await handle.getFile();
      const text = await file.text();
      const asset = JSON.parse(text);
      loadAssetFromObject(asset, { fileHandle: handle, fileName: file.name });
      return;
    }

    ui.fallbackFileInput.click();
  } catch (error) {
    if (error?.name === 'AbortError') return;
    setSaveStatus(`Could not open file: ${error.message}`, 'error');
  }
}

async function saveToAttachedFile() {
  try {
    const exportedAsset = buildExportAsset();

    if (state.fileHandle && 'createWritable' in state.fileHandle) {
      const writable = await state.fileHandle.createWritable();
      await writable.write(stringifyAsset(exportedAsset));
      await writable.close();
      setSaveStatus(`Saved directly to ${state.fileName}.`, 'success');
      return;
    }

    if ('showSaveFilePicker' in window) {
      const handle = await window.showSaveFilePicker({
        suggestedName: `${state.asset.id || 'effect'}.json`,
        types: [
          {
            description: 'VFX JSON',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(stringifyAsset(exportedAsset));
      await writable.close();
      state.fileHandle = handle;
      state.fileName = `${state.asset.id || 'effect'}.json`;
      renderPanels();
      setSaveStatus(`Saved directly to ${state.fileName}.`, 'success');
      return;
    }

    downloadJson();
    setSaveStatus('Direct save is not supported in this browser, so the file was downloaded instead.', 'info');
  } catch (error) {
    if (error?.name === 'AbortError') return;
    setSaveStatus(`Could not save file: ${error.message}`, 'error');
  }
}

function downloadJson() {
  const blob = new Blob([stringifyAsset(buildExportAsset())], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${state.asset.id || 'effect'}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function copyJson() {
  try {
    await navigator.clipboard.writeText(stringifyAsset(buildExportAsset()));
    setSaveStatus('JSON copied to the clipboard.', 'success');
  } catch (error) {
    setSaveStatus(`Could not copy JSON: ${error.message}`, 'error');
  }
}

function applyRawJson() {
  try {
    const asset = JSON.parse(ui.jsonEditor.value);
    state.fileHandle = state.fileHandle ?? null;
    clearCurveEditors();
    loadAssetFromObject(asset, {
      fileHandle: state.fileHandle,
      fileName: state.fileName,
    });
    setJsonStatus('Raw JSON applied to the visual editor.', 'success');
  } catch (error) {
    setJsonStatus(`Could not apply JSON: ${error.message}`, 'error');
  }
}

function updateInstanceField(field, rawValue) {
  pushUndoCheckpoint();
  const nextValue = Number(rawValue);
  state.instance[field] = Number.isFinite(nextValue) ? nextValue : 0;
  renderPreview();
  renderAssetPanel();
}

function handleAssetPanelInput(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;

  if (target.dataset.curvePresetSelect === 'true') {
    if (target.value) {
      applyCurvePreset(target.dataset.curveScope, target.dataset.trackName, target.value);
    }
    return;
  }

  if (target.dataset.assetField) {
    const field = target.dataset.assetField;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    updateAssetField(field, value);
    return;
  }

  if (target.dataset.previewField) {
    updatePreviewField(
      target.dataset.previewField,
      target.value,
      target.dataset.colorPicker === 'true',
    );
    return;
  }

  if (target.dataset.motionField) {
    updateMotionField(target.dataset.motionField, target.value);
    return;
  }

  if (target.dataset.anchorField) {
    updateInstanceField(target.dataset.anchorField, target.value);
    return;
  }

  if (target.dataset.rangeField && target.dataset.curveScope && target.dataset.trackName) {
    setCurveValueRange(
      target.dataset.curveScope,
      target.dataset.trackName,
      target.dataset.rangeField,
      target.value,
    );
    return;
  }

  if (target.dataset.curveScope && target.dataset.trackName && target.dataset.keyIndex != null) {
    updateKeyframe(
      target.dataset.curveScope,
      target.dataset.trackName,
      Number(target.dataset.keyIndex),
      target.dataset.keyField,
      target.value,
    );
  }
}

function handleAssetPanelClick(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const { action, curveScope, trackName } = button.dataset;

  if (action === 'toggle-collapse') {
    togglePanelCollapse(button.dataset.panelKey);
    renderAssetPanel();
  } else if (action === 'set-editor-mode') {
    setCurveEditorMode(curveScope, trackName, button.dataset.editorMode);
    renderAssetPanel();
  } else if (action === 'apply-curve-preset') {
    applyCurvePreset(curveScope, trackName, button.dataset.presetId);
  } else if (action === 'add-keyframe') {
    addKeyframe(curveScope, trackName);
  } else if (action === 'remove-keyframe') {
    removeKeyframe(curveScope, trackName, Number(button.dataset.keyIndex));
  } else if (action === 'sort-keyframes') {
    sortKeyframes(curveScope, trackName);
  } else if (action === 'clear-keyframes') {
    clearKeyframes(curveScope, trackName);
  }
}

function handleLayersPanelClick(event) {
  const button = event.target.closest('button');
  if (!button) return;

  const { action, layerType, layerId, direction } = button.dataset;

  if (action === 'toggle-collapse') {
    togglePanelCollapse(button.dataset.panelKey);
    renderLayersPanel();
  } else if (action === 'add-layer') {
    addLayer(layerType);
  } else if (action === 'duplicate-layer') {
    duplicateSelectedLayer();
  } else if (action === 'remove-layer') {
    removeSelectedLayer();
  } else if (action === 'move-layer') {
    moveSelectedLayer(Number(direction));
  } else if (action === 'select-layer') {
    selectLayer(layerId);
  }
}

function handleLayerInspectorInput(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;

  if (target.dataset.curvePresetSelect === 'true') {
    if (target.value) {
      applyCurvePreset(target.dataset.curveScope, target.dataset.trackName, target.value);
    }
    return;
  }

  if (target.dataset.layerField) {
    updateSelectedLayerField(
      target.dataset.layerField,
      target.value,
      target.dataset.colorPicker === 'true',
    );
    return;
  }

  if (target.dataset.rangeField && target.dataset.curveScope && target.dataset.trackName) {
    setCurveValueRange(
      target.dataset.curveScope,
      target.dataset.trackName,
      target.dataset.rangeField,
      target.value,
    );
    return;
  }

  if (target.dataset.curveScope && target.dataset.trackName && target.dataset.keyIndex != null) {
    updateKeyframe(
      target.dataset.curveScope,
      target.dataset.trackName,
      Number(target.dataset.keyIndex),
      target.dataset.keyField,
      target.value,
    );
  }
}

function handleLayerInspectorClick(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const { action, curveScope, trackName } = button.dataset;

  if (action === 'toggle-collapse') {
    togglePanelCollapse(button.dataset.panelKey);
    renderLayerInspector();
  } else if (action === 'select-track') {
    state.selectedLayerTrack = trackName;
    renderLayerInspector();
  } else if (action === 'set-editor-mode') {
    setCurveEditorMode(curveScope, trackName, button.dataset.editorMode);
    renderLayerInspector();
  } else if (action === 'apply-curve-preset') {
    applyCurvePreset(curveScope, trackName, button.dataset.presetId);
  } else if (action === 'add-keyframe') {
    addKeyframe(curveScope, trackName);
  } else if (action === 'remove-keyframe') {
    removeKeyframe(curveScope, trackName, Number(button.dataset.keyIndex));
  } else if (action === 'sort-keyframes') {
    sortKeyframes(curveScope, trackName);
  } else if (action === 'clear-keyframes') {
    clearKeyframes(curveScope, trackName);
  }
}

function handleFallbackFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  file
    .text()
    .then((text) => {
      const asset = JSON.parse(text);
      loadAssetFromObject(asset, { fileName: file.name });
    })
    .catch((error) => {
      setSaveStatus(`Could not read ${file.name}: ${error.message}`, 'error');
    })
    .finally(() => {
      ui.fallbackFileInput.value = '';
    });
}

function getSvgPoint(clientX, clientY) {
  const bounds = ui.stageSvg.getBoundingClientRect();
  return {
    x: clamp(((clientX - bounds.left) / bounds.width) * STAGE.width, 0, STAGE.width),
    y: clamp(((clientY - bounds.top) / bounds.height) * STAGE.height, 0, STAGE.height),
  };
}

function handleStagePointerDown(event) {
  const anchor = event.target.closest('[data-anchor]');
  if (!anchor) return;

  beginHistoryGesture();
  state.dragTarget = anchor.dataset.anchor;
}

function handleStagePointerMove(event) {
  if (!state.dragTarget) return;

  const point = getSvgPoint(event.clientX, event.clientY);

  if (state.dragTarget === 'start') {
    state.instance.x = point.x;
    state.instance.y = point.y;
  } else if (state.dragTarget === 'target') {
    state.instance.targetX = point.x;
    state.instance.targetY = point.y;
  }

  renderPreview();
  renderAssetPanel();
}

function handleStagePointerUp() {
  endHistoryGesture();
  state.dragTarget = null;
}

function getCurveCanvas(scope, trackName) {
  return document.querySelector(
    `[data-curve-canvas="true"][data-curve-scope="${scope}"][data-track-name="${trackName}"]`,
  );
}

function rerenderCurveOwner(scope) {
  if (scope === 'motion') {
    renderAssetPanel();
  } else {
    renderLayerInspector();
  }
}

function getCurveCanvasPoint(clientX, clientY, canvas, range) {
  const bounds = canvas.getBoundingClientRect();
  const localX = ((clientX - bounds.left) / bounds.width) * CURVE_EDITOR.width;
  const localY = ((clientY - bounds.top) / bounds.height) * CURVE_EDITOR.height;
  return screenToCurvePoint(localX, localY, range);
}

function beginCurveDrag(button) {
  beginHistoryGesture();
  state.activeCurveDrag = {
    scope: button.dataset.curveScope,
    trackName: button.dataset.trackName,
    handleType: button.dataset.handleType,
    pointIndex: Number(button.dataset.pointIndex),
  };
}

function updateCurveDrag(clientX, clientY) {
  if (!state.activeCurveDrag) return;

  const { scope, trackName, handleType, pointIndex } = state.activeCurveDrag;
  const curveState = ensureCurveState(scope, trackName);
  const canvas = getCurveCanvas(scope, trackName);
  if (!canvas) return;

  const range = getCurveValueRange(curveState);
  const targetPoint = getCurveCanvasPoint(clientX, clientY, canvas, range);
  const point = curveState.points[pointIndex];
  if (!point) return;

  const previous = curveState.points[pointIndex - 1];
  const next = curveState.points[pointIndex + 1];

  if (handleType === 'anchor') {
    const newAt = clamp(targetPoint.at, previous ? previous.at + 0.001 : 0, next ? next.at - 0.001 : 1);
    const deltaAt = newAt - point.at;
    const deltaValue = targetPoint.value - point.value;

    point.at = newAt;
    point.value = targetPoint.value;
    point.inX += deltaAt;
    point.inY += deltaValue;
    point.outX += deltaAt;
    point.outY += deltaValue;
  } else if (handleType === 'in') {
    point.inX = clamp(targetPoint.at, previous ? previous.at : point.at, point.at);
    point.inY = targetPoint.value;
  } else if (handleType === 'out') {
    point.outX = clamp(targetPoint.at, point.at, next ? next.at : point.at);
    point.outY = targetPoint.value;
  }

  curveState.modified = true;
  refreshCurveState(curveState);
  syncJsonFromAsset();
  renderPreview();
  rerenderCurveOwner(scope);
}

function endCurveDrag() {
  endHistoryGesture();
  state.activeCurveDrag = null;
}

function handleCurvePointerDown(event) {
  const handle = event.target.closest('[data-action="curve-handle"]');
  if (!handle) return;

  beginCurveDrag(handle);
  event.preventDefault();
}

function handleGlobalKeyDown(event) {
  const isMac = navigator.platform.toUpperCase().includes('MAC');
  const primaryModifier = isMac ? event.metaKey : event.ctrlKey;

  if (!primaryModifier || event.altKey) {
    return;
  }

  const key = event.key.toLowerCase();

  if (key === 'z') {
    event.preventDefault();
    if (event.shiftKey) {
      redoHistory();
    } else {
      undoHistory();
    }
    return;
  }

  if (key === 'y' && !isMac) {
    event.preventDefault();
    redoHistory();
  }
}

function resetTemplate() {
  state.fileHandle = null;
  state.fileName = '';
  state.instance = createInstance();
  state.selectedLayerId = 'trail';
  state.selectedLayerTrack = 'scale';
  state.progress = 0;
  state.playing = true;
  state.lastFrameTime = 0;
  clearCurveEditors();
  clearHistory();
  ui.togglePlaybackButton.textContent = 'Pause';
  commitAsset(createStarterAsset(), { renderPanels: true, resetProgress: true });
  setSaveStatus('Reset to the built-in fireball travel template.', 'success');
}

function animationLoop(timestamp) {
  if (!state.lastFrameTime) {
    state.lastFrameTime = timestamp;
  }

  if (state.playing) {
    const deltaMs = timestamp - state.lastFrameTime;
    const durationMs = Math.max(1, Number(state.asset.durationMs) || 1);
    let nextProgress = state.progress + deltaMs / durationMs;

    if (state.asset.loop) {
      nextProgress %= 1;
    } else if (nextProgress >= 1) {
      nextProgress = 1;
      state.playing = false;
      ui.togglePlaybackButton.textContent = 'Play';
    }

    state.progress = clamp01(nextProgress);
    renderPreview();
  }

  state.lastFrameTime = timestamp;
  window.requestAnimationFrame(animationLoop);
}

function wireEvents() {
  ui.openFileButton.addEventListener('click', openEffectFile);
  ui.saveFileButton.addEventListener('click', saveToAttachedFile);
  ui.downloadFileButton.addEventListener('click', downloadJson);
  ui.copyJsonButton.addEventListener('click', copyJson);
  ui.jsonCollapseButton.addEventListener('click', () => {
    togglePanelCollapse('jsonPanel');
    renderStaticPanelState();
  });
  ui.applyJsonButton.addEventListener('click', applyRawJson);
  ui.fallbackFileInput.addEventListener('change', handleFallbackFileChange);

  for (const button of document.querySelectorAll('[data-demo-effect]')) {
    button.addEventListener('click', () => {
      loadDemoEffect(button.dataset.demoEffect);
    });
  }

  ui.togglePlaybackButton.addEventListener('click', () => {
    state.playing = !state.playing;
    state.lastFrameTime = 0;
    ui.togglePlaybackButton.textContent = state.playing ? 'Pause' : 'Play';
  });

  ui.restartPlaybackButton.addEventListener('click', () => {
    state.progress = 0;
    state.playing = true;
    state.lastFrameTime = 0;
    ui.togglePlaybackButton.textContent = 'Pause';
    renderPreview();
  });

  ui.resetTemplateButton.addEventListener('click', resetTemplate);

  ui.progressSlider.addEventListener('input', (event) => {
    state.progress = clamp01(Number(event.target.value));
    state.playing = false;
    ui.togglePlaybackButton.textContent = 'Play';
    renderPreview();
  });

  ui.jsonEditor.addEventListener('input', () => {
    state.jsonDraft = ui.jsonEditor.value;
    state.jsonDirty = true;
    setJsonStatus('Raw JSON has local edits. Click "Apply Raw JSON" to load it into the visual editor.');
  });

  ui.assetPanel.addEventListener('input', handleAssetPanelInput);
  ui.assetPanel.addEventListener('change', handleAssetPanelInput);
  ui.assetPanel.addEventListener('click', handleAssetPanelClick);
  ui.assetPanel.addEventListener('pointerdown', handleCurvePointerDown);

  ui.layersPanel.addEventListener('click', handleLayersPanelClick);

  ui.layerInspectorPanel.addEventListener('input', handleLayerInspectorInput);
  ui.layerInspectorPanel.addEventListener('change', handleLayerInspectorInput);
  ui.layerInspectorPanel.addEventListener('click', handleLayerInspectorClick);
  ui.layerInspectorPanel.addEventListener('pointerdown', handleCurvePointerDown);

  ui.stageSvg.addEventListener('pointerdown', handleStagePointerDown);
  ui.stageSvg.addEventListener('pointermove', handleStagePointerMove);
  ui.stageSvg.addEventListener('pointerup', handleStagePointerUp);
  ui.stageSvg.addEventListener('pointerleave', handleStagePointerUp);
  window.addEventListener('pointerup', handleStagePointerUp);
  window.addEventListener('pointermove', (event) => {
    updateCurveDrag(event.clientX, event.clientY);
  });
  window.addEventListener('pointerup', endCurveDrag);
  window.addEventListener('keydown', handleGlobalKeyDown);
}

function init() {
  renderPanels();
  renderPreview();
  syncJsonFromAsset();
  setSaveStatus('Open an effect JSON or quick-load one from the repo.');
  ui.togglePlaybackButton.textContent = 'Pause';
  wireEvents();
  window.requestAnimationFrame(animationLoop);
}

init();
