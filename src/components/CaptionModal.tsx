'use client';

import React, { useState } from 'react';
import { FaCopy, FaCheck, FaTimes, FaBullhorn } from 'react-icons/fa';

interface CaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CAMPAIGN_CAPTION = `Kabut asap bukan estetika, ini peringatan nyata.
Udara bersih adalah hak mendasar setiap insan, namun saudara kita di berbagai pelosok masih harus menghirup pekatnya karhutla.

Foto profil ini adalah wujud solidaritas dan pengingat bahwa rimba kita membutuhkan perlindungan nyata sekarang juga. Mari kawal dan suarakan bersama!

#BukanSekadarFilter #KabutBukanEstetika #HakUdaraBersih #CegahKarhutla #JagaHutanKita`;

export default function CaptionModal({ isOpen, onClose }: CaptionModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CAMPAIGN_CAPTION);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xs animate-pop-in">
      <div className="win-window max-w-lg w-full flex flex-col shadow-2xl">
        {/* Title bar */}
        <div className="win-window-titlebar">
          <div className="flex items-center gap-2">
            <FaBullhorn size={12} className="text-[#f1c40f]" />
            <span className="text-xs md:text-sm">CAPTION_CAMPAIGN.TXT</span>
          </div>
          <button onClick={onClose} className="win-btn-control" aria-label="Tutup">
            <FaTimes size={10} />
          </button>
        </div>

        {/* Dialog body */}
        <div className="p-4 flex flex-col gap-3 text-xs">
          <p className="text-gray-800">
            Salin teks narasi ini untuk disertakan bersama foto profil barumu di Instagram, Twitter/X, WhatsApp Story, atau LinkedIn:
          </p>

          <div className="win-inset p-3 bg-white">
            <textarea
              readOnly
              rows={8}
              value={CAMPAIGN_CAPTION}
              className="w-full bg-transparent resize-none border-none outline-none font-sans text-xs md:text-sm text-gray-800 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-gray-600 font-mono">
              Panjang: 324 karakter
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className={`win-button !py-2 !px-4 font-bold flex items-center gap-2 ${
                copied ? '!bg-green-700 !text-white' : '!bg-[#000080] !text-white'
              }`}
            >
              {copied ? <FaCheck /> : <FaCopy />}
              <span>{copied ? 'Teks Tersalin ke Clipboard!' : 'Salin Teks Kampanye'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#c0c0c0] border-t border-[#808080] flex justify-end">
          <button type="button" onClick={onClose} className="win-button px-4 py-1">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
