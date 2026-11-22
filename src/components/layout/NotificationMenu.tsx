import React, { useState, useEffect } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Bell,
  CheckCheck,
  Trash2,
  Inbox,
  Sparkles,
  Trophy,
  Info,
  X,
} from 'lucide-react';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
  type NotificationItem,
} from '../../lib/api/notifications';

function formatRelativeTime(dateString: string): string {
  try {
    const now = Date.now();
    const past = new Date(dateString).getTime();
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

export const NotificationMenu: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // In case user is offline or not logged in
    }
  };

  useEffect(() => {
    loadNotifications();

    // Listen for custom platform sync events
    const handleSync = () => loadNotifications();
    window.addEventListener('leadnivash_data_changed', handleSync);
    window.addEventListener('focus', handleSync);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadNotifications();
      }
    }, 15000);

    return () => {
      window.removeEventListener('leadnivash_data_changed', handleSync);
      window.removeEventListener('focus', handleSync);
      clearInterval(interval);
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all notifications read:', err);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.warn('Failed to delete notification:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to clear notifications:', err);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'inquiry':
        return <Inbox className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'match':
        return <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />;
      case 'deal':
        return <Trophy className="w-4 h-4 text-amber-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  return (
    <DropdownMenu.Root onOpenChange={(open) => open && loadNotifications()}>
      <DropdownMenu.Trigger asChild>
        <button
          className="relative w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer focus:outline-none"
          aria-label="Notifications"
          title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        >
          <Bell className="w-5 h-5 sm:w-4 sm:h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 min-w-[16px] h-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 w-[320px] sm:w-[380px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 text-left overflow-hidden"
          sideOffset={8}
          align="end"
        >
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-heading">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-muted hover:text-danger font-semibold flex items-center gap-1 cursor-pointer transition"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* List of Notifications */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length === 0 ? (
              /* Genuine Zero Notifications State */
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-xs">
                  <Bell className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                    No new notifications
                  </h4>
                  <p className="text-xs text-muted max-w-[240px] mx-auto leading-relaxed">
                    You're all caught up! Real inquiries, deal milestones, and match alerts will appear here.
                  </p>
                </div>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkSingleRead(n.id)}
                  className={`p-3.5 flex items-start justify-between gap-3 transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                    !n.isRead ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      {getIcon(n.type)}
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5
                          className={`text-xs truncate ${
                            !n.isRead
                              ? 'font-black text-slate-900 dark:text-white'
                              : 'font-semibold text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {n.title}
                        </h5>
                        <span className="text-[10px] text-muted whitespace-nowrap">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>

                  {/* Delete individual notification button */}
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, n.id)}
                    className="w-6 h-6 rounded-lg text-slate-400 hover:text-danger hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center transition shrink-0 cursor-pointer"
                    title="Delete notification"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
