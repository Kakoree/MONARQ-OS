"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/app/(app)/notifications/actions";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { NotificationItem } from "@/lib/notifications";

export function NotificationBell({
  initialNotifications,
  initialUnreadCount,
}: {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  function handleItemClick(id: string) {
    const target = notifications.find((n) => n.id === id);
    if (!target || target.readAt) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    markNotificationReadAction(id);
  }

  function handleMarkAllRead() {
    setNotifications((prev) =>
      prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() }))
    );
    setUnreadCount(0);
    markAllNotificationsReadAction();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-stone transition-colors hover:text-paper focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-50 mt-2 w-80 rounded-md border border-line bg-surface-raised shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <span className="text-xs uppercase tracking-wider text-stone">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-xs text-gold hover:opacity-80"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-stone">
                    No notifications yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-line">
                    {notifications.map((n) => (
                      <li key={n.id}>
                        <Link
                          href={n.actionUrl ?? "#"}
                          onClick={() => handleItemClick(n.id)}
                          className={cn(
                            "block px-4 py-3 text-sm transition-colors hover:bg-surface",
                            !n.readAt && "bg-gold-dim/40"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-paper">{n.title}</p>
                            {!n.readAt && (
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-stone">
                            {formatRelativeTime(n.createdAt)}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function BellIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        d="M5 8a5 5 0 0 1 10 0c0 3.5 1.2 4.8 1.2 4.8H3.8S5 11.5 5 8Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8.2 15.5a1.8 1.8 0 0 0 3.6 0" strokeLinecap="round" />
    </svg>
  );
}
