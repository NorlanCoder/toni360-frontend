"use client";

import { useState } from "react";
import { Home, User, Package, Bell, ShoppingCart, HelpCircle, LogOut, BellOff, Trash2 } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: number;
  title: string;
  description: string;
  isRead: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      description: "e vestibulum vestibulum. Cras venenatis euismod malesuada. Nullh................",
      isRead: false,
    },
    {
      id: 2,
      title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      description: "e vestibulum vestibulum. Cras venenatis euismod malesuada. Nullh................",
      isRead: false,
    },
    {
      id: 3,
      title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      description: "e vestibulum vestibulum. Cras venenatis euismod malesuada. Nullh................",
      isRead: false,
    },
    {
      id: 4,
      title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      description: "e vestibulum vestibulum. Cras venenatis euismod malesuada. Nullh................",
      isRead: false,
    },
    {
      id: 5,
      title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      description: "e vestibulum vestibulum. Cras venenatis euismod malesuada. Nullh................",
      isRead: false,
    },
    {
      id: 6,
      title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      description: "e vestibulum vestibulum. Cras venenatis euismod malesuada. Nullh................",
      isRead: false,
    },
  ]);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <img src="/images/logo.png" alt="Toni360" className="h-14" />
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-2 border-2 border-toni-green-dark-2 text-toni-green-dark-2 rounded-full font-semibold text-base hover:bg-toni-green-dark-2 hover:text-white transition">
              <Bell size={20} />
              Notifications
            </button>
            <button className="flex items-center gap-2 px-6 py-2 border-2 border-toni-green-dark-2 text-toni-green-dark-2 rounded-full font-semibold text-base hover:bg-toni-green-dark-2 hover:text-white transition">
              <ShoppingCart size={20} />
              Mon Panier
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-80px)] p-6 flex flex-col justify-between">
          <nav className="space-y-2">
            <Link href="/accueil" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition text-base">
              <Home size={20} />
              <span>Accueil</span>
            </Link>
            <Link href="/profil" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition text-base">
              <User size={20} />
              <span>Mon compte</span>
            </Link>
            <Link href="/commandes" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition text-base">
              <Package size={20} />
              <span>Mes commandes</span>
            </Link>
            <Link href="/notifications" className="flex items-center gap-3 px-4 py-3 bg-toni-green-light text-toni-green-dark-2 rounded-lg font-semibold text-base">
              <Bell size={20} />
              <span>Notifications</span>
            </Link>
            <Link href="/panier" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition text-base">
              <ShoppingCart size={20} />
              <span>Mon Panier</span>
            </Link>
            <Link href="/aide" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition text-base">
              <HelpCircle size={20} />
              <span>Centre d'aide</span>
            </Link>
            <button className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition w-full text-base">
              <LogOut size={20} />
              <span>Déconnexion</span>
            </button>
          </nav>

          {/* Footer Links in Sidebar */}
          <div className="flex flex-col gap-2 text-sm text-toni-green-dark-2 mt-6">
            <Link href="/confidentialite" className="hover:underline">
              Politique de confidentialité,
            </Link>
            <Link href="/retour" className="hover:underline">
              Conditions générales de retour,
            </Link>
            <Link href="/contact" className="hover:underline">
              Contactez-nous
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
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
                  <div
                    key={notification.id}
                    className="bg-white rounded-lg p-6 flex items-start gap-4 shadow-sm border border-gray-200"
                  >
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full border-2 border-toni-green-dark-2 flex items-center justify-center bg-white">
                        <img src="/images/logo.png" alt="Toni360" className="w-8 h-8 object-contain" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-base mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {notification.description}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="flex-shrink-0 text-red-600 hover:text-red-700 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
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
        </main>
      </div>
    </div>
  );
}
