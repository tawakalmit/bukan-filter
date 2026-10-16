'use client';

import React, { useState } from 'react';
import { FaDownload, FaShareAlt, FaCopy, FaCheck, FaTimes, FaMobileAlt } from 'react-icons/fa';
import { shareImage } from '../lib/save';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  file: File | null;
  filename: string;
}

export default function SaveModal({
  isOpen,
  onClose,
  imageUrl,
  file,
  filename,
}: SaveModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareStatus, setShareStatus] = useState<string>('');

  if (!isOpen || !imageUrl) return null;

  const handleShare = async () => {
    setShareStatus('Membuka menu bagikan...');
    const result = await shareImage(file);
    if (result === 'shared') {
      setShareStatus('Foto berhasil dibagikan!');
    } else if (result === 'cancelled') {
      setShareStatus('Berbagi dibatalkan.');
    } else {
      setShareStatus('Fitur berbagi langsung tidak didukung peramban ini. Silakan unduh gambar.');
    }
  };

  const handleCopyLink = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xs animate-pop-in">
      <div className="win-window max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl">
        {/* Title bar */}
        <div className="win-window-titlebar">
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm">EXPORT_MANAGER.EXE - Foto Siap Disimpan!</span>
          </div>
          <button
            onClick={onClose}
            className="win-btn-control"
            aria-label="Tutup Dialog"
          >
            <FaTimes size={10} />
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4 text-xs">
          <div className="win-inset-gray p-3 flex flex-col gap-1.5">
            <p className="font-bold text-sm text-[#000080]">
              Foto profil 1080 × 1080 PNG berhasil dirender!
            </p>
            <p className="text-gray-700 text-[11px] leading-relaxed">
              Klik tombol di bawah untuk mengunduh ke perangkatmu. Untuk pengguna ponsel (Instagram/TikTok browser), kamu juga bisa menahan foto untuk menyimpan langsung.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5">
            <a
              href={imageUrl}
              download={filename}
              className="win-button !bg-[#27ae60] !text-white flex-1 !py-2.5 font-bold text-center justify-center"
            >
              <FaDownload size={13} />
              <span>Unduh PNG (1080×1080)</span>
            </a>

            {file && (
              <button
                type="button"
                onClick={handleShare}
                className="win-button !bg-[#2980b9] !text-white !py-2.5 font-bold flex-1"
              >
                <FaShareAlt size={13} />
                <span>Bagikan (Share)</span>
              </button>
            )}
          </div>

          {shareStatus && (
            <p className="text-[11px] text-[#2c3e50] font-bold text-center bg-[#ecf0f1] p-1.5 win-inset">
              {shareStatus}
            </p>
          )}

          {/* Image Preview */}
          <div className="win-inset p-2 flex flex-col items-center justify-center bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Foto Profil Selesai"
              className="max-h-72 w-auto object-contain border border-[#404040]"
            />
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-300">
              <FaMobileAlt />
              <span>Sentuh & tahan gambar di atas untuk opsi simpan di HP</span>
            </div>
          </div>

          {/* In-app browser help */}
          <details className="win-inset-gray p-2 text-[11px]">
            <summary className="font-bold cursor-pointer text-[#2c3e50]">
              Membuka lewat Instagram / TikTok?
            </summary>
            <div className="mt-2 text-gray-700 flex flex-col gap-2">
              <p>
                Beberapa in-app browser memblokir unduhan langsung. Buka link ini di Safari atau Chrome dengan menyalin tautan di bawah:
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="win-button !py-1 !text-xs flex items-center gap-1.5"
                >
                  {copiedLink ? <FaCheck className="text-green-600" /> : <FaCopy />}
                  <span>{copiedLink ? 'Tersalin!' : 'Salin Link Web'}</span>
                </button>
              </div>
            </div>
          </details>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#c0c0c0] border-t border-[#808080] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="win-button px-5 !py-1.5 font-bold"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
