"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BellOff, ExternalLink, X } from "lucide-react";
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
  createdAt?: string;
  isRead: boolean;
  commande_id?: string;
  numero_commande?: string;
}

function decodeHtmlEntities(value: string): string {
  if (typeof window === "undefined") return value;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function formatNotificationDateTime(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nonReadCount, setNonReadCount] = useState(0);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

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
          title: decodeHtmlEntities(notification.titre),
          description: decodeHtmlEntities(notification.message),
          createdAt: notification.created_at,
          isRead: notification.is_read,
          commande_id: typeof notification.data?.commande_id === "string" ? notification.data.commande_id : undefined,
          numero_commande: typeof notification.data?.numero_commande === "string" ? notification.data.numero_commande : undefined,
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
      {/* ── Modal détail ── */}
      {selectedNotif && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setSelectedNotif(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedNotif(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition"
              aria-label="Fermer"
            >
              <X size={22} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-toni-green-dark-2 flex items-center justify-center bg-white shrink-0">
                <img src="/images/icon.png" alt="Toni360" className="w-6 h-6 object-contain" />
              </div>
              <div className="pr-6">
                <h2 className="font-bold text-gray-900 text-base">{selectedNotif.title}</h2>
                {formatNotificationDateTime(selectedNotif.createdAt) && (
                  <p className="mt-1 text-xs text-gray-400">
                    {formatNotificationDateTime(selectedNotif.createdAt)}
                  </p>
                )}
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selectedNotif.description}</p>
            {selectedNotif.commande_id && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-gray-500">Commande :</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNotif(null);
                    router.push(`/client/orders/${selectedNotif.commande_id}`);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-toni-green-dark-2 px-3 py-1 text-sm font-semibold text-toni-green-dark-2 hover:bg-[#E6F6F0] transition-colors"
                >
                  <ExternalLink size={13} />
                  {selectedNotif.numero_commande ?? selectedNotif.commande_id}
                </button>
              </div>
            )}
          </div>
        </div>
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
          {/* Barre d'actions — une seule ligne */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
            {nonReadCount > 0 ? (
              <p className="text-sm text-gray-600 shrink-0">
                {nonReadCount} notification{nonReadCount > 1 ? "s" : ""} non lue{nonReadCount > 1 ? "s" : ""}
              </p>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteAll}
                className="flex items-center gap-2 rounded-full border-2 border-red-500 px-4 py-2 text-sm font-bold text-red-500 transition hover:bg-red-500 hover:text-white"
              >
                Tout supprimer
              </button>
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 rounded-full border-2 border-toni-green-dark-2 px-4 py-2 text-sm font-bold text-toni-green-dark-2 transition hover:bg-toni-green-dark-2 hover:text-white"
              >
                Tout marquer comme lu
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                title={notification.title}
                description={notification.description}
                timestamp={formatNotificationDateTime(notification.createdAt) ?? undefined}
                isRead={notification.isRead}
                onOpen={() => {
                  setSelectedNotif(notification);
                  if (!notification.isRead) void handleMarkAsRead(notification.id);
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
