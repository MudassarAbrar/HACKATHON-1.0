import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/product-card";
import { getFeaturedProducts, getNewArrivals, products } from "@/lib/products";
import { ArrowRight, Sparkles, Star, Truck, Shield, RotateCcw, ArrowDown } from "lucide-react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";

interface HomeProps {
  onChatOpen: () => void;
}

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function TextRevealLine({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="text-reveal-line">
      <motion.div
        initial={{ y: "110%" }}
        animate={isInView ? { y: "0%" } : { y: "110%" }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function Marquee({ items, speed = "normal" }: { items: string[]; speed?: "normal" | "slow" }) {
  const content = items.join(" \u2022 ");
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <div className={`marquee-track ${speed === "slow" ? "animate-marquee-slow" : "animate-marquee"}`}>
        <span className="inline-block pr-8 editorial-subheading text-muted-foreground/40">
          {content} &nbsp;&bull;&nbsp; {content} &nbsp;&bull;&nbsp;
        </span>
        <span className="inline-block pr-8 editorial-subheading text-muted-foreground/40">
          {content} &nbsp;&bull;&nbsp; {content} &nbsp;&bull;&nbsp;
        </span>
      </div>
    </div>
  );
}

export default function Home({ onChatOpen }: HomeProps) {
  const featured = getFeaturedProducts();
  const newArrivals = getNewArrivals();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen">
      <section ref={heroRef} className="relative h-screen flex items-end overflow-hidden" data-testid="section-hero">
        <motion.div className="absolute inset-0" style={{ y: heroImageY }}>
          <img
            src="/images/hero-main.png"
            alt="Fashion editorial"
            className="w-full h-full object-cover scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-[#0a0a12]/60 to-[#1a0a2e]/30" />
        </motion.div>

        <motion.div
          className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-20 sm:pb-28"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="editorial-subheading text-[hsl(247,75%,75%)]/60 mb-6"
            data-testid="badge-hero-tag"
          >
            AI-Powered Fashion
          </motion.div>

          <div className="max-w-4xl">
            <TextRevealLine delay={0.3}>
              <h1 className="editorial-heading text-5xl sm:text-7xl lg:text-8xl text-white" data-testid="text-hero-title">
                Don't just shop.
              </h1>
            </TextRevealLine>
            <TextRevealLine delay={0.5}>
              <h1 className="editorial-heading text-5xl sm:text-7xl lg:text-8xl text-[hsl(247,75%,72%)]">
                Get styled.
              </h1>
            </TextRevealLine>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-8 text-base sm:text-lg text-white/40 max-w-xl leading-relaxed"
          >
            Meet Sophia, your AI personal stylist. Describe what you need
            and watch as your perfect wardrobe comes together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="flex flex-wrap items-center gap-4 mt-10"
          >
            <Link href="/shop">
              <Button className="gap-2 px-8" data-testid="button-shop-now">
                Shop Collection
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              className="gap-2 bg-white/5 border-[hsl(247,75%,64%)]/30 text-white backdrop-blur-sm"
              onClick={onChatOpen}
              data-testid="button-talk-sophia"
            >
              <Sparkles className="w-4 h-4" />
              Talk to Sophia
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2"
          >
            <span className="editorial-subheading text-white/20 text-[0.6rem]">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="w-4 h-4 text-white/20" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-6 border-b border-border/20 overflow-hidden">
        <Marquee
          items={["Free Shipping Over $100", "Secure Checkout", "30-Day Returns", "AI Styling", "Curated Collections", "Luxury Materials"]}
          speed="slow"
        />
      </section>

      <section className="py-20 sm:py-28" data-testid="section-featured">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <ScrollReveal>
            <div className="flex items-end justify-between gap-4 mb-12">
              <div>
                <p className="editorial-subheading text-primary/60 mb-3">Curated for you</p>
                <h2 className="editorial-heading text-3xl sm:text-4xl lg:text-5xl text-foreground" data-testid="text-featured-title">
                  Featured Pieces
                </h2>
              </div>
              <Link href="/shop">
                <Button variant="ghost" className="text-sm text-muted-foreground gap-1" data-testid="link-view-all-featured">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((product, i) => (
              <ScrollReveal key={product.id} delay={i * 0.1}>
                <ProductCard product={product} index={i} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-32 sm:py-40 overflow-hidden" data-testid="section-sophia-cta">
        <div className="absolute inset-0">
          <img
            src="/images/hero-collection.png"
            alt="Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a12] via-[#0a0a12]/90 to-[#1a0a2e]/60" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <ScrollReveal>
                <p className="editorial-subheading text-[hsl(247,75%,72%)]/70 mb-4">Meet Sophia</p>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <h2 className="editorial-heading text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
                  Your AI stylist,
                  <br />
                  <span className="text-[hsl(247,75%,72%)]">always on.</span>
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p className="mt-6 text-white/40 leading-relaxed text-lg max-w-md">
                  Describe your ideal look, negotiate prices, get outfit
                  recommendations, and shop entirely through conversation.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.3}>
                <div className="mt-8 flex flex-wrap gap-3">
                  {["Semantic Search", "Haggle Mode", "Outfit Builder", "Voice Shopping"].map((feature) => (
                    <Badge
                      key={feature}
                      variant="secondary"
                      className="bg-[hsl(247,75%,64%)]/10 text-[hsl(247,75%,80%)]/70 border-[hsl(247,75%,64%)]/20"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.4}>
                <Button className="mt-10 gap-2 px-8" onClick={onChatOpen} data-testid="button-sophia-cta">
                  <Sparkles className="w-4 h-4" />
                  Start a Conversation
                </Button>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={0.3} className="hidden lg:block">
              <div className="relative">
                <div className="bg-[hsl(263,30%,9%)]/80 glass-panel-purple rounded-md p-6 border border-[hsl(247,75%,64%)]/15 max-w-sm ml-auto sophia-glow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[hsl(247,75%,64%)]/15 flex items-center justify-center animate-pulse-glow">
                      <Sparkles className="w-5 h-5 text-[hsl(247,75%,72%)]" />
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">Sophia</p>
                      <p className="text-[10px] text-white/40">AI Stylist</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-[hsl(247,75%,64%)]/10 border border-[hsl(247,75%,64%)]/10 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-white/80">
                      I found the perfect wedding outfit for you! Here's what I suggest...
                    </div>
                    <div className="bg-[hsl(247,75%,64%)]/80 rounded-2xl rounded-br-sm px-4 py-2.5 text-sm text-white ml-auto max-w-[80%]">
                      Can you make it under $300?
                    </div>
                    <div className="bg-[hsl(43,100%,70%)]/10 border border-[hsl(43,100%,70%)]/15 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-[hsl(43,100%,80%)] gold-glow">
                      Absolutely! Use code SOPHIA-15 for 15% off the bundle.
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-6 overflow-hidden border-y border-border/20">
        <Marquee items={["Clothing", "Footwear", "Accessories", "New Arrivals", "Dresses", "Blazers", "Sneakers", "Watches"]} />
      </section>

      <section className="py-20 sm:py-28" data-testid="section-new-arrivals">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <ScrollReveal>
            <div className="flex items-end justify-between gap-4 mb-12">
              <div>
                <p className="editorial-subheading text-primary/60 mb-3">Just dropped</p>
                <h2 className="editorial-heading text-3xl sm:text-4xl lg:text-5xl text-foreground" data-testid="text-new-arrivals-title">
                  New Arrivals
                </h2>
              </div>
              <Link href="/shop">
                <Button variant="ghost" className="text-sm text-muted-foreground gap-1" data-testid="link-view-all-new">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product, i) => (
              <ScrollReveal key={product.id} delay={i * 0.1}>
                <ProductCard product={product} index={i} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <ScrollReveal>
            <blockquote className="max-w-4xl mx-auto text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8 animate-pulse-glow">
                <Sparkles className="w-6 h-6 text-primary/60" />
              </div>
              <p className="editorial-heading text-2xl sm:text-3xl lg:text-4xl text-foreground leading-relaxed">
                "Every outfit tells a story. Every detail, a choice.
                <span className="text-muted-foreground"> This is where we dress deeper &mdash; finding the pieces that speak to who you are."</span>
              </p>
              <footer className="mt-8">
                <p className="editorial-subheading text-primary/50">Sophia, AI Stylist</p>
              </footer>
            </blockquote>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 sm:py-28 bg-card" data-testid="section-categories">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <ScrollReveal>
            <div className="text-center mb-14">
              <p className="editorial-subheading text-primary/50 mb-3">Browse by</p>
              <h2 className="editorial-heading text-3xl sm:text-4xl lg:text-5xl text-foreground">
                Shop Categories
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "Clothing", count: products.filter((p) => p.category === "clothing").length, href: "/shop?category=clothing", image: "/images/products/cashmere-turtleneck.png" },
              { name: "Footwear", count: products.filter((p) => p.category === "footwear").length, href: "/shop?category=footwear", image: "/images/products/chelsea-boots.png" },
              { name: "Accessories", count: products.filter((p) => p.category === "accessories").length, href: "/shop?category=accessories", image: "/images/products/leather-watch.png" },
            ].map((cat, i) => (
              <ScrollReveal key={cat.name} delay={i * 0.15}>
                <Link href={cat.href}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="relative aspect-[3/4] rounded-md overflow-hidden cursor-pointer group"
                    data-testid={`card-category-${cat.name.toLowerCase()}`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12]/90 via-[#1a0a2e]/30 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="editorial-heading text-2xl sm:text-3xl text-white">
                        {cat.name}
                      </h3>
                      <p className="editorial-subheading text-white/40 mt-2">{cat.count} items</p>
                      <div className="mt-4 h-[1px] bg-white/10 relative overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-primary"
                          initial={{ width: "0%" }}
                          whileInView={{ width: "100%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, delay: 0.5 + i * 0.2 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 border-b border-border/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders over $100" },
              { icon: Shield, title: "Secure Checkout", desc: "100% protected payment" },
              { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.1}>
                <div className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/20 py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="editorial-heading text-xl text-foreground mb-4">
                The Shopkeeper
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered fashion, curated by Sophia.
              </p>
            </div>
            <div>
              <h5 className="editorial-subheading text-foreground mb-4">Shop</h5>
              <ul className="space-y-3">
                {["Clothing", "Footwear", "Accessories", "New Arrivals"].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-muted-foreground cursor-pointer transition-colors" data-testid={`link-footer-${item.toLowerCase().replace(/\s+/g, "-")}`}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="editorial-subheading text-foreground mb-4">Help</h5>
              <ul className="space-y-3">
                {["FAQs", "Shipping", "Returns", "Contact"].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-muted-foreground cursor-pointer">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="editorial-subheading text-foreground mb-4">Company</h5>
              <ul className="space-y-3">
                {["About", "Careers", "Press", "Terms"].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-muted-foreground cursor-pointer">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/20 text-center">
            <p className="text-xs text-muted-foreground/40">
              Built with AI by Team AgentX for Softronix 4.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
