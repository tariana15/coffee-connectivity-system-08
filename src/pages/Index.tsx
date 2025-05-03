
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const [isReady, setIsReady] = useState(false);
  
  // Добавляем небольшую задержку, чтобы приложение успело инициализироваться
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isReady || loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-100 to-green-100">
        <img 
          src="/public/lovable-uploads/665a6ff0-b690-476a-958c-5788895aea23.png" 
          alt="Coffee Dinosaur" 
          className="h-24 w-24 mb-4"
        />
        <h1 className="text-3xl font-bold text-center text-purple-600 mb-6">Кофейный Динозавр</h1>
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        <p className="mt-4 text-lg text-purple-700">Загрузка приложения...</p>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

export default Index;
