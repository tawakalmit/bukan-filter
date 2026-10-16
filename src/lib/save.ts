export function imageFile(dataUrl: string, filename: string): File | null {
  if (!dataUrl.startsWith('data:image/png;base64,')) {
    throw new TypeError('Expected a PNG image');
  }
  if (typeof File === 'undefined') return null;
  const binary = atob(dataUrl.slice('data:image/png;base64,'.length));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: 'image/png' });
}

export function canShareImage(file: File | null): boolean {
  if (
    !file ||
    typeof navigator === 'undefined' ||
    typeof navigator.share !== 'function' ||
    typeof navigator.canShare !== 'function'
  ) {
    return false;
  }
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

export async function shareImage(file: File | null): Promise<'shared' | 'cancelled' | 'unavailable' | 'failed'> {
  if (!file || !canShareImage(file)) return 'unavailable';
  try {
    await navigator.share({
      title: 'Bukan Sekadar Filter — Foto Profil Sadar Karhutla',
      text: 'Pasang pengingat di foto profilmu. Langit jingga bukan estetika, kawal hak udara bersih bersama. #BukanSekadarFilter',
      files: [file],
    });
    return 'shared';
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'AbortError') {
      return 'cancelled';
    }
    return 'failed';
  }
}
