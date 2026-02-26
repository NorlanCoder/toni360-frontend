"use client";

import Image from "next/image";

/* ──────────────────────────── Types ──────────────────────────── */
interface ConfirmationModalProps {
  show: boolean;
  message: string;
  title?: string;
  iconPath?: string;
  onClose?: () => void;
}

/* ═══════════════════════ COMPONENT ══════════════════════════════ */
export default function ConfirmationModal({
  show,
  message,
  title,
  iconPath = "/images/checkmark.svg",
  onClose,
}: ConfirmationModalProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-2xl bg-white px-8 py-10 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <p className="mb-4 text-xs text-gray-400">{title}</p>
        )}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
          <Image
            src={iconPath}
            alt="Confirmation"
            width={64}
            height={64}
          />
        </div>
        <p className="whitespace-pre-line text-base font-bold text-gray-700">{message}</p>
      </div>
    </div>
  );
}
