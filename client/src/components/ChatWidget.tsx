import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Languages } from "lucide-react";
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

  const handleClose = () => {
    setIsOpen(false);
    setMessages([]);
    setInput("");
  };

  return (
    <>
      {/* Toggle Button - Right Side */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-1/2 right-0 -translate-y-1/2 bg-theme-accent hover:bg-theme-accent-hover text-white px-3 py-6 rounded-l-lg shadow-lg transition-all duration-300 z-50 flex flex-col items-center gap-2 writing-mode-vertical"
        data-testid="button-open-chat"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="text-sm font-medium rotate-180" style={{ writingMode: 'vertical-rl' }}>
          {language === "ka" ? "ჩატი" : "Chat"}
        </span>
      </button>

      {/* Compact Slide-in Panel */}
      <div
        className={`fixed bottom-6 right-6 h-[480px] w-[340px] bg-background border border-border rounded-none shadow-2xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border backdrop-blur-sm bg-background/95 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-none bg-emerald-500 animate-pulse"></div>
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

        {/* Language Selection */}
        <div className="flex gap-2 px-4 py-3 bg-muted/30 border-b border-border">
          <button
            onClick={() => setLanguage("ka")}
            className={`flex-1 px-3 py-1.5 rounded-none text-sm font-medium transition-colors ${
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
            className={`flex-1 px-3 py-1.5 rounded-none text-sm font-medium transition-colors ${
              language === "en"
                ? "bg-theme-accent text-white"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
            data-testid="button-language-en"
          >
            English
          </button>
        </div>

        {/* Messages */}
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
                  className={`max-w-[85%] rounded-none px-4 py-3 ${
                    message.role === "user"
                      ? "bg-theme-accent text-white shadow-sm"
                      : "bg-muted/50 text-foreground border border-border/50"
                  }`}
                  data-testid={`message-${message.role}-${idx}`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted/50 border border-border/50 rounded-none px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-none animate-bounce"></span>
                    <span className="w-2 h-2 bg-muted-foreground rounded-none animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-2 h-2 bg-muted-foreground rounded-none animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border bg-background/95 backdrop-blur-sm rounded-b-lg">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={language === "ka" ? "შეიყვანეთ შეტყობინება..." : "Type a message..."}
              disabled={chatMutation.isPending}
              className="flex-1 rounded-none"
              data-testid="input-chat-message"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              size="icon"
              className="bg-theme-accent hover:bg-theme-accent-hover rounded-none h-10 w-10 shrink-0"
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
