import { useParams, Link } from "wouter";
import { getProductById, products } from "@/lib/products";
import { useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ProductCard from "@/components/product-card";
import {
  ShoppingBag,
  Star,
  Heart,
  ArrowLeft,
  Truck,
  RotateCcw,
  Shield,
  Check,
  Sparkles,
  Minus,
  Plus,
} from "lucide-react";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface ProductDetailProps {
  onChatOpen: () => void;
}

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function ProductDetail({ onChatOpen }: ProductDetailProps) {
  const params = useParams<{ id: string }>();
  const product = getProductById(Number(params.id));
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <p className="editorial-heading text-2xl text-foreground">Product not found</p>
        <Link href="/shop">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Button>
        </Link>
      </div>
    );
  }

  const relatedProducts = products
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category || p.occasions.some((o) => product.occasions.includes(o)))
    )
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize || undefined, selectedColor || undefined);
    toast({
      title: "Added to bag",
      description: `${product.name} has been added to your bag.`,
    });
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link href="/shop">
            <Button variant="ghost" className="text-muted-foreground gap-1 mb-6" data-testid="button-back-to-shop">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[3/4] rounded-md overflow-hidden bg-muted group"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              data-testid="img-product-main"
            />
            {product.isNew && (
              <Badge className="absolute top-4 left-4">New</Badge>
            )}
            {product.stock < 5 && (
              <Badge variant="destructive" className="absolute top-4 right-4">
                Only {product.stock} left
              </Badge>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="capitalize text-[10px] editorial-subheading !tracking-[0.1em]">
                {product.category}
              </Badge>
              <Badge variant="secondary" className="capitalize text-[10px] editorial-subheading !tracking-[0.1em]">
                {product.subcategory}
              </Badge>
            </div>

            <h1 className="editorial-heading text-3xl sm:text-4xl text-foreground" data-testid="text-product-title">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground" data-testid="text-product-rating">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            <p className="editorial-heading text-3xl sm:text-4xl text-foreground mt-6" data-testid="text-product-price">
              ${product.price.toFixed(2)}
            </p>

            <p className="text-sm text-muted-foreground leading-relaxed mt-4" data-testid="text-product-description">
              {product.description}
            </p>

            <Separator className="my-6" />

            {product.colors.length > 0 && product.colors[0] !== "one size" && (
              <div className="mb-5">
                <p className="editorial-subheading text-foreground mb-3">
                  Color{selectedColor && `: ${selectedColor}`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-md border text-xs capitalize transition-all duration-200 ${
                        selectedColor === color
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground"
                      }`}
                      data-testid={`button-color-${color}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes.length > 0 && product.sizes[0] !== "one size" && (
              <div className="mb-5">
                <p className="editorial-subheading text-foreground mb-3">
                  Size{selectedSize && `: ${selectedSize}`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[2.5rem] px-3 py-2 rounded-md border text-xs font-medium flex items-center justify-center transition-all duration-200 ${
                        selectedSize === size
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground"
                      }`}
                      data-testid={`button-size-${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mb-6">
              <p className="editorial-subheading text-foreground">Quantity</p>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  data-testid="button-qty-decrease"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-8 text-center text-sm font-medium" data-testid="text-quantity">
                  {quantity}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setQuantity(quantity + 1)}
                  data-testid="button-qty-increase"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 gap-2" onClick={handleAddToCart} data-testid="button-add-to-cart">
                <ShoppingBag className="w-4 h-4" />
                Add to Bag
              </Button>
              <Button size="icon" variant="outline" data-testid="button-wishlist">
                <Heart className="w-4 h-4" />
              </Button>
            </div>

            <button
              onClick={onChatOpen}
              className="mt-4 flex items-center justify-center gap-2 py-2.5 text-sm text-[hsl(247,75%,64%)]/60 transition-colors editorial-subheading !text-[0.65rem]"
              data-testid="button-ask-sophia"
            >
              <Sparkles className="w-4 h-4" />
              Ask Sophia about this product
            </button>

            <Separator className="my-6" />

            <div className="space-y-3">
              {[
                { icon: Truck, text: "Free shipping on orders over $100" },
                { icon: RotateCcw, text: "30-day easy returns" },
                { icon: Shield, text: "Secure checkout guaranteed" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <p className="editorial-subheading text-foreground mb-3">Details</p>
              <div className="grid grid-cols-2 gap-y-2.5 text-xs">
                <span className="text-muted-foreground">Material</span>
                <span className="text-foreground">{product.materials.join(", ")}</span>
                <span className="text-muted-foreground">Gender</span>
                <span className="text-foreground capitalize">{product.gender}</span>
                <span className="text-muted-foreground">Season</span>
                <span className="text-foreground capitalize">{product.seasons.join(", ")}</span>
                <span className="text-muted-foreground">In Stock</span>
                <span className="text-foreground flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  {product.stock} units
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="py-20">
            <ScrollReveal>
              <div className="mb-10">
                <p className="editorial-subheading text-primary/50 mb-3">More to explore</p>
                <h2 className="editorial-heading text-2xl sm:text-3xl text-foreground" data-testid="text-related-title">
                  You may also like
                </h2>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 0.1}>
                  <ProductCard product={p} index={i} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
