
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Package, LineChart, DollarSign } from "lucide-react";
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
      name: "Аналитика",
      icon: LineChart,
      href: "/analytics",
      allowed: isOwner
    },
    {
      name: "Касса",
      icon: DollarSign,
      href: "/register",
      allowed: true
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 z-10 w-full border-t border-border bg-background">
      <div className="flex h-16 items-center justify-around">
        {navItems
          .filter(item => item.allowed)
          .map(item => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "nav-item",
                location.pathname === item.href && "active"
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
