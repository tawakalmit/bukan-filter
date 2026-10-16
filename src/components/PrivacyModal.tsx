'use client';

import React from 'react';
import { FaShieldAlt, FaTimes, FaLock, FaCheckCircle } from 'react-icons/fa';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xs animate-pop-in">
      <div className="win-window max-w-lg w-full flex flex-col shadow-2xl">
        {/* Title bar */}
        <div className="win-window-titlebar">
          <div className="flex items-center gap-2">
            <FaShieldAlt size={12} className="text-[#2ecc71]" />
            <span className="text-xs md:text-sm">PRIVACY_SECURITY.SYS [100% Client-Side]</span>
          </div>
          <button onClick={onClose} className="win-btn-control" aria-label="Tutup">
            <FaTimes size={10} />
          </button>
        </div>

        {/* Dialog body */}
        <div className="p-4 flex flex-col gap-3 text-xs leading-relaxed max-h-[80vh] overflow-y-auto">
          <div className="win-inset-gray p-3 flex items-start gap-2.5">
            <FaLock className="text-[#000080] shrink-0 mt-0.5" size={16} />
            <div>
              <p className="font-bold text-[#000080] text-sm">Fotomu Tidak Pernah Meninggalkan Perangkatmu</p>
              <p className="text-gray-700 text-[11px] mt-0.5">
                Semua pemrosesan warna, pemotongan (crop), dan efek duotone kabut berjalan 100% di memori browser lokal (RAM) melalui HTML5 Canvas.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-gray-800">
            <div className="flex items-start gap-2">
              <FaCheckCircle className="text-green-600 shrink-0 mt-1" />
              <p>
                <strong>Nol Unggahan Server:</strong> Gambar yang kamu pilih tidak dikirim, disimpan, atau dianalisis oleh server backend mana pun.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <FaCheckCircle className="text-green-600 shrink-0 mt-1" />
              <p>
                <strong>Bebas Pelacak & Iklan:</strong> Aplikasi ini bebas cookie analitik pihak ketiga dan tidak mengumpulkan data pribadi pengguna.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <FaCheckCircle className="text-green-600 shrink-0 mt-1" />
              <p>
                <strong>Pembersihan Metadata:</strong> Berkas PNG yang dihasilkan diekspor murni dari piksel canvas, tanpa menyalin metadata EXIF (seperti lokasi GPS atau info kamera) dari foto aslimu.
              </p>
            </div>
          </div>

          <div className="win-inset p-3 bg-white text-[11px] text-gray-600">
            <strong>Tentang Proyek:</strong> Proyek kesadaran publik independen ini dirancang untuk mengingatkan kita semua akan pentingnya pencegahan kebakaran hutan dan lahan (Karhutla) serta pemenuhan hak atas udara bersih bagi seluruh masyarakat Indonesia.
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#c0c0c0] border-t border-[#808080] flex justify-end">
          <button type="button" onClick={onClose} className="win-button px-5 py-1 font-bold">
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
