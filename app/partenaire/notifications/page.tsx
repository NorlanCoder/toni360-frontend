"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Menu, Search, User } from "lucide-react";
import PartenaireSidebar from "@/components/partenaire/Sidebar";
import { getAuthSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/errors";
import {
  deletePartnerNotification,
  extractCollection,
  getPartnerNotifications,
  markPartnerNotificationRead,
  markPartnerNotificationUnread,
  PartnerNotificationItem,
} from "@/lib/api/partner";
import { toast } from "sonner";

export default function PartenaireNotificationsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<PartnerNotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      const session = getAuthSession();
      if (!session || session.userType !== "user" || !session.token) {
        toast.error("Session partenaire invalide.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await getPartnerNotifications(session.token, 100);
        setNotifications(extractCollection(response.data.notifications));
      } catch (err: unknown) {
        toast.error(err instanceof ApiError ? err.message : "Impossible de charger les notifications.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadNotifications();
  }, []);

  const handleToggleRead = async (notification: PartnerNotificationItem) => {
    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token) {
      toast.error("Session partenaire invalide.");
      return;
    }

    try {
      if (notification.is_read) {
        await markPartnerNotificationUnread(session.token, notification.id);
      } else {
        await markPartnerNotificationRead(session.token, notification.id);
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, is_read: !item.is_read } : item,
        ),
      );
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Action impossible.");
    }
  };

  const handleDelete = async (notificationId: string) => {
    const session = getAuthSession();
    if (!session || session.userType !== "user" || !session.token) {
      toast.error("Session partenaire invalide.");
      return;
    }

    try {
      await deletePartnerNotification(session.token, notificationId);
      setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Suppression impossible.");
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <PartenaireSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-20 lg:h-24 shrink-0 items-center gap-3 justify-between border-b border-gray-200 bg-white px-4 md:px-8">
          <button
            type="button"
            aria-label="Ouvrir le menu"
            className="flex shrink-0 rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="relative w-full max-w-lg">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un médicament"
              className="w-full rounded-full border-0 bg-emerald-50/60 py-3 pl-14 pr-4 text-base text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/partenaire/notifications"
              aria-label="Voir les notifications"
              className="flex items-center gap-2 rounded-full border border-emerald-600 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              <span className="hidden sm:inline">Notifications</span>
              <Bell className="h-5 w-5" />
            </Link>
            <button
              type="button"
              aria-label="Accéder à mon compte"
              className="flex items-center gap-2 rounded-full border border-emerald-600 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
              onClick={() => router.push("/partenaire/profil")}
            >
              <span className="hidden sm:inline">Mon Compte</span>
              <User className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 py-6 lg:py-10">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Notifications partenaire</h1>

          {isLoading ? (
            <div className="rounded-xl border border-gray-200 px-4 py-4 text-sm text-gray-500">Chargement des notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="rounded-xl border border-gray-200 px-4 py-4 text-sm text-gray-500">Aucune notification.</div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-xl border px-4 py-4 ${
                    notification.is_read ? "border-gray-200 bg-white" : "border-emerald-200 bg-emerald-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900">{notification.titre}</p>
                      <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                      <p className="mt-2 text-xs text-gray-500">
                        {notification.created_at
                          ? new Date(notification.created_at).toLocaleString("fr-FR")
                          : "-"}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => void handleToggleRead(notification)}
                        className="rounded-full border border-emerald-600 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                      >
                        {notification.is_read ? "Marquer non lu" : "Marquer lu"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(notification.id)}
                        className="rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
