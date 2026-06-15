"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BellOff, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import NotificationCard from "@/components/notifications/NotificationCard";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import {
  deletePartnerNotification,
  extractCollection,
  getPartnerNotificationCount,
  getPartnerNotifications,
  markPartnerNotificationRead,
} from "@/lib/api/partner";

interface Notification {
  id: string;
  title: string;
  description: string;
  isRead: boolean;
  commande_id?: string;
  numero_commande?: string;
}

export default function PartenaireNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nonReadCount, setNonReadCount] = useState(0);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  const token = useMemo(() => {
    const session = getAuthSession();
    if (!session || session.userType !== "user") return null;
    return session.token;
  }, []);

  const loadNotifications = async () => {
    if (!token) return;

    try {
      const [listResponse, countResponse] = await Promise.all([
        getPartnerNotifications(token, 100),
        getPartnerNotificationCount(token),
      ]);

      setNotifications(
        extractCollection(listResponse.data.notifications).map((n) => ({
          id: n.id,
          title: n.titre,
          description: n.message,
          isRead: n.is_read,
          commande_id: typeof n.data?.commande_id === "string" ? n.data.commande_id : undefined,
          numero_commande: typeof n.data?.numero_commande === "string" ? n.data.numero_commande : undefined,
        })),
      );

      setNonReadCount(countResponse.data.non_lues ?? countResponse.data.total_non_lues ?? 0);
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
    }
  };

  useEffect(() => {
    void loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleMarkAsRead = async (id: string) => {
    if (!token) return;
    try {
      await markPartnerNotificationRead(token, id);
      await loadNotifications();
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await deletePartnerNotification(token, id);
      await loadNotifications();
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
    }
  };

  const handleDeleteAll = async () => {
    if (!token) return;
    try {
      await Promise.all(
        notifications.filter((n) => n.isRead).map((n) => deletePartnerNotification(token, n.id)),
      );
      await loadNotifications();
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    try {
      await Promise.all(
        notifications.filter((n) => !n.isRead).map((n) => markPartnerNotificationRead(token, n.id)),
      );
      await loadNotifications();
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
    }
  };

  return (
    <div className="px-4 sm:px-8 lg:px-16 py-6 lg:py-10">
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
              <h2 className="font-bold text-gray-900 text-base pr-6">{selectedNotif.title}</h2>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selectedNotif.description}</p>
            {selectedNotif.commande_id && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-gray-500">Commande :</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNotif(null);
                    router.push(`/partenaire/commandes/${selectedNotif.commande_id}`);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600 px-3 py-1 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                >
                  <ExternalLink size={13} />
                  {selectedNotif.numero_commande ?? selectedNotif.commande_id}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {nonReadCount > 0 && (
        <p className="mb-4 text-sm text-gray-600">Notifications non lues : {nonReadCount}</p>
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
                onClick={() => void handleDeleteAll()}
                className="flex items-center gap-2 rounded-full border-2 border-red-500 px-4 py-2 text-sm font-bold text-red-500 transition hover:bg-red-500 hover:text-white"
              >
                Tout supprimer
              </button>
              <button
                onClick={() => void handleMarkAllAsRead()}
                className="flex items-center gap-2 rounded-full border-2 border-toni-green-dark-2 px-4 py-2 text-sm font-bold text-toni-green-dark-2 transition hover:bg-toni-green-dark-2 hover:text-white"
              >
                Tout marquer comme lu
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                title={notification.title}
                description={notification.description}
                isRead={notification.isRead}
                onOpen={() => {
                  setSelectedNotif(notification);
                  if (!notification.isRead) void handleMarkAsRead(notification.id);
                }}
                onDelete={() => void handleDelete(notification.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
