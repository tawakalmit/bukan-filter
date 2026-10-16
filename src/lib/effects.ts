export interface PaletteDef {
  id: string;
  name: string;
  slug: string;
  number: string;
  colorLabel: string;
  shadowName: string;
  highlightName: string;
  subtitle: string;
  colors: {
    contrast: { shadow: [number, number, number]; highlight: [number, number, number] };
    classic: { shadow: [number, number, number]; highlight: [number, number, number] };
  };
}

export const PRESETS: Record<string, PaletteDef> = Object.freeze({
  orange: {
    id: 'orange',
    name: 'Bara Jingga',
    slug: 'bara-jingga',
    number: '01',
    colorLabel: 'oranye pekat',
    shadowName: 'Bara Gosong',
    highlightName: 'Jingga Menyala',
    subtitle: 'Langit pekat yang seharusnya tidak pernah ada.',
    colors: {
      contrast: { shadow: [66, 20, 7], highlight: [255, 145, 35] },
      classic: { shadow: [110, 41, 14], highlight: [255, 177, 73] },
    },
  },
  grey: {
    id: 'grey',
    name: 'Kabut Asap',
    slug: 'kabut-asap',
    number: '02',
    colorLabel: 'abu-abu arang',
    shadowName: 'Arang Gelap',
    highlightName: 'Abu Kelabu',
    subtitle: 'Tabir partikel asap yang menelan cakrawala kota.',
    colors: {
      contrast: { shadow: [20, 20, 20], highlight: [230, 230, 230] },
      classic: { shadow: [60, 60, 60], highlight: [195, 195, 195] },
    },
  },
  ihsg: {
    id: 'ihsg',
    name: 'Rupiah Melemah',
    slug: 'rupiah-melemah',
    number: '03',
    colorLabel: 'merah darurat',
    shadowName: 'Merah Pekat',
    highlightName: 'Merah Terang',
    subtitle: 'Alarm saat kualitas udara masuk kategori berbahaya.',
    colors: {
      contrast: { shadow: [69, 3, 20], highlight: [255, 58, 77] },
      classic: { shadow: [118, 13, 34], highlight: [255, 104, 116] },
    },
  },
});

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export interface CropRect {
  x: number;
  y: number;
  size: number;
}

export function cropRect(width: number, height: number, zoom = 1, panX = 0, panY = 0): CropRect {
  if (!(width > 0 && height > 0 && zoom >= 1)) {
    return { x: 0, y: 0, size: Math.min(width || 1, height || 1) };
  }
  const size = Math.min(width, height) / zoom;
  return {
    x: ((width - size) * (clamp(panX, -1, 1) + 1)) / 2,
    y: ((height - size) * (clamp(panY, -1, 1) + 1)) / 2,
    size,
  };
}

export function applyDuotone(
  data: Uint8ClampedArray,
  intensity = 1,
  {
    classic = false,
    reverse = false,
    palette = PRESETS.orange,
  }: { classic?: boolean; reverse?: boolean; palette?: PaletteDef } = {}
): Uint8ClampedArray {
  const amount = clamp(intensity, 0, 1);
  let darkest = Infinity;
  let lightest = -Infinity;

  const luminance = (i: number) =>
    data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;

  for (let i = 0; i < data.length; i += 4) {
    if (!data[i + 3]) continue;
    const light = luminance(i);
    darkest = Math.min(darkest, light);
    lightest = Math.max(lightest, light);
  }

  const pair = palette.colors[classic ? 'classic' : 'contrast'];
  const shadow = reverse ? pair.highlight : pair.shadow;
  const highlight = reverse ? pair.shadow : pair.highlight;
  const span = lightest - darkest;

  for (let i = 0; i < data.length; i += 4) {
    if (!data[i + 3]) continue;
    const light = luminance(i);
    const normalized = clamp(span > 0 ? (light - darkest) / span : light / 255, 0, 1);
    const tone =
      normalized < 0.5
        ? 0.5 * Math.pow(2 * normalized, 1.8)
        : 1 - 0.5 * Math.pow(2 * (1 - normalized), 1.8);

    for (let channel = 0; channel < 3; channel++) {
      const mapped = shadow[channel] + (highlight[channel] - shadow[channel]) * tone;
      data[i + channel] = Math.round(light * (1 - amount) + mapped * amount);
    }
  }
  return data;
}

const smooth = (value: number) => value * value * (3 - 2 * value);

function noise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);

  const hash = (a: number, b: number) => {
    let value = Math.imul(a, 374761393) + Math.imul(b, 668265263) + 1376312589;
    value = Math.imul(value ^ (value >>> 13), 1274126177);
    return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
  };

  const top = hash(ix, iy) * (1 - fx) + hash(ix + 1, iy) * fx;
  const bottom = hash(ix, iy + 1) * (1 - fx) + hash(ix + 1, iy + 1) * fx;
  return top * (1 - fy) + bottom * fy;
}

const smokeSize = 192;
let smokeField: Float32Array | null = null;

function getSmokeDensity(): Float32Array {
  if (smokeField) return smokeField;
  smokeField = new Float32Array(smokeSize * smokeSize);
  for (let y = 0; y < smokeSize; y++) {
    for (let x = 0; x < smokeSize; x++) {
      const u = x / (smokeSize - 1);
      const v = y / (smokeSize - 1);
      const wx = u * 4.5 + noise(u * 2.5 + 13, v * 2.5 + 7) * 2.2;
      const wy = v * 4.5 + noise(u * 2.5 + 5, v * 2.5 + 19) * 2.2;
      const cloud =
        noise(wx, wy) * 0.57 +
        noise(wx * 2, wy * 2) * 0.27 +
        noise(wx * 4, wy * 4) * 0.11 +
        noise(wx * 8, wy * 8) * 0.05;
      const centralOpening = Math.exp(
        -1.5 * (Math.pow((u - 0.5) / 0.25, 2) + Math.pow((v - 0.43) / 0.32, 2))
      );
      smokeField[y * smokeSize + x] =
        clamp((cloud - 0.24) * 2.1, 0, 1) * (1 - centralOpening * 0.88);
    }
  }
  return smokeField;
}

