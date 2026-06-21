import React, { useRef, useState } from "react";
import { Camera, Users, Heart, Copy, Loader2 } from "lucide-react";
import { toBlob } from "html-to-image";
import { Member } from "../types";

export function CleanMemberCard({
  member,
  status,
  remaining,
  progressPercentage,
  isPinned,
  onTogglePin
}: {
  member: Member;
  status: { label: string; badgeClass: string; dotClass: string; barClass: string };
  remaining: number;
  progressPercentage: number;
  isPinned?: boolean;
  onTogglePin?: (id: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCopying, setIsCopying] = useState(false);

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    try {
      setIsCopying(true);

      const pixelRatio = 3; // Force High-Definition output
      const blob = await toBlob(cardRef.current, {
        quality: 1.0,
        pixelRatio: pixelRatio,
        backgroundColor: '#ffffff',
        style: { transform: 'scale(1)', boxShadow: 'none', margin: '0' }
      });

      if (!blob) throw new Error("Gagal membuat gambar");

      // Salin gambar ke Clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);

      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Gambar disalin ke Clipboard!' }));
    } catch (err) {
      console.error("Gagal menyalin gambar:", err);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Maaf, fitur Copy gagal.' }));
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className="group relative bg-[#ffffff] rounded-2xl p-6 border border-[#e8e8ed] hover:border-[#1d1d1f]/15 shadow-[0_2px_8px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.035)] hover:-translate-y-0.5 transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden"
    >
      <div>
        {/* Top Header Row within the Card */}
        <div className="flex items-center justify-between gap-2 mb-6">
          {/* Badge Category in very minimal format */}
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.06em] text-[#86868b] uppercase flex-1">
            {member.category === "2Shot" ? (
              <Camera className="w-3.5 h-3.5 text-[#86868b] shrink-0" />
            ) : (
              <Users className="w-3.5 h-3.5 text-[#86868b] shrink-0" />
            )}
            <span className="truncate">{member.category === "2Shot" ? "2Shot" : "Meet & Greet"}</span>
          </span>

          {/* Clean Solid Status Indicator - Completely removed cluttered capsule background */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1d1d1f]">
              <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
              {status.label}
            </span>

            {/* Copy Image Button */}
            <button
              onClick={handleCopyImage}
              disabled={isCopying}
              className="p-1 rounded-full transition-colors hover:bg-[#f5f5f7] active:scale-95 outline-none"
              title="Copy Gambar;lainny"
            >
              {isCopying ? (
                <Loader2 className="w-4 h-4 text-[#86868b] animate-spin" />
              ) : (
                <Copy className="w-4 h-4 text-[#86868b] hover:text-[#007aff] transition-colors" />
              )}
            </button>

            {/* Pin Oshi Button */}
            {onTogglePin && (
              <button
                onClick={() => onTogglePin(member.id)}
                className="p-1 rounded-full transition-colors hover:bg-[#f5f5f7] active:scale-95 outline-none"
                title={isPinned ? "Hapus dari Pin" : "Pin Oshi"}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${isPinned ? "fill-[#ff2d55] text-[#ff2d55]" : "text-[#d2d2d7] hover:text-[#ff2d55]"
                    }`}
                />
              </button>
            )}
          </div>
        </div>

        {/* Member Profile Block */}
        <div className="flex items-center gap-4 mb-6">
          {/* High-end Unified Monochromatic Avatar Placeholder or Photo */}
          <div className="w-12 h-12 rounded-full bg-[#f5f5f7] border border-[#e8e8ed] flex items-center justify-center font-bold text-xs text-[#1d1d1f] tracking-wide shrink-0 overflow-hidden relative">
            {member.photoUrl ? (
              <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover absolute inset-0" />
            ) : (
              member.name.split(" ").map(n => n[0]).join("").slice(0, 2)
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold tracking-tight text-[#1d1d1f] group-hover:text-[#007aff] transition-colors duration-250 truncate">
              {member.name}
            </h3>
            {/* Clean Inline Typography - Removed dark background gray badge to reduce noise */}
            <p className="text-[11px] text-[#86868b] font-medium truncate mt-0.5">
              {member.jkt48Gen} &bull; {member.session}
            </p>
          </div>
        </div>
      </div>

      {/* Progress tracking line */}
      <div className="pt-4 border-t border-[#f5f5f7]">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-xs text-[#6e6e73] font-normal tracking-tight">
            Sisa <span className="text-[#1d1d1f] font-bold">{remaining} slot</span>
          </span>
          <span className="text-[#6e6e73] font-semibold text-[11px]">{progressPercentage}% Terisi</span>
        </div>

        {/* Apple Style Thin 4px Bar */}
        <div className="w-full h-[4px] bg-[#f5f5f7] rounded-full overflow-hidden mb-4">
          <div
            className={`h-full ${status.barClass} rounded-full transition-all duration-500`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

      </div>
    </div>
  );
}
