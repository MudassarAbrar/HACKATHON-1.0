import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Bot, User, ShoppingBag } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/api-client";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-store";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";

interface ChatPanelProps {
  open: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  timestamp: Date;
}

const SOPHIA_INTRO = `Hey there! I'm Sophia, your personal style assistant. I can help you find the perfect outfit, recommend pieces based on your style, and even negotiate a deal for you. What are you looking for today?`;

// Simple client-side search function
function searchProductsLocally(products: Product[], query: string): Product[] {
  const lower = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      p.category.toLowerCase().includes(lower) ||
      p.subcategory.toLowerCase().includes(lower) ||
      p.tags?.some((t) => t.toLowerCase().includes(lower))
  );
}

function generateResponse(message: string, allProducts: Product[]): { text: string; recommendedProducts: Product[]; mood: "warm" | "playful" | "expert" | "empathetic" } {
  const lower = message.toLowerCase();

  if (lower.includes("discount") || lower.includes("cheaper") || lower.includes("deal") || lower.includes("birthday")) {
    if (lower.includes("birthday")) {
      return {
        text: `Happy Birthday! Since it's your special day, I've got something for you. Use code BDAY-20 for 20% off your next purchase! It expires in 15 minutes, so don't wait too long.`,
        recommendedProducts: [],
        mood: "playful",
      };
    }
    return {
      text: `I love a good negotiation! Here's what I can do - use code LOYAL-10 for 10% off. But if you tell me you're buying 3+ items, I might be able to do better...`,
      recommendedProducts: [],
      mood: "playful",
    };
  }

  if (lower.includes("expensive") || lower.includes("too much") || lower.includes("can't afford")) {
    return {
      text: `I completely understand. Let me find some amazing options in a lower price range. Quality doesn't have to break the bank! Here are some beautifully crafted pieces under $100:`,
      recommendedProducts: allProducts.filter((p) => p.price < 100).slice(0, 4),
      mood: "empathetic",
    };
  }

  if (lower.includes("summer") || lower.includes("beach") || lower.includes("vacation")) {
    const results = allProducts.filter((p) =>
      p.subcategory.toLowerCase().includes("summer") ||
      p.tags?.some(t => t.toLowerCase().includes("summer") || t.toLowerCase().includes("beach"))
    ).slice(0, 4);
    return {
      text: `Perfect timing! Here are some gorgeous summer picks. ${results[0] ? `The ${results[0].name} is a bestseller - elegant and perfect for warm days. Want me to build a complete outfit?` : "Check out these beautiful pieces!"}`,
      recommendedProducts: results,
      mood: "warm",
    };
  }

  if (lower.includes("wedding") || lower.includes("formal")) {
    const results = allProducts.filter((p) =>
      p.tags?.some(t => t.toLowerCase().includes("wedding") || t.toLowerCase().includes("formal")) ||
      p.subcategory.toLowerCase().includes("formal")
    ).slice(0, 4);
    return {
      text: `Love a wedding look! I've pulled some stunning options. ${results[0] ? `The ${results[0].name} is perfect for special occasions. Shall I pair them up?` : "Check out these elegant pieces!"}`,
      recommendedProducts: results,
      mood: "expert",
    };
  }

  if (lower.includes("dress") || lower.includes("dresses")) {
    const results = allProducts.filter((p) => p.subcategory.toLowerCase().includes("dress"));
    return {
      text: `I've got some beautiful dresses for you! ${results.length > 0 ? "These are effortlessly chic. Which vibe are you going for?" : "Let me find something perfect for you!"}`,
      recommendedProducts: results.slice(0, 4),
      mood: "warm",
    };
  }

  if (lower.includes("shoes") || lower.includes("footwear") || lower.includes("boots") || lower.includes("sneakers")) {
    const results = allProducts.filter((p) => p.category === "footwear");
    return {
      text: `Great taste! ${results.length > 0 ? "These pieces are incredibly versatile. What's the occasion?" : "Let me show you some great options!"}`,
      recommendedProducts: results.slice(0, 4),
      mood: "expert",
    };
  }

  if (lower.includes("bag") || lower.includes("bags") || lower.includes("accessories")) {
    const results = allProducts.filter((p) => p.category === "accessories").slice(0, 4);
    return {
      text: `Accessories can make or break an outfit! What's your style preference?`,
      recommendedProducts: results,
      mood: "expert",
    };
  }

  if (lower.includes("outfit") || lower.includes("build")) {
    const clothing = allProducts.filter(p => p.category === "clothing").slice(0, 1);
    const footwear = allProducts.filter(p => p.category === "footwear").slice(0, 1);
    const accessories = allProducts.filter(p => p.category === "accessories").slice(0, 2);
    const outfit = [...clothing, ...footwear, ...accessories];
    const total = outfit.reduce((s, p) => s + p.price, 0);
    return {
      text: `Here's a curated outfit I put together! Total: $${total.toFixed(2)} - want me to add the whole bundle to your bag?`,
      recommendedProducts: outfit,
      mood: "expert",
    };
  }

  const results = searchProductsLocally(allProducts, message);
  if (results.length > 0) {
    return {
      text: `I found ${results.length} item${results.length > 1 ? "s" : ""} matching what you're looking for! Here are my top picks. Want me to filter or sort them differently?`,
      recommendedProducts: results.slice(0, 4),
      mood: "warm",
    };
  }

  return {
    text: `I'd love to help with that! Try telling me what occasion you're shopping for, your budget, or describe what you have in mind. For example: "I need a summer wedding outfit under $300" or "Show me casual weekend looks."`,
    recommendedProducts: [],
    mood: "warm",
  };
}