export function applySmokeVeil(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: number,
  { classic = false, reverse = false }: { classic?: boolean; reverse?: boolean } = {}
): Uint8ClampedArray {
  if (width < 1 || height < 1 || data.length !== width * height * 4) return data;
  const amount = clamp(intensity, 0, 1);
  if (!amount) return data;

  const field = getSmokeDensity();
  const smokeColor = reverse ? 34 : 222;
  const strength = amount * (classic ? 0.52 : 0.82);

  for (let y = 0; y < height; y++) {
    const fy = (y / Math.max(1, height - 1)) * (smokeSize - 1);
    const top = Math.min(smokeSize - 2, Math.floor(fy));
    const dy = fy - top;

    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (!data[i + 3]) continue;
      const fx = (x / Math.max(1, width - 1)) * (smokeSize - 1);
      const left = Math.min(smokeSize - 2, Math.floor(fx));
      const dx = fx - left;
      const row = top * smokeSize + left;
      const density =
        (field[row] * (1 - dx) + field[row + 1] * dx) * (1 - dy) +
        (field[row + smokeSize] * (1 - dx) + field[row + smokeSize + 1] * dx) * dy;
      const opacity = density * strength;

      for (let channel = 0; channel < 3; channel++) {
        data[i + channel] = Math.round(
          data[i + channel] * (1 - opacity) + smokeColor * opacity
        );
      }
    }
  }
  return data;
}

export function wrapCaption(
  text: string,
  measure: (t: string) => number,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of text.trim().split(/\s+/u).filter(Boolean)) {
    const candidate = current ? `${current} ${word}` : word;
    if (measure(candidate) <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = '';
    for (const letter of word) {
      if (current && measure(current + letter) > maxWidth) {
        lines.push(current);
        current = '';
      }
      current += letter;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function renderPortrait(
  canvas: HTMLCanvasElement,
  source: HTMLImageElement | HTMLCanvasElement,
  {
    paletteId = 'orange',
    intensity = 0.8,
    classic = false,
    reverse = false,
    zoom = 1,
    panX = 0,
    panY = 0,
    original = false,
    customText = '',
  }: {
    paletteId?: string;
    intensity?: number;
    classic?: boolean;
    reverse?: boolean;
    zoom?: number;
    panX?: number;
    panY?: number;
    original?: boolean;
    customText?: string;
  } = {}
): void {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const { width, height } = canvas;
  const sWidth = ('naturalWidth' in source ? source.naturalWidth : source.width) || 1;
  const sHeight = ('naturalHeight' in source ? source.naturalHeight : source.height) || 1;
  const { x, y, size } = cropRect(sWidth, sHeight, zoom, panX, panY);

  ctx.fillStyle = '#f5f1e8';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, x, y, size, size, 0, 0, width, height);

  if (!original) {
    const pixels = ctx.getImageData(0, 0, width, height);
    const palette = PRESETS[paletteId] || PRESETS.orange;
    applyDuotone(pixels.data, intensity, { palette, classic, reverse });
    if (paletteId === 'grey') {
      applySmokeVeil(pixels.data, width, height, intensity, { classic, reverse });
    }
    ctx.putImageData(pixels, 0, 0);

    // Render retro campaign message banner if provided
    const trimmedMessage = customText.trim();
    if (trimmedMessage && width >= 400) {
      let fontSize = Math.round((width / 1080) * 44);
      let lines: string[] = [];
      const maxWidth = width * 0.82;

      do {
        ctx.font = `bold ${fontSize}px 'PixeloidSans-Bold', 'PixeloidSans', Arial, sans-serif`;
        lines = wrapCaption(trimmedMessage, (text) => ctx.measureText(text).width, maxWidth);
        if (lines.length <= 2 || fontSize <= 18) break;
        fontSize -= 2;
      } while (true);

      const lineHeight = fontSize * 1.35;
      const bannerHeight = lines.length * lineHeight + (width / 1080) * 36;
      const bannerY = height - (width / 1080) * 230;
      const bannerX = width * 0.08;
      const bannerW = width * 0.84;

      // Retro 3D beveled banner box
      ctx.fillStyle = '#1e242b';
      ctx.fillRect(bannerX, bannerY, bannerW, bannerHeight);

      // Bevel borders
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, Math.round((width / 1080) * 3));
      ctx.beginPath();
      ctx.moveTo(bannerX, bannerY + bannerHeight);
      ctx.lineTo(bannerX, bannerY);
      ctx.lineTo(bannerX + bannerW, bannerY);
      ctx.stroke();

      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(bannerX + bannerW, bannerY);
      ctx.lineTo(bannerX + bannerW, bannerY + bannerHeight);
      ctx.lineTo(bannerX, bannerY + bannerHeight);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff4df';
      ctx.font = `bold ${fontSize}px 'PixeloidSans-Bold', 'PixeloidSans', Arial, sans-serif`;

      lines.forEach((line, index) => {
        ctx.fillText(
          line,
          width / 2,
          bannerY + (width / 1080) * 18 + lineHeight * (index + 0.5),
          maxWidth
        );
      });
      ctx.textBaseline = 'alphabetic';
    }
  }
}
