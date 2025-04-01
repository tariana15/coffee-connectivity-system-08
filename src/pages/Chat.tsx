
import React, { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Image, Send, PaperclipIcon } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: number;
  image?: string;
}

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load messages from localStorage
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Add a welcome message if no messages exist
      const welcomeMessage: Message = {
        id: "welcome",
        userId: "system",
        userName: "Система",
        content: "Добро пожаловать в чат сотрудников! Обсуждайте рабочие вопросы и делитесь фотографиями.",
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
      localStorage.setItem("chatMessages", JSON.stringify([welcomeMessage]));
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if ((!newMessage.trim() && !imagePreview) || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatarUrl,
      content: newMessage,
      timestamp: Date.now(),
      image: imagePreview || undefined,
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
    setNewMessage("");
    setImagePreview(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="bg-background border-b p-4">
          <h1 className="text-xl font-semibold">Чат сотрудников</h1>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.userId === user?.id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.userId === user?.id ? "flex-row-reverse" : "flex-row"
                } items-start gap-2`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={message.userAvatar} />
                  <AvatarFallback>
                    {message.userName.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div
                    className={`rounded-lg p-3 ${
                      message.userId === user?.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-xs font-medium mb-1">{message.userName}</p>
                    {message.image && (
                      <div className="mb-2">
                        <img
                          src={message.image}
                          alt="Shared"
                          className="rounded-md max-w-full"
                        />
                      </div>
                    )}
                    {message.content && <p className="whitespace-pre-line">{message.content}</p>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(message.timestamp), "HH:mm")}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="p-2 border-t">
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 w-auto rounded-md"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 h-6 w-6 rounded-full bg-background"
                onClick={() => setImagePreview(null)}
              >
                ×
              </Button>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="border-t p-4">
          <div className="flex items-end gap-2">
            <Textarea
              placeholder="Введите сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] flex-1"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-5 w-5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
              </Button>
              <Button type="button" onClick={handleSendMessage}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Chat;
