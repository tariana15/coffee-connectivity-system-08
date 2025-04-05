
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Package, LineChart, DollarSign, MessageSquare, FileText, BadgePercent, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export const BottomNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isOwner = user?.role === "owner";

  const navItems = [
    {
      name: "Главная",
      icon: Home,
      href: "/",
      allowed: true
    },
    {
      name: "Товары",
      icon: Package,
      href: "/inventory",
      allowed: isOwner
    },
    {
      name: "Касса",
      icon: DollarSign,
      href: "/cash-register",
      allowed: true
    },
    {
      name: "Бонусы",
      icon: BadgePercent,
      href: "/bonuses",
      allowed: true
    },
    {
      name: "Накладные",
      icon: FileText,
      href: "/invoices",
      allowed: true
    },
    {
      name: "Чат",
      icon: MessageSquare,
      href: "/chat",
      allowed: true,
      badge: user?.coffeeShopName
    },
    {
      name: "Зарплата",
      icon: CreditCard,
      href: "/salary",
      allowed: isOwner
    }
  ];

  // Only show up to 5 items on mobile
  const visibleNavItems = navItems
    .filter(item => item.allowed)
    .slice(0, 5);

  return (
    <div className="fixed bottom-0 left-0 z-10 w-full border-t border-border bg-background">
      <div className="flex h-16 items-center justify-around">
        {visibleNavItems.map(item => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 px-2",
              location.pathname === item.href ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon size={24} />
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
