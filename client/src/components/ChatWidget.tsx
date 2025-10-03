import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Languages, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState<"ka" | "en">("ka");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const newMessages = [...messages, { role: "user" as const, content: userMessage }];
      const res = await apiRequest("POST", "/api/chat", { messages: newMessages, language });
      const data = await res.json();
      return data.response;
    },
    onSuccess: (response) => {
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: language === "ka" ? "შეცდომა" : "Error",
        description: language === "ka" 
          ? "ვერ მოხერხდა პასუხის მიღება. გთხოვთ სცადოთ თავიდან."
          : "Failed to get response. Please try again.",
      });
    },
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    
    setMessages(prev => [...prev, { role: "user", content: input }]);
    chatMutation.mutate(input);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === "ka" ? "en" : "ka");
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-theme-accent hover:bg-theme-accent-hover z-50"
        data-testid="button-open-chat"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[32rem] bg-theme-surface border border-theme-line rounded-lg shadow-2xl flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b border-theme-line">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="font-medium text-theme">
            {language === "ka" ? "დახმარების ასისტენტი" : "Chat Assistant"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="h-8 w-8"
            data-testid="button-toggle-language"
          >
            <Languages className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
            data-testid="button-close-chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div ref={scrollRef} className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-theme-muted py-8">
              {language === "ka" 
                ? "გამარჯობა! როგორ შემიძლია დაგეხმაროთ?"
                : "Hello! How can I help you today?"}
            </div>
          )}
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-theme-accent text-white"
                    : "bg-muted text-theme"
                }`}
                data-testid={`message-${message.role}-${idx}`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-muted text-theme-muted rounded-lg px-4 py-2">
                <span className="animate-pulse">...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-theme-line">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={language === "ka" ? "შეიყვანეთ შეტყობინება..." : "Type a message..."}
            disabled={chatMutation.isPending}
            className="flex-1"
            data-testid="input-chat-message"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            size="icon"
            className="bg-theme-accent hover:bg-theme-accent-hover"
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
