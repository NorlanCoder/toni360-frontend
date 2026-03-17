import { Trash2 } from "lucide-react";

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
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-6 flex items-start gap-4 shadow-sm border border-gray-200 ${
        isRead ? "opacity-80" : ""
      }`}
    >
      {/* Logo */}
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full border-2 border-toni-green-dark-2 flex items-center justify-center bg-white">
          <img
            src="/images/logo.png"
            alt="Toni360"
            className="w-8 h-8 object-contain"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 text-base mb-1">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="flex-shrink-0 text-red-600 hover:text-red-700 transition"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}
