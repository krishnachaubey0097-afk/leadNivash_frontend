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
        return <Inbox className="w-4 h-4 text-brand-600 shrink-0" />;
      case 'match':
        return <Sparkles className="w-4 h-4 text-info shrink-0" />;
      case 'deal':
        return <Trophy className="w-4 h-4 text-gold shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-muted shrink-0" />;
    }
  };

  return (
    <DropdownMenu.Root onOpenChange={(open) => open && loadNotifications()}>
      <DropdownMenu.Trigger asChild>
        <button
          className="relative w-10 h-10 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface-hover transition-colors duration-150 cursor-pointer focus:outline-none"
          aria-label="Notifications"
          title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 w-[320px] sm:w-[360px] bg-white dark:bg-[var(--surface)] border border-border p-0 rounded-card shadow-xl animate-in fade-in zoom-in-95 duration-150 text-left overflow-hidden"
          sideOffset={8}
          align="end"
        >
          {/* Header */}
          <div className="p-3.5 border-b border-border flex items-center justify-between bg-bg">
            <div className="flex items-center gap-2">
              <span className="text-secondary font-semibold text-ink">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-brand-50 text-brand-700 text-meta font-medium px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-meta">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-brand-700 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-muted hover:text-danger font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-card bg-brand-50 text-brand-700 flex items-center justify-center mx-auto">
                  <Bell className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-body font-semibold text-ink">
                    No new notifications
                  </h4>
                  <p className="text-secondary text-muted max-w-[240px] mx-auto leading-relaxed">
                    You're all caught up! Real inquiries, deal milestones, and match alerts will appear here.
                  </p>
                </div>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkSingleRead(n.id)}
                  className={`p-3.5 flex items-start justify-between gap-3 transition-colors duration-150 cursor-pointer hover:bg-surface-hover ${
                    !n.isRead ? 'bg-brand-50/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className="p-2 rounded-input bg-bg border border-border">
                      {getIcon(n.type)}
                    </div>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5
                          className={`text-secondary truncate ${
                            !n.isRead
                              ? 'font-semibold text-ink'
                              : 'font-medium text-muted'
                          }`}
                        >
                          {n.title}
                        </h5>
                        <span className="text-meta text-faint whitespace-nowrap">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-meta text-muted line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, n.id)}
                    className="w-7 h-7 rounded-lg text-faint hover:text-danger hover:bg-danger-bg flex items-center justify-center transition-colors duration-150 shrink-0 cursor-pointer"
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
