import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/header";
import CartDrawer from "@/components/cart-drawer";
import ChatPanel from "@/components/chat-panel";
import Home from "@/pages/home";
import Shop from "@/pages/shop";
import ProductDetail from "@/pages/product-detail";
import AuthCallback from "@/pages/auth/callback";
import Login from "@/pages/login";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import { useState } from "react";

function Router({
  onChatOpen,
}: {
  onChatOpen: () => void;
}) {
  return (
    <Switch>
      <Route path="/" component={() => <Home onChatOpen={onChatOpen} />} />
      <Route path="/shop" component={Shop} />
      <Route
        path="/product/:id"
        component={() => <ProductDetail onChatOpen={onChatOpen} />}
      />
      <Route path="/login" component={Login} />
      <Route path="/profile" component={Profile} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Header
                onCartOpen={() => setCartOpen(true)}
                onChatOpen={() => setChatOpen(true)}
              />
              <Router onChatOpen={() => setChatOpen(true)} />
              <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
              <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />
            </div>
            <Toaster />
          </ThemeProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
