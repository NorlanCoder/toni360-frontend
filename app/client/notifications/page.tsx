"use client";

import { useEffect, useMemo, useState } from "react";
import { BellOff } from "lucide-react";
import NotificationCard from "@/components/notifications/NotificationCard";
import {
  deleteClientNotification,
  deleteReadClientNotifications,
  extractCollection,
  getClientNotificationCount,
  getClientNotifications,
  markAllClientNotificationsRead,
  markClientNotificationRead,
} from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { clearAuthSession, getAuthSession } from "@/lib/api/session";

interface Notification {
  id: string;
  title: string;
  description: string;
  isRead: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [message, setMessage] = useState("");
  const [nonReadCount, setNonReadCount] = useState(0);

  const token = useMemo(() => {
    const session = getAuthSession();
    if (!session || session.userType !== "patient") {
      return null;
    }
    return session.token;
  }, []);

  const loadNotifications = async () => {
    if (!token) {
      clearAuthSession();
      return;
    }

    try {
      const [listResponse, countResponse] = await Promise.all([
        getClientNotifications(token),
        getClientNotificationCount(token),
      ]);

      setNotifications(
        extractCollection(listResponse.data.notifications).map((notification) => ({
          id: notification.id,
          title: notification.titre,
          description: notification.message,
          isRead: notification.is_read,
        })),
      );

      setNonReadCount(countResponse.data.non_lues ?? countResponse.data.total_non_lues ?? 0);
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message);
      }
    }
  };

  useEffect(() => {
    void loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDeleteNotification = async (id: string) => {
    if (!token) {
      return;
    }

    try {
      await deleteClientNotification(token, id);
      await loadNotifications();
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message);
      }
    }
  };

  const handleDeleteAll = async () => {
    if (!token) {
      return;
    }

    try {
      await deleteReadClientNotifications(token);
      await loadNotifications();
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message);
      }
    }
  };

  const handleMarkAsRead = async (id: string) => {
    if (!token) {
      return;
    }

    try {
      await markClientNotificationRead(token, id);
      await loadNotifications();
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) {
      return;
    }

    try {
      await markAllClientNotificationsRead(token);
      await loadNotifications();
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage(error.message);
      }
    }
  };

  return (
    <div>
      {message && <p className="mb-4 text-sm text-red-500">{message}</p>}
      {nonReadCount > 0 && (
        <p className="mb-4 text-sm text-gray-600">Notifications non lues: {nonReadCount}</p>
      )}

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
                isRead={notification.isRead}
                onClick={() => {
                  if (!notification.isRead) {
                    void handleMarkAsRead(notification.id);
                  }
                }}
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
