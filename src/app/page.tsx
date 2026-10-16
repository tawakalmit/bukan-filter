'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import PixelButton from '../components/PixelButton';
import SaveModal from '../components/SaveModal';
import CaptionModal, { CAMPAIGN_CAPTION } from '../components/CaptionModal';
import PrivacyModal from '../components/PrivacyModal';
import {
  PRESETS,
  PaletteDef,
  renderPortrait,
} from '../lib/effects';
import { imageFile } from '../lib/save';
import {
  FaUpload,
  FaEye,
  FaRedo,
  FaCheck,
  FaShareAlt,
  FaCopy,
  FaExternalLinkAlt,
  FaInfoCircle,
  FaSlidersH,
  FaFont,
  FaCamera,
  FaCropAlt,
  FaCircleNotch,
} from 'react-icons/fa';

export default function HomePage() {
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const thumbnailRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  // Image source state
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  // Editor configuration
  const [selectedPresetId, setSelectedPresetId] = useState<string>('orange');
  const [intensity, setIntensity] = useState<number>(80);
  const [classicColors, setClassicColors] = useState<boolean>(false);
  const [reverseDuotone, setReverseDuotone] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [showCircleGuide, setShowCircleGuide] = useState<boolean>(false);
  const [viewOriginal, setViewOriginal] = useState<boolean>(false);

  // Custom text banner state
  const [hasTextBanner, setHasTextBanner] = useState<boolean>(false);
  const [bannerText, setBannerText] = useState<string>('KABUT BUKAN ESTETIKA');

  // Status & modal states
  const [statusMessage, setStatusMessage] = useState<string>('Memuat studio foto...');
  const [isErrorStatus, setIsErrorStatus] = useState<boolean>(false);
  const [isSaveOpen, setIsSaveOpen] = useState<boolean>(false);
  const [isCaptionOpen, setIsCaptionOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [copiedCaptionToast, setCopiedCaptionToast] = useState<boolean>(false);

  // Rendered export data
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  const [exportedFile, setExportedFile] = useState<File | null>(null);
  const [exportedFilename, setExportedFilename] = useState<string>('foto-profil-karhutla.png');

  // Load default demo portrait on initial mount
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = '/demo.jpg';
    img.onload = () => {
      setSourceImage(img);
      setStatusMessage('');
    };
    img.onerror = () => {
      setStatusMessage('Gagal memuat foto contoh. Silakan langsung unggah foto.');
      setIsErrorStatus(true);
    };
  }, []);

  // Main render function
  const renderCurrentState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceImage) return;

    renderPortrait(canvas, sourceImage, {
      paletteId: selectedPresetId,
      intensity: intensity / 100,
      classic: classicColors,
      reverse: reverseDuotone,
      zoom: zoom / 100,
      panX: panX / 100,
      panY: panY / 100,
      original: viewOriginal,
      customText: hasTextBanner ? bannerText : '',
    });
  }, [
    sourceImage,
    selectedPresetId,
    intensity,
    classicColors,
    reverseDuotone,
    zoom,
    panX,
    panY,
    viewOriginal,
    hasTextBanner,
    bannerText,
  ]);

  // Thumbnail render function
  const renderThumbnails = useCallback(() => {
    if (!sourceImage) return;
    Object.keys(PRESETS).forEach((pId) => {
      const thumbCanvas = thumbnailRefs.current[pId];
      if (thumbCanvas) {
        renderPortrait(thumbCanvas, sourceImage, {
          paletteId: pId,
          intensity: intensity / 100,
          classic: classicColors,
          reverse: reverseDuotone,
          zoom: zoom / 100,
          panX: panX / 100,
          panY: panY / 100,
          original: false,
        });
      }
    });
  }, [sourceImage, intensity, classicColors, reverseDuotone, zoom, panX, panY]);

  // Trigger re-render whenever state changes
  useEffect(() => {
    renderCurrentState();
    renderThumbnails();
  }, [renderCurrentState, renderThumbnails]);

  // Handle file loading
  const processUploadedFile = (file: File | undefined) => {
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setStatusMessage('Format berkas tidak didukung. Harap pilih JPG, PNG, atau WebP.');
      setIsErrorStatus(true);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setStatusMessage('Ukuran berkas melebihi 25MB. Harap gunakan foto dengan ukuran lebih kecil.');
      setIsErrorStatus(true);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const newImg = new window.Image();
    newImg.onload = () => {
      if (newImg.naturalWidth * newImg.naturalHeight > 55_000_000) {
        setStatusMessage('Resolusi foto terlalu tinggi (>50MP). Harap perkecil resolusi.');
        setIsErrorStatus(true);
        URL.revokeObjectURL(objectUrl);
        return;
      }
      setSourceImage(newImg);
      setIsUploaded(true);
      setViewOriginal(false);
      setZoom(100);
      setPanX(0);
      setPanY(0);
      setStatusMessage('Fotomu siap! Pilih spektrum suasana dan sesuaikan gayamu.');
      setIsErrorStatus(false);
      URL.revokeObjectURL(objectUrl);
    };

    newImg.onerror = () => {
      setStatusMessage('Gagal membuka foto. Coba berkas foto lainnya.');
      setIsErrorStatus(true);
      URL.revokeObjectURL(objectUrl);
    };

    newImg.src = objectUrl;
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current += 1;
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Reset crop
  const handleResetCrop = () => {
    setZoom(100);
    setPanX(0);
    setPanY(0);
  };

  // Save / Export trigger
  const handleExportProfile = () => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceImage) return;

    try {
      // Force render chosen effect even if user was comparing
      setViewOriginal(false);
      renderCurrentState();

      const preset = PRESETS[selectedPresetId] || PRESETS.orange;
      const filename = `bukan-filter-${preset.slug}-${classicColors ? 'klasik' : 'kontras'}${reverseDuotone ? '-balik' : ''
        }.png`;

      const dataUrl = canvas.toDataURL('image/png');
      const preparedFile = imageFile(dataUrl, filename);

      setExportedImageUrl(dataUrl);
      setExportedFile(preparedFile);
      setExportedFilename(filename);
      setIsSaveOpen(true);
      setStatusMessage('Foto berhasil disiapkan! Pilih opsi simpan di jendela dialog.');
      setIsErrorStatus(false);
    } catch {
      setStatusMessage('Terjadi kesalahan saat menyiapkan foto.');
      setIsErrorStatus(true);
    }
  };

  // Quick copy caption
  const handleQuickCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(CAMPAIGN_CAPTION);
      setCopiedCaptionToast(true);
      setTimeout(() => setCopiedCaptionToast(false), 3000);
    } catch {
      setIsCaptionOpen(true);
    }
  };

  const activePreset = PRESETS[selectedPresetId] || PRESETS.orange;

  return (
    <div className="min-h-screen flex flex-col pt-16 md:pt-20">
      <Navbar />

      <main className="flex-1 w-11/12 md:w-10/12 max-w-6xl mx-auto flex flex-col gap-8 md:gap-12 pb-16">
        {/* HERO SECTION */}
        <section className="win-window p-4 md:p-8 mt-4 animate-pop-in">
          {/* <div className="win-window-titlebar !py-1 text-xs mb-4">
            <span>[ SYSTEM: KAMPANYE_KESADARAN_KARHUTLA_2026.TXT ]</span>
            <span className="text-[10px] bg-red-600 px-2 py-0.5 text-white font-mono animate-pulse">
              LIVE ALERT
            </span>
          </div> */}

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 space-y-4">
              {/* <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-100 border border-amber-400 text-amber-900 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span>1 FOTO PROFIL · 1 SERUAN KEBERSAMAAN</span>
              </div> */}

              <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-[#111] leading-tight pixelbold">
                Satu Foto Profil. <br />
                <span className="text-[#c0392b] drop-shadow-sm">
                  Seribu Suara untuk Langit Kita.
                </span>
              </h1>

              <p className="text-sm md:text-base text-gray-700 leading-relaxed max-w-2xl">
                Langit merah jingga bukan filter instagram yang estetik. Itu tanda bahaya kebakaran hutan dan kabut asap pekat.
              </p>

              <div className="win-inset-gray p-3 flex items-center justify-between flex-wrap gap-3">
                <div className="text-xs font-bold text-[#000080]">
                  KABUT BUKAN ESTETIKA · HAK UDARA BERSIH MILIK SEMUA
                </div>
                <PixelButton
                  title="Mulai Edit Foto ↓"
                  href="#studio"
                  icon={<FaCamera />}
                  className="!text-xs !h-8"
                />
              </div>
            </div>


          </div>
        </section>

        {/* PHOTO STUDIO WORKBENCH */}
        <section
          id="studio"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          aria-label="Studio Foto Profil Sadar Karhutla"
        >
          {/* LEFT: CANVAS PREVIEW WINDOW */}
          <div className="lg:col-span-6 win-window flex flex-col shadow-xl">
            <div className="win-window-titlebar text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <FaCamera size={12} />
                <span>PREVIEW_CANVAS_1080.BMP</span>
              </div>
              <span className="text-[10px] font-mono text-yellow-300">
                {isUploaded ? '[FOTO PENGGUNA AKTIF]' : '[MODE DEMO SAMPEL]'}
              </span>
            </div>

            <div className="p-3 md:p-4 bg-[#c0c0c0] flex flex-col gap-3">
              {/* Dropzone & Canvas Frame */}
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative aspect-square w-full win-inset bg-[#1a1e24] overflow-hidden flex items-center justify-center transition-all ${isDragging ? 'ring-4 ring-yellow-400 opacity-90' : ''
                  }`}
              >
                {/* 1080x1080 Real Resolution Canvas */}
                <canvas
                  ref={canvasRef}
                  width={1080}
                  height={1080}
                  className="w-full h-full object-contain select-none"
                  aria-label="Kanvas pratinjau foto profil dengan efek duotone"
                />

                {/* Circular Profile Avatar Guide */}
                {showCircleGuide && (
                  <div
                    className="absolute inset-0 pointer-events-none rounded-full border-4 border-dashed border-yellow-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
                    aria-hidden="true"
                  />
                )}

                {/* Preset Chip Indicator */}
                <div className="absolute top-2.5 left-2.5 win-raised px-2 py-1 text-[10px] md:text-xs font-mono font-bold text-[#111] shadow flex items-center gap-1.5 bg-[#d4d0c8]/95">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                  <span>
                    {activePreset.number} / {activePreset.name.toUpperCase()}
                  </span>
                </div>

                {/* Dragging Overlay */}
                {isDragging && (
                  <div className="absolute inset-0 bg-blue-900/80 flex flex-col items-center justify-center text-white p-4 text-center">
                    <FaUpload size={40} className="animate-bounce mb-2" />
                    <span className="font-bold text-sm">Jatuhkan fotomu di sini!</span>
                  </div>
                )}
              </div>



              {/* Disclaimer */}
              <p className="text-[11px] text-gray-600 leading-tight italic">
                * Efek duotone ini adalah interpretasi visual artistik untuk solidaritas lingkungan, bukan simulasi sensor fisik kualitas udara.
              </p>
            </div>
          </div>

          {/* RIGHT: CONTROL WORKBENCH WINDOW */}
          <div className="lg:col-span-6 win-window flex flex-col shadow-xl">
            <div className="win-window-titlebar text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <FaSlidersH size={12} />
                <span>KONTROL_STUDIO_V1.EXE</span>
              </div>
              <span className="text-[10px] font-mono text-white">READY</span>
            </div>

            <div className="p-4 md:p-5 bg-[#c0c0c0] flex flex-col gap-5 text-xs">
              {/* STEP 1: UPLOAD PHOTO */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-[#000080] pixelbold">
                  <span className="bg-[#000080] text-white px-1.5 py-0.5 text-xs">01</span>
                  <h2>Mulai Dari Potretmu</h2>
                </div>

                <div className="win-inset-gray p-3 flex flex-col gap-2.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          processUploadedFile(e.target.files[0]);
                          e.target.value = '';
                        }
                      }}
                    />
                    <PixelButton
                      title="Unggah Fotomu (Pilih Berkas) ↗"
                      onClick={() => fileInputRef.current?.click()}
                      icon={<FaUpload />}
                      className="!w-full sm:!w-auto !py-2 font-bold"
                    />
                    {isUploaded && (
                      <span className="text-green-700 font-bold flex items-center gap-1 text-[11px]">
                        <FaCheck /> Foto terpasang
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-700">
                    Mendukung JPG, PNG, atau WebP (Maks. 25MB). Seret foto langsung ke kotak kanvas juga bisa!
                  </p>
                  <div className="text-[10px] text-gray-600 flex items-center gap-1.5 pt-1 border-t border-[#b8b4a8]">
                    <span className="text-green-700 font-bold">🛡 100% Privat:</span>
                    <span>Fotomu diproses di browsermu sendiri tanpa diunggah ke server.</span>
                  </div>
                </div>
              </div>

              {/* STEP 2: ATMOSPHERE & PRESET PALETTES */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-bold text-[#000080] pixelbold">
                  <span className="bg-[#000080] text-white px-1.5 py-0.5 text-xs">02</span>
                  <h2>Pilih Spektrum Solidaritas</h2>
                </div>
                <p className="text-gray-700 text-[11px]">
                  Pilih nuansa warna yang mewakili pesanmu. Setiap efek langsung dipratinjau di fotomu:
                </p>

                {/* Palette Selection Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.values(PRESETS).map((preset: PaletteDef) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPresetId(preset.id)}
                        className={`win-button !text-left !p-2 flex items-center gap-2.5 transition-all ${isSelected
                          ? '!border-[#000080] !bg-[#dcd6c8] ring-2 ring-[#000080]'
                          : ''
                          }`}
                      >
                        {/* Live Mini Canvas Thumbnail */}
                        <canvas
                          ref={(el) => {
                            thumbnailRefs.current[preset.id] = el;
                          }}
                          width={128}
                          height={128}
                          className="w-12 h-12 shrink-0 win-inset object-cover bg-neutral-800"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-gray-900 truncate">
                              {preset.name}
                            </span>
                            {isSelected && (
                              <span className="text-[#000080] text-xs font-bold">✓</span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-600 block truncate leading-tight mt-0.5">
                            {preset.subtitle}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Duotone Modifiers Box */}
                <div className="win-inset p-3 bg-white mt-1 flex flex-col gap-2.5">
                  <div className="text-[11px] font-bold text-[#000080] border-b pb-1">
                    OPSI TINGKAT WARNA DUOTONE
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={classicColors}
                      onChange={(e) => setClassicColors(e.target.checked)}
                    />
                    <div className="text-[11px] text-gray-800">
                      <strong>Warna Klasik (Lembut)</strong>
                      <span className="block text-[10px] text-gray-600">
                        Kontras lebih bersahabat dan gradasi warna yang lebih halus
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reverseDuotone}
                      onChange={(e) => setReverseDuotone(e.target.checked)}
                    />
                    <div className="text-[11px] text-gray-800">
                      <strong>Balik Duotone (Reverse)</strong>
                      <span className="block text-[10px] text-gray-600">
                        Tukar warna sorotan (highlight) dan bayangan (shadow)
                      </span>
                    </div>
                  </label>

                  {/* Intensity Range */}
                  <div className="pt-2 border-t border-gray-200 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-800">
                      <span>Intensitas Duotone:</span>
                      <span className="font-mono text-[#000080]">{intensity}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                    />
                    <span className="text-[10px] text-gray-500">
                      0% = Grayscale Hitam-Putih · 100% = Efek Penuh
                    </span>
                  </div>
                </div>

                {/* Fine-tune Crop Accordion */}
                <details className="win-inset-gray p-2 text-xs">
                  <summary className="font-bold cursor-pointer text-[#2c3e50] flex items-center gap-1.5 select-none">
                    <FaCropAlt size={12} />
                    <span>Sesuaikan Posisi & Perbesaran (Fine-tune Crop) [+]</span>
                  </summary>

                  <div className="mt-3 flex flex-col gap-2.5 pt-2 border-t border-gray-300">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px]">
                        <span>Perbesaran (Zoom):</span>
                        <span className="font-mono">{zoom}%</span>
                      </div>
                      <input
                        type="range"
                        min={100}
                        max={250}
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px]">
                        <span>Geser Horizontal:</span>
                        <span className="font-mono">{panX}</span>
                      </div>
                      <input
                        type="range"
                        min={-100}
                        max={100}
                        value={panX}
                        onChange={(e) => setPanX(Number(e.target.value))}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[11px]">
                        <span>Geser Vertikal:</span>
                        <span className="font-mono">{panY}</span>
                      </div>
                      <input
                        type="range"
                        min={-100}
                        max={100}
                        value={panY}
                        onChange={(e) => setPanY(Number(e.target.value))}
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleResetCrop}
                        className="win-button !py-1 !text-xs flex items-center gap-1"
                      >
                        <FaRedo size={10} />
                        <span>Reset Posisi</span>
                      </button>
                    </div>
                  </div>
                </details>

                {/* Custom Campaign Message Overlay */}
                <div className="win-inset-gray p-3 flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-900 select-none">
                    <input
                      type="checkbox"
                      checked={hasTextBanner}
                      onChange={(e) => setHasTextBanner(e.target.checked)}
                    />
                    <span className="flex items-center gap-1.5">
                      <FaFont size={12} />
                      <span>Tempelkan Pita Slogan di Foto Profil</span>
                    </span>
                  </label>

                  {hasTextBanner && (
                    <div className="flex flex-col gap-2 mt-1 animate-pop-in">
                      <div className="win-inset bg-white p-1.5">
                        <input
                          type="text"
                          maxLength={80}
                          value={bannerText}
                          onChange={(e) => setBannerText(e.target.value)}
                          placeholder="Ketik teks slogan..."
                          className="w-full bg-transparent border-none outline-none text-xs text-gray-900 font-bold"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-600">
                        <span>Muncul di bagian bawah foto</span>
                        <span>{bannerText.length}/80 karakter</span>
                      </div>

                      {/* Quick preset slogan tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[
                          'KABUT BUKAN ESTETIKA',
                          'HAK UDARA BERSIH',
                          'DARURAT KARHUTLA',
                          'LINDUNGI HUTAN KITA',
                        ].map((slogan) => (
                          <button
                            key={slogan}
                            type="button"
                            onClick={() => setBannerText(slogan)}
                            className="win-button !text-[10px] !py-0.5 !px-2"
                          >
                            {slogan}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* EXPORT ACTION BUTTON */}
                <div className="pt-2 flex flex-col gap-2">
                  <PixelButton
                    title="SIMPAN FOTO PROFIL (1080×1080 PNG) ↓"
                    onClick={handleExportProfile}
                    className="!w-full !py-3.5 !text-sm !bg-[#c0392b] !text-white font-extrabold shadow-lg"
                  />
                  <p
                    className={`text-[11px] text-center font-mono ${isErrorStatus ? 'text-red-700 font-bold' : 'text-gray-700'
                      }`}
                  >
                    {statusMessage}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* EDUCATIONAL & CONTEXT SECTION */}
        <section id="info" className="win-window p-4 md:p-6 shadow-xl">
          {/* <div className="win-window-titlebar !py-1 text-xs mb-4">
            <div className="flex items-center gap-1.5 font-bold">
              <FaInfoCircle size={12} />
              <span>DI_BALIK_LENSA: MENGAPA_ISU_INI_PENTING.TXT</span>
            </div>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-800 leading-relaxed">
            <div className="win-inset bg-white p-4 space-y-3">
              <h3 className="font-bold text-sm text-[#000080] pixelbold">
                Kebakaran Hutan Bukan Musibah Biasa
              </h3>
              <p>
                Karhutla (Kebakaran Hutan dan Lahan) adalah krisis ekologis yang berulang. Pembakaran lahan gambut melepaskan jutaan ton karbon ke atmosfer dan memicu kabut asap tebal beracun yang berlangsung berminggu-minggu.
              </p>
              <p>
                Ratusan ribu warga—termasuk anak-anak, lansia, dan kelompok rentan—terpapar Infeksi Saluran Pernapasan Akut (ISPA). Sekolah diliburkan, aktivitas lumpuh, dan flora-fauna endemik kehilangan rumahnya.
              </p>
            </div>

            <div className="win-inset bg-white p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-[#000080] pixelbold">
                  Pantau Titik Panas & Kualitas Udara Nyata
                </h3>
                <p>
                  Warna filter pada studio ini dirancang sebagai simbol solidaritas digital. Untuk melihat titik panas (hotspot) dan sebaran asap terkini secara faktual, kamu dapat memantau portal data resmi:
                </p>
              </div>

              <div className="pt-2 border-t border-gray-200 flex flex-col gap-2">
                <a
                  href="https://sipongi.menlhk.go.id/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="win-button !py-2 !text-xs text-[#000080] font-bold flex items-center justify-between"
                >
                  <span>Dashboard SiPongi KLHK (Titik Panas Karhutla)</span>
                  <FaExternalLinkAlt size={11} />
                </a>
                <a
                  href="https://gis.bnpb.go.id/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="win-button !py-2 !text-xs text-[#000080] font-bold flex items-center justify-between"
                >
                  <span>Portal GIS Bencana BNPB RI</span>
                  <FaExternalLinkAlt size={11} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* RETRO FOOTER */}
      <footer className="mt-auto win-inset-gray border-t-2 border-[#808080] py-4 px-6 text-xs text-gray-800">
        <div className="w-11/12 md:w-10/12 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <span className="font-bold text-[#000080]">BUKAN_FILTER.EXE</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-600">Sadar Karhutla Nusantara</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://tawakalmit.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#000080] hover:underline font-bold font-mono text-xs flex items-center gap-1"
            >
              <span>tawakalmit</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <SaveModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        imageUrl={exportedImageUrl}
        file={exportedFile}
        filename={exportedFilename}
      />

      <CaptionModal
        isOpen={isCaptionOpen}
        onClose={() => setIsCaptionOpen(false)}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
