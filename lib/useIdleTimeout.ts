"use client";

import { useEffect, useRef, useCallback } from "react";

const IDLE_KEY = "toni360.last_activity";
const IDLE_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
];

/**
 * Déconnecte automatiquement l'utilisateur après `timeoutMs` ms d'inactivité.
 * La dernière activité est persistée dans localStorage pour fonctionner
 * même si l'onglet est en arrière-plan ou après une nuit inactive.
 *
 * @param onTimeout  Callback appelé quand la session expire (clear + redirect)
 * @param timeoutMs  Durée d'inactivité avant déconnexion (défaut : 15 min)
 * @param enabled    Si false, le timeout d'inactivité est désactivé (ex. session
 *                    ouverte avec "Se souvenir de moi", où seule l'expiration du
 *                    token à 7 jours côté serveur doit s'appliquer)
 */
export function useIdleTimeout(onTimeout: () => void, timeoutMs = 15 * 60 * 1000, enabled = true): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const resetTimer = useCallback(() => {
    localStorage.setItem(IDLE_KEY, Date.now().toString());

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      onTimeoutRef.current();
    }, timeoutMs);
  }, [timeoutMs]);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Vérifier immédiatement si la session a déjà expiré (ex. après une nuit)
    const lastActivity = Number(localStorage.getItem(IDLE_KEY) ?? "0");
    if (lastActivity > 0 && Date.now() - lastActivity >= timeoutMs) {
      onTimeoutRef.current();
      return;
    }

    // Démarrer le timer initial
    resetTimer();

    // Écouter les événements d'activité
    const handleActivity = () => resetTimer();
    IDLE_EVENTS.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));

    // Vérification à chaque fois que l'onglet redevient visible (retour après arrière-plan)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const last = Number(localStorage.getItem(IDLE_KEY) ?? "0");
        if (last > 0 && Date.now() - last >= timeoutMs) {
          onTimeoutRef.current();
        } else {
          resetTimer();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      IDLE_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [resetTimer, timeoutMs, enabled]);
}
