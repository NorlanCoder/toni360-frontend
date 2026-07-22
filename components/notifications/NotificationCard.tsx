"use client";

import { Trash2 } from "lucide-react";

interface NotificationCardProps {
  title: string;
  description: string;
  timestamp?: string;
  isRead?: boolean;
  onOpen: () => void;
  onDelete: () => void;
}

export default function NotificationCard({
  title,
  description,
  timestamp,
  isRead = false,
  onOpen,
  onDelete,
}: NotificationCardProps) {
  return (
    <div
      onClick={onOpen}
      className={`cursor-pointer p-2 flex items-start gap-4 rounded-full transition-all duration-200 hover:shadow-sm ${
        isRead ? "bg-white" : "bg-[#E6F6F0]"
      }`}
    >
      {/* Logo */}
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-12 h-12 rounded-full border-2 border-toni-green-dark-2 flex items-center justify-center bg-white">
          <img
            src="/images/icon.png"
            alt="Toni360"
            className="w-8 h-8 object-contain"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 text-base mb-1">{title}</h3>
        <p className="text-gray-600 text-sm truncate">{description}</p>
        {timestamp && <p className="mt-1 text-xs text-gray-400">{timestamp}</p>}
      </div>

      {/* Delete */}
      <div className="flex-shrink-0 flex items-center self-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-500 hover:text-red-700 transition p-1"
          aria-label="Supprimer la notification"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}
