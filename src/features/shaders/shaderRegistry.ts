import { Skia } from '@shopify/react-native-skia';

export type SkiaShaderUniformValue = number | number[];
export type SkiaShaderUniformMap = Record<string, SkiaShaderUniformValue>;

type ShaderDefinition = {
  source: string;
  defaults?: SkiaShaderUniformMap;
};

const shaderDefinitions: Record<string, ShaderDefinition> = {
  dissolve: {
    source: `
uniform shader image;
uniform float progress;
uniform float softness;
uniform float2 resolution;

float hash21(float2 p) {
  p = fract(p * float2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

half4 main(float2 xy) {
  half4 color = image.eval(xy);

  if (color.a <= 0.001) {
    return color;
  }

  float2 safeResolution = float2(max(resolution.x, 1.0), max(resolution.y, 1.0));
  float2 uv = xy / safeResolution;
  float2 cell = floor(uv * float2(22.0, 22.0));
  float noise = hash21(cell);
  float visible = 1.0 - smoothstep(progress - softness, progress + softness, noise);

  return half4(color.rgb, color.a * visible);
}
`,
    defaults: {
      progress: 0,
      softness: 0.08,
    },
  },
};

const compiledShaderEffects = new Map<string, ReturnType<typeof Skia.RuntimeEffect.Make>>();

export function getRegisteredSkiaShader(shaderId: string) {
  if (compiledShaderEffects.has(shaderId)) {
    return compiledShaderEffects.get(shaderId) ?? null;
  }

  const definition = shaderDefinitions[shaderId];
  if (!definition) {
    compiledShaderEffects.set(shaderId, null);
    return null;
  }

  const effect = Skia.RuntimeEffect.Make(definition.source);
  if (!effect) {
    console.warn(`Could not compile Skia shader "${shaderId}".`);
  }

  compiledShaderEffects.set(shaderId, effect);
  return effect ?? null;
}

export function resolveSkiaShaderUniforms(
  shaderId: string,
  overrides?: SkiaShaderUniformMap,
): SkiaShaderUniformMap {
  const defaults = shaderDefinitions[shaderId]?.defaults ?? {};
  return { ...defaults, ...(overrides ?? {}) };
}

export function listRegisteredSkiaShaderIds() {
  return Object.keys(shaderDefinitions);
}
