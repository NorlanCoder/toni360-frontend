"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

interface NotificationCardProps {
  title: string;
  description: string;
  isRead?: boolean;
  onClick?: () => void;
  onDelete: () => void;
}

export default function NotificationCard({
  title,
  description,
  isRead = false,
  onClick,
  onDelete,
}: NotificationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    if (!expanded && !isRead) {
      onClick?.();
    }
    setExpanded((prev) => !prev);
  };

  return (
    <div
      onClick={handleToggle}
      className={`cursor-pointer p-2 flex items-start gap-4 transition-all duration-200 ${
        expanded ? "rounded-2xl shadow-sm" : "rounded-full"
      } ${isRead ? "bg-white" : "bg-[#E6F6F0]"}`}
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
        {expanded ? (
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        ) : (
          <p className="text-gray-600 text-sm truncate">{description}</p>
        )}
      </div>

      {/* Right actions */}
      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        <span className="text-gray-400">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-600 hover:text-red-700 transition"
          aria-label="Supprimer la notification"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}
