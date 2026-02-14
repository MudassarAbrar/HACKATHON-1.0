import { Link, useLocation } from "wouter";
import { ShoppingBag, MessageCircle, Sun, Moon, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-provider";
import { useCart } from "@/lib/cart-store";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  onCartOpen: () => void;
  onChatOpen: () => void;
}

export default function Header({ onCartOpen, onChatOpen }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/shop?category=clothing", label: "Clothing" },
    { href: "/shop?category=footwear", label: "Footwear" },
    { href: "/shop?category=accessories", label: "Accessories" },
  ];

  const isHome = location === "/";
  const showTransparent = isHome && !scrolled;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        showTransparent
          ? "bg-transparent border-b border-transparent"
          : "glass-panel-purple border-b border-[hsl(247,75%,64%)]/10"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-4 h-16 sm:h-20">
          <Link href="/" data-testid="link-home">
            <motion.span
              className={`font-serif text-lg sm:text-xl font-bold tracking-[0.15em] transition-colors duration-500 ${
                showTransparent ? "text-white" : "text-foreground"
              }`}
              whileHover={{ opacity: 0.7 }}
              transition={{ duration: 0.2 }}
            >
              THE SHOPKEEPER
            </motion.span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`text-xs font-medium uppercase tracking-[0.15em] transition-all duration-300 ${
                    location === link.href
                      ? showTransparent ? "text-white" : "text-foreground"
                      : showTransparent ? "text-white/40" : "text-muted-foreground"
                  }`}
                  data-testid={`nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleTheme}
              className={showTransparent ? "text-white/60" : ""}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={onChatOpen}
              className={showTransparent ? "text-white/60" : ""}
              data-testid="button-chat-toggle"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={onCartOpen}
              className={`relative ${showTransparent ? "text-white/60" : ""}`}
              data-testid="button-cart-toggle"
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center"
                  data-testid="text-cart-count"
                >
                  {itemCount}
                </motion.span>
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className={`md:hidden ${showTransparent ? "text-white/60" : ""}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-border/20 glass-panel-purple"
          >
            <nav className="flex flex-col p-6 gap-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={link.href}>
                    <span
                      className={`block py-3 text-sm font-medium uppercase tracking-[0.15em] transition-colors ${
                        location === link.href
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid={`mobile-nav-${link.label.toLowerCase()}`}
                    >
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
