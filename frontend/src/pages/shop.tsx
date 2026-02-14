import { useState, useMemo, useRef } from "react";
import { useSearch } from "wouter";
import ProductCard from "@/components/product-card";
import { products, filterProducts } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, useInView } from "framer-motion";

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

export default function Shop() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialCategory = params.get("category") || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const filteredProducts = useMemo(() => {
    let result = filterProducts({
      category: category || undefined,
      sortBy: sortBy || undefined,
      minPrice: priceRange === "under50" ? 0 : priceRange === "50to100" ? 50 : priceRange === "100to200" ? 100 : priceRange === "over200" ? 200 : undefined,
      maxPrice: priceRange === "under50" ? 50 : priceRange === "50to100" ? 100 : priceRange === "100to200" ? 200 : undefined,
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      );
    }

    return result;
  }, [category, sortBy, priceRange, searchQuery]);

  const activeFilters = [
    category && { key: "category", label: category, clear: () => setCategory("") },
    sortBy && { key: "sort", label: sortBy.replace("_", " "), clear: () => setSortBy("") },
    priceRange && { key: "price", label: priceRange.replace("to", "-").replace("under", "<$").replace("over", ">$"), clear: () => setPriceRange("") },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  return (
    <div className="min-h-screen pt-20 sm:pt-24">
      <div className="border-b border-border/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="editorial-subheading text-primary/50 mb-3">Collection</p>
            <h1 className="editorial-heading text-4xl sm:text-5xl lg:text-6xl text-foreground" data-testid="text-shop-title">
              {category ? category.charAt(0).toUpperCase() + category.slice(1) : "All Products"}
            </h1>
            <p className="text-sm text-muted-foreground mt-3">
              {filteredProducts.length} item{filteredProducts.length !== 1 ? "s" : ""}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8"
        >
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-9"
              data-testid="input-search-products"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[140px]" data-testid="select-category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="footwear">Footwear</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy || "default"} onValueChange={(v) => setSortBy(v === "default" ? "" : v)}>
              <SelectTrigger className="w-[150px]" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange || "any"} onValueChange={(v) => setPriceRange(v === "any" ? "" : v)}>
              <SelectTrigger className="w-[140px]" data-testid="select-price">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Price</SelectItem>
                <SelectItem value="under50">Under $50</SelectItem>
                <SelectItem value="50to100">$50 - $100</SelectItem>
                <SelectItem value="100to200">$100 - $200</SelectItem>
                <SelectItem value="over200">Over $200</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {activeFilters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex flex-wrap items-center gap-2 mb-8"
          >
            <span className="text-xs text-muted-foreground">Active:</span>
            {activeFilters.map((f) => (
              <Badge
                key={f.key}
                variant="secondary"
                className="gap-1 text-xs cursor-pointer capitalize"
                onClick={f.clear}
                data-testid={`badge-filter-${f.key}`}
              >
                {f.label}
                <X className="w-3 h-3" />
              </Badge>
            ))}
            <button
              onClick={() => {
                setCategory("");
                setSortBy("");
                setPriceRange("");
                setSearchQuery("");
              }}
              className="text-xs text-foreground ml-1 editorial-subheading"
              data-testid="button-clear-filters"
            >
              Clear all
            </button>
          </motion.div>
        )}

        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <SlidersHorizontal className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="editorial-heading text-xl text-foreground mb-2" data-testid="text-no-results">No products found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search query
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product, i) => (
              <ScrollReveal key={product.id} delay={Math.min(i * 0.05, 0.4)}>
                <ProductCard product={product} index={i} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
