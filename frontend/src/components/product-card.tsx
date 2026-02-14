import { Link } from "wouter";
import type { Product } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Star, Sparkles } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index?: number;
  highlighted?: boolean;
}

export default function ProductCard({ product, index = 0, highlighted }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div data-testid={`card-product-${product.id}`}>
      <Link href={`/product/${product.id}`}>
        <motion.div
          className="relative aspect-[3/4] rounded-md overflow-hidden bg-muted cursor-pointer group"
          whileHover={{ y: -8, boxShadow: "0 20px 25px -5px hsl(247 75% 64% / 0.2)" }}
          transition={{ type: "spring", damping: 15 }}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNew && (
              <Badge variant="default" className="text-[10px]" data-testid={`badge-new-${product.id}`}>
                New
              </Badge>
            )}
            {product.stock < 5 && (
              <Badge variant="destructive" className="text-[10px]" data-testid={`badge-low-stock-${product.id}`}>
                Only {product.stock} left
              </Badge>
            )}
          </div>

          {highlighted && (
            <div className="absolute top-3 right-3">
              <Badge className="text-[10px] gap-1" data-testid={`badge-sophia-${product.id}`}>
                <Sparkles className="w-3 h-3" />
                Sophia Recommends
              </Badge>
            </div>
          )}

          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <Button
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product);
              }}
              data-testid={`button-quick-add-${product.id}`}
            >
              <ShoppingBag className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </Link>

      <div className="mt-4 space-y-1.5">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-medium text-foreground leading-tight cursor-pointer" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
        </Link>
        <p className="editorial-subheading text-primary/40 !text-[0.6rem]">{product.subcategory}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-foreground" data-testid={`text-product-price-${product.id}`}>
            ${product.price.toFixed(2)}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-primary text-primary" />
            <span className="text-[10px] text-muted-foreground">{product.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
