
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      toast({
        title: "Ошибка входа",
        description: "Неверный email или пароль",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-purple-100 to-green-100 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-xl border-none">
        <div className="flex flex-col items-center px-6 py-8">
          <div className="mb-6 flex flex-col items-center">
            <img 
              src="/public/lovable-uploads/665a6ff0-b690-476a-958c-5788895aea23.png" 
              alt="Coffee Dinosaur" 
              className="h-24 w-24 mb-4"
            />
            <h1 className="text-3xl font-bold text-center text-purple-600">Кофейный Динозавр</h1>
            <p className="text-gray-500 mt-2 text-center">Войдите в аккаунт чтобы продолжить</p>
          </div>
          
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@example.com или employee@example.com"
                className="w-full p-3 rounded-lg border border-gray-200"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                className="w-full p-3 rounded-lg border border-gray-200"
                required
              />
            </div>
            
            <div className="text-sm text-center text-gray-500">
              Для демо: <span className="font-medium">owner@example.com</span> или <span className="font-medium">employee@example.com</span>
              <br />Пароль: <span className="font-medium">password</span>
            </div>
            
            <Button 
              type="submit" 
              className="w-full p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Вход..." : "Войти"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Нет аккаунта?{" "}
              <Link to="/register" className="text-purple-600 hover:underline font-medium">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
