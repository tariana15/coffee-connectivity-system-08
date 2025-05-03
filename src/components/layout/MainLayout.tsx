
import React from "react";
import { Header } from "./Header";
import { BottomNavigation } from "./BottomNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen flex-col bg-background pb-16 pt-16">
      <Header />
      <main className={`flex-1 overflow-auto ${isMobile ? 'px-2 py-2' : 'p-4'}`}>{children}</main>
      <BottomNavigation />
    </div>
  );
};
