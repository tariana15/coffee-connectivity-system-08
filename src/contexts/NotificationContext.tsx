
import React, { createContext, useContext, useState } from "react";
import { Notification, NotificationContextType } from "@/types/notification";
import { toast } from "@/hooks/use-toast";

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Demo notifications
const demoNotifications: Notification[] = [
  {
    id: "1",
    title: "Низкий запас",
    message: "Заканчивается молоко и шоколадный сироп",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    type: "warning"
  },
  {
    id: "2",
    title: "Новое сообщение",
    message: "Анна: Я задержусь на 15 минут сегодня",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    type: "info"
  },
  {
    id: "3",
    title: "Хорошие продажи!",
    message: "Выручка за сегодня превысила план на 15%",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    type: "success"
  }
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, "id" | "read" | "createdAt">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 11),
      read: false,
      createdAt: new Date()
    };
    setNotifications(prev => [newNotification, ...prev]);
    // Show toast for new notification
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === "error" ? "destructive" : "default"
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

