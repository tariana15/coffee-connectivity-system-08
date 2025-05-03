
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types/auth";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [coffeeShopName, setCoffeeShopName] = useState("");
  const [role, setRole] = useState<UserRole>("owner");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !coffeeShopName) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name,
        email,
        password,
        role,
        coffeeShopName,
        employeeCount: role === "owner" || role === "manager" ? 0 : undefined,
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Ошибка регистрации",
        description: "Не удалось создать аккаунт",
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
              src="/public/lovable-uploads/89979109-cb3c-45e7-8df3-11753334b10b.png" 
              alt="Coffee Dinosaur" 
              className="h-24 w-24 mb-4"
            />
            <h1 className="text-3xl font-bold text-center text-purple-600">Кофейный Динозавр</h1>
            <p className="text-gray-500 mt-2 text-center">Создайте аккаунт для управления кофейней</p>
          </div>
          
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">Имя</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван Иванов"
                className="w-full p-3 rounded-lg border border-gray-200"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
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
                className="w-full p-3 rounded-lg border border-gray-200"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="coffeeShopName" className="text-gray-700">Название кофейни</Label>
              <Input
                id="coffeeShopName"
                value={coffeeShopName}
                onChange={(e) => setCoffeeShopName(e.target.value)}
                placeholder="Уютная Кофейня"
                className="w-full p-3 rounded-lg border border-gray-200"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-700">Роль</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
                className="flex flex-wrap gap-4"
                defaultValue="owner"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="owner" id="owner" />
                  <Label htmlFor="owner" className="cursor-pointer">
                    Владелец
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manager" id="manager" />
                  <Label htmlFor="manager" className="cursor-pointer">
                    Менеджер
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="employee" id="employee" />
                  <Label htmlFor="employee" className="cursor-pointer">
                    Сотрудник
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <Button 
              type="submit" 
              className="w-full p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg mt-4" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Создание..." : "Создать аккаунт"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Уже есть аккаунт?{" "}
              <Link to="/login" className="text-purple-600 hover:underline font-medium">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Register;