export default function ChatPanel({ open, onClose }: ChatPanelProps) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "intro",
      role: "assistant",
      content: SOPHIA_INTRO,
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch all products for chat recommendations
  const { data: productsResponse } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => getProducts({}),
  });

  const allProducts = productsResponse?.success ? productsResponse.data?.items || [] : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const { text, recommendedProducts } = generateResponse(userMsg.content, allProducts);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: text,
        products: recommendedProducts.length > 0 ? recommendedProducts : undefined,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-4 border-b border-[hsl(247,75%,64%)]/10">
          <SheetTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[hsl(247,75%,64%)]/15 flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-4 h-4 text-[hsl(247,75%,72%)]" />
            </div>
            <div>
              <span className="font-serif text-base block" data-testid="text-sophia-name">Sophia</span>
              <span className="text-[10px] text-[hsl(247,75%,64%)]/50 font-normal">Your Personal Stylist</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[hsl(247,75%,64%)]/15 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-[hsl(247,75%,72%)]" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] space-y-2 ${msg.role === "user" ? "order-first" : ""
                    }`}
                >
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${msg.role === "user"
                      ? "bg-[hsl(247,75%,64%)] text-white rounded-br-sm"
                      : "bg-[hsl(247,75%,64%)]/10 border border-[hsl(247,75%,64%)]/10 text-foreground rounded-bl-sm"
                      }`}
                    data-testid={`chat-message-${msg.id}`}
                  >
                    {msg.content}
                  </div>

                  {msg.products && msg.products.length > 0 && (
                    <div className="space-y-2">
                      {msg.products.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-card border border-[hsl(247,75%,64%)]/10"
                          data-testid={`chat-product-${product.id}`}
                        >
                          <div className="w-10 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={product.image_urls?.[0] || "/images/placeholder.png"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link href={`/product/${product.id}`} onClick={onClose}>
                              <p className="text-xs font-medium text-foreground truncate cursor-pointer">
                                {product.name}
                              </p>
                            </Link>
                            <p className="text-xs text-[hsl(247,75%,72%)] font-semibold">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="flex-shrink-0"
                            onClick={() => user && addItem(user.id, String(product.id))}
                            data-testid={`button-chat-add-${product.id}`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3.5 h-3.5 text-secondary-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 items-start"
            >
              <div className="w-7 h-7 rounded-full bg-[hsl(247,75%,64%)]/15 flex items-center justify-center flex-shrink-0 animate-pulse-glow">
                <Bot className="w-3.5 h-3.5 text-[hsl(247,75%,72%)]" />
              </div>
              <div className="bg-[hsl(247,75%,64%)]/10 border border-[hsl(247,75%,64%)]/10 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(247,75%,64%)]/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(247,75%,64%)]/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[hsl(247,75%,64%)]/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="border-t border-[hsl(247,75%,64%)]/10 p-3">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Sophia anything..."
              className="flex-1"
              data-testid="input-chat-message"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim()}
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {["Summer outfits", "Build me an outfit", "Birthday discount"].map(
              (suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                  className="text-[10px] px-2 py-1 rounded-full border border-[hsl(247,75%,64%)]/15 text-muted-foreground transition-colors hover-elevate"
                  data-testid={`button-suggestion-${suggestion.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
