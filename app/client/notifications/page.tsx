"use client";

import { useState } from "react";
import { BellOff } from "lucide-react";
import NotificationCard from "@/components/notifications/NotificationCard";

interface Notification {
  id: number;
  title: string;
  description: string;
  isRead: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const handleDeleteNotification = (id: number) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const handleDeleteAll = () => {
    setNotifications([]);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, isRead: true })));
  };

  return (
    <div>
      {notifications.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center justify-center">
            <BellOff size={120} className="text-gray-400 mb-8" />
            <div className="text-2xl text-gray-500 text-center">
              Vous n'avez aucune notification
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Notifications List */}
          <div className="space-y-4">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                title={notification.title}
                description={notification.description}
                onDelete={() => handleDeleteNotification(notification.id)}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-6">
            <button
              onClick={handleDeleteAll}
              className="px-12 py-3 bg-red-600 text-white font-bold text-lg rounded-full hover:bg-red-700 transition"
            >
              Tout supprimer
            </button>
            <button
              onClick={handleMarkAllAsRead}
              className="px-12 py-3 border-2 border-toni-green-dark-2 text-toni-green-dark-2 font-bold text-lg rounded-full hover:bg-toni-green-dark-2 hover:text-white transition"
            >
              Tout marquer comme lu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
