"use client";

import { useEffect, useMemo, useState } from "react";
import { BellOff } from "lucide-react";
import { toast } from "sonner";
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
        toast.error(error.message);
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
        toast.error(error.message);
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
        toast.error(error.message);
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
        toast.error(error.message);
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
        toast.error(error.message);
      }
    }
  };

  return (
    <div>
      {nonReadCount > 0 && (
        <p className="mb-4 text-sm text-gray-600">Notifications non lues: {nonReadCount}</p>
      )}

      {notifications.length === 0 ? (
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center justify-center">
            <BellOff size={120} className="text-gray-400 mb-8" />
            <div className="text-2xl text-gray-500 text-center">
              Vous n&apos;avez aucune notification
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-end gap-2 pb-2">
            <button
              onClick={handleDeleteAll}
              className="px-4 py-1.5 bg-red-600 text-white font-semibold text-sm rounded-full hover:bg-red-700 transition"
            >
              Tout supprimer
            </button>
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-1.5 border-2 border-toni-green-dark-2 text-toni-green-dark-2 font-semibold text-sm rounded-full hover:bg-toni-green-dark-2 hover:text-white transition"
            >
              Tout marquer comme lu
            </button>
          </div>

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
        </div>
      )}
    </div>
  );
}
