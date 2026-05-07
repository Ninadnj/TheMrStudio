import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Languages } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { stripDecorativeSymbols } from "@/lib/sanitizeText";

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
      setMessages(prev => [...prev, { role: "assistant", content: stripDecorativeSymbols(response) }]);
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

  const handleClose = () => {
    setIsOpen(false);
    setMessages([]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-1/2 right-0 z-50 flex -translate-y-1/2 flex-col items-center gap-2 rounded-l-[8px] bg-theme-accent px-3 py-5 text-white shadow-[0_20px_60px_-42px_rgba(0,0,0,0.7)] transition-all duration-300 hover:bg-theme-accent-hover"
        data-testid="button-open-chat"
        aria-label={language === "ka" ? "ჩატის გახსნა" : "Open chat"}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium rotate-180" style={{ writingMode: 'vertical-rl' }}>
          {language === "ka" ? "ჩატი" : "Chat"}
        </span>
      </button>

      <div
        className={`fixed bottom-6 right-4 z-40 flex h-[min(520px,calc(100svh-3rem))] w-[calc(100vw-2rem)] max-w-[360px] transform flex-col overflow-hidden rounded-[8px] border border-border bg-background shadow-[0_30px_90px_-58px_rgba(0,0,0,0.75)] transition-transform duration-300 ease-in-out sm:right-6 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[var(--theme-accent)]"></div>
            <span className="font-semibold text-base">
              <span className="text-foreground/40">THE</span>{" "}
              <span className="text-foreground font-bold">MR</span>{" "}
              <span className="text-foreground/40">Studio</span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 hover-elevate"
            data-testid="button-close-chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 px-4 py-3 bg-muted/30 border-b border-border">
          <button
            onClick={() => setLanguage("ka")}
            className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              language === "ka"
                ? "bg-theme-accent text-white"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
            data-testid="button-language-ka"
          >
            ქართული
          </button>
          <button
            onClick={() => setLanguage("en")}
            className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              language === "en"
                ? "bg-theme-accent text-white"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
            data-testid="button-language-en"
          >
            English
          </button>
        </div>

        <ScrollArea className="flex-1 px-4 py-3">
          <div ref={scrollRef} className="space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageCircle className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
                <p className="text-muted-foreground text-sm">
                  {language === "ka" 
                    ? "გამარჯობა! როგორ შემიძლია დაგეხმაროთ?"
                    : "Hello! How can I help you today?"}
                </p>
              </div>
            )}
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-[8px] px-4 py-3 ${
                    message.role === "user"
                      ? "bg-theme-accent text-white shadow-sm"
                      : "bg-muted/50 text-foreground border border-border/50"
                  }`}
                  data-testid={`message-${message.role}-${idx}`}
                >
                  <p className="text-sm leading-relaxed">{stripDecorativeSymbols(message.content)}</p>
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="rounded-[8px] border border-border/50 bg-muted/50 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={language === "ka" ? "შეიყვანეთ შეტყობინება..." : "Type a message..."}
              disabled={chatMutation.isPending}
              className="flex-1 rounded-full"
              data-testid="input-chat-message"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full bg-theme-accent hover:bg-theme-accent-hover"
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
