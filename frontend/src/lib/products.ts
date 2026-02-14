export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: "clothing" | "accessories" | "footwear";
  subcategory: string;
  gender: "men" | "women" | "unisex";
  colors: string[];
  sizes: string[];
  materials: string[];
  tags: string[];
  occasions: string[];
  seasons: string[];
  stock: number;
  rating: number;
  reviews: number;
  imageUrl: string;
  isFeatured?: boolean;
  isNew?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  timestamp: Date;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Linen Summer Dress",
    description: "Lightweight breathable dress perfect for beach weddings and hot summer days. Features adjustable straps and flowing silhouette. Made from 100% organic linen.",
    price: 79.99,
    category: "clothing",
    subcategory: "dresses",
    gender: "women",
    colors: ["white", "beige", "light blue", "mint green"],
    sizes: ["XS", "S", "M", "L", "XL"],
    materials: ["100% organic linen"],
    tags: ["summer", "dress", "beach", "wedding", "casual", "linen", "organic", "flowy"],
    occasions: ["wedding", "beach", "brunch", "vacation"],
    seasons: ["spring", "summer"],
    stock: 15,
    rating: 4.7,
    reviews: 89,
    imageUrl: "/images/products/linen-summer-dress.png",
    isFeatured: true,
  },
  {
    id: 2,
    name: "Tailored Navy Blazer",
    description: "Impeccably tailored blazer in rich navy blue. Slim-fit silhouette with natural shoulder construction. Perfect for business meetings or elevated evenings out.",
    price: 189.99,
    category: "clothing",
    subcategory: "blazers",
    gender: "men",
    colors: ["navy", "charcoal", "black"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    materials: ["Italian wool blend"],
    tags: ["blazer", "formal", "business", "tailored", "navy", "classic"],
    occasions: ["work", "dinner", "formal"],
    seasons: ["fall", "winter", "spring"],
    stock: 12,
    rating: 4.8,
    reviews: 156,
    imageUrl: "/images/products/navy-blazer.png",
    isFeatured: true,
  },
  {
    id: 3,
    name: "Classic White Sneakers",
    description: "Timeless white leather sneakers with cushioned insole and minimalist design. The essential shoe for every wardrobe. Pairs with everything from jeans to dresses.",
    price: 119.99,
    category: "footwear",
    subcategory: "sneakers",
    gender: "unisex",
    colors: ["white", "white/gum"],
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    materials: ["Premium leather", "rubber sole"],
    tags: ["sneakers", "white", "casual", "everyday", "classic", "minimalist"],
    occasions: ["casual", "everyday", "travel"],
    seasons: ["spring", "summer", "fall", "winter"],
    stock: 34,
    rating: 4.9,
    reviews: 312,
    imageUrl: "/images/products/white-sneakers.png",
    isFeatured: true,
    isNew: true,
  },
  {
    id: 4,
    name: "Italian Leather Messenger Bag",
    description: "Handcrafted genuine Italian leather bag with dedicated laptop compartment. Rich patina develops beautifully over time. Features brass hardware and adjustable strap.",
    price: 199.99,
    category: "accessories",
    subcategory: "bags",
    gender: "unisex",
    colors: ["cognac", "dark brown", "black"],
    sizes: ["one size"],
    materials: ["Full-grain Italian leather"],
    tags: ["bag", "leather", "work", "professional", "laptop", "messenger"],
    occasions: ["work", "everyday", "travel"],
    seasons: ["spring", "summer", "fall", "winter"],
    stock: 8,
    rating: 4.9,
    reviews: 201,
    imageUrl: "/images/products/leather-messenger-bag.png",
  },
  {
    id: 5,
    name: "Aviator Sunglasses",
    description: "Premium gold-frame aviator sunglasses with UV400 protection. Lightweight titanium frame with gradient polarized lenses for maximum clarity and style.",
    price: 149.99,
    category: "accessories",
    subcategory: "eyewear",
    gender: "unisex",
    colors: ["gold/brown", "silver/grey", "rose gold"],
    sizes: ["one size"],
    materials: ["Titanium frame", "polarized glass"],
    tags: ["sunglasses", "aviator", "summer", "travel", "luxury"],
    occasions: ["casual", "vacation", "everyday"],
    seasons: ["spring", "summer"],
    stock: 22,
    rating: 4.6,
    reviews: 178,
    imageUrl: "/images/products/aviator-sunglasses.png",
    isNew: true,
  },
  {
    id: 6,
    name: "Linen Summer Suit",
    description: "Relaxed yet refined beige linen suit for the modern gentleman. Breathable construction keeps you cool during outdoor events. Unlined for a natural drape.",
    price: 249.99,
    category: "clothing",
    subcategory: "suits",
    gender: "men",
    colors: ["beige", "light grey", "sage"],
    sizes: ["S", "M", "L", "XL"],
    materials: ["100% Belgian linen"],
    tags: ["suit", "linen", "summer", "wedding", "formal", "beige", "resort"],
    occasions: ["wedding", "formal", "resort", "vacation"],
    seasons: ["spring", "summer"],
    stock: 6,
    rating: 4.8,
    reviews: 67,
    imageUrl: "/images/products/linen-summer-suit.png",
    isFeatured: true,
  },
  {
    id: 7,
    name: "Red Cocktail Dress",
    description: "Show-stopping red cocktail dress with asymmetric hemline. Crafted from stretch crepe fabric for a flattering fit. Perfect for date nights and celebrations.",
    price: 139.99,
    category: "clothing",
    subcategory: "dresses",
    gender: "women",
    colors: ["crimson", "midnight black", "emerald"],
    sizes: ["XS", "S", "M", "L"],
    materials: ["Stretch crepe"],
    tags: ["dress", "cocktail", "party", "red", "evening", "date night"],
    occasions: ["party", "date night", "dinner", "celebration"],
    seasons: ["fall", "winter", "spring"],
    stock: 9,
    rating: 4.5,
    reviews: 43,
    imageUrl: "/images/products/red-cocktail-dress.png",
  },
  {
    id: 8,
    name: "Italian Leather Loafers",
    description: "Handcrafted tan leather loafers with Blake stitched sole. Buttery soft calfskin leather molds to your foot for unmatched comfort. A true wardrobe investment piece.",
    price: 179.99,
    category: "footwear",
    subcategory: "loafers",
    gender: "men",
    colors: ["tan", "burgundy", "black"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    materials: ["Italian calfskin leather"],
    tags: ["loafers", "leather", "formal", "casual", "tan", "Italian"],
    occasions: ["work", "dinner", "wedding", "casual"],
    seasons: ["spring", "summer", "fall"],
    stock: 11,
    rating: 4.7,
    reviews: 98,
    imageUrl: "/images/products/leather-loafers.png",
  },
  {
    id: 9,
    name: "Cashmere Turtleneck",
    description: "Ultra-soft pure cashmere turtleneck in timeless black. Luxurious warmth without bulk. The perfect layering piece for cold months or cool evening breezes.",
    price: 159.99,
    category: "clothing",
    subcategory: "knitwear",
    gender: "unisex",
    colors: ["black", "camel", "ivory", "heather grey"],
    sizes: ["XS", "S", "M", "L", "XL"],
    materials: ["100% Mongolian cashmere"],
    tags: ["cashmere", "turtleneck", "luxury", "winter", "knitwear", "layering"],
    occasions: ["work", "dinner", "casual", "everyday"],
    seasons: ["fall", "winter"],
    stock: 18,
    rating: 4.8,
    reviews: 134,
    imageUrl: "/images/products/cashmere-turtleneck.png",
  },
  {
    id: 10,
    name: "Woven Straw Crossbody",
    description: "Artisan-woven straw crossbody bag with genuine leather trim. A vacation essential that transitions beautifully to city life. Sustainably sourced materials.",
    price: 89.99,
    category: "accessories",
    subcategory: "bags",
    gender: "women",
    colors: ["natural", "tan/natural"],
    sizes: ["one size"],
    materials: ["Hand-woven straw", "leather trim"],
    tags: ["bag", "crossbody", "summer", "straw", "woven", "vacation", "sustainable"],
    occasions: ["vacation", "beach", "casual", "brunch"],
    seasons: ["spring", "summer"],
    stock: 14,
    rating: 4.4,
    reviews: 56,
    imageUrl: "/images/products/straw-crossbody.png",
  },
  {
    id: 11,
    name: "Distressed Denim Jacket",
    description: "Vintage-inspired distressed denim jacket with a modern fit. Authentic fading and whiskering for lived-in character. Essential layering piece for transitional weather.",
    price: 129.99,
    category: "clothing",
    subcategory: "jackets",
    gender: "unisex",
    colors: ["medium wash", "light wash", "black"],
    sizes: ["XS", "S", "M", "L", "XL"],
    materials: ["100% cotton denim"],
    tags: ["denim", "jacket", "casual", "vintage", "distressed", "layering"],
    occasions: ["casual", "everyday", "concert", "travel"],
    seasons: ["spring", "fall"],
    stock: 20,
    rating: 4.6,
    reviews: 112,
    imageUrl: "/images/products/denim-jacket.png",
    isNew: true,
  },
  {
    id: 12,
    name: "Silver Pendant Necklace",
    description: "Minimalist sterling silver pendant on a delicate chain. Understated elegance that complements any outfit. Tarnish-resistant finish ensures lasting beauty.",
    price: 69.99,
    category: "accessories",
    subcategory: "jewelry",
    gender: "unisex",
    colors: ["sterling silver"],
    sizes: ["16in", "18in", "20in"],
    materials: ["925 sterling silver"],
    tags: ["necklace", "silver", "minimalist", "jewelry", "pendant", "elegant"],
    occasions: ["everyday", "dinner", "date night", "work"],
    seasons: ["spring", "summer", "fall", "winter"],
    stock: 30,
    rating: 4.5,
    reviews: 88,
    imageUrl: "/images/products/silver-necklace.png",
  },
  {
    id: 13,
    name: "Olive Cargo Pants",
    description: "Modern slim-fit cargo pants in rich olive green. Functional pockets with hidden zippers for clean lines. Stretch cotton twill for all-day comfort.",
    price: 89.99,
    category: "clothing",
    subcategory: "pants",
    gender: "men",
    colors: ["olive", "black", "khaki"],
    sizes: ["28", "30", "32", "34", "36"],
    materials: ["Stretch cotton twill"],
    tags: ["cargo", "pants", "casual", "olive", "streetwear", "utility"],
    occasions: ["casual", "everyday", "travel"],
    seasons: ["spring", "summer", "fall"],
    stock: 25,
    rating: 4.3,
    reviews: 74,
    imageUrl: "/images/products/cargo-pants.png",
  },
  {
    id: 14,
    name: "Minimalist Leather Watch",
    description: "Clean-dial leather strap watch with Japanese quartz movement. Ultra-thin case sits elegantly on the wrist. Water-resistant to 50m for everyday confidence.",
    price: 169.99,
    category: "accessories",
    subcategory: "watches",
    gender: "unisex",
    colors: ["black/black", "brown/white", "tan/cream"],
    sizes: ["one size"],
    materials: ["Stainless steel", "genuine leather"],
    tags: ["watch", "minimalist", "leather", "luxury", "timepiece"],
    occasions: ["work", "everyday", "formal", "dinner"],
    seasons: ["spring", "summer", "fall", "winter"],
    stock: 10,
    rating: 4.7,
    reviews: 145,
    imageUrl: "/images/products/leather-watch.png",
    isFeatured: true,
  },
  {
    id: 15,
    name: "Chelsea Boots",
    description: "Classic chelsea boots in rich dark brown leather. Elastic side panels for easy on/off. Goodyear welted construction ensures years of wear and easy resoling.",
    price: 219.99,
    category: "footwear",
    subcategory: "boots",
    gender: "men",
    colors: ["dark brown", "black", "tan"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    materials: ["Full-grain leather", "rubber sole"],
    tags: ["boots", "chelsea", "leather", "formal", "casual", "classic"],
    occasions: ["work", "casual", "dinner", "everyday"],
    seasons: ["fall", "winter", "spring"],
    stock: 7,
    rating: 4.8,
    reviews: 203,
    imageUrl: "/images/products/chelsea-boots.png",
  },
  {
    id: 16,
    name: "Silk Floral Blouse",
    description: "Luxurious silk blouse with delicate floral print. Relaxed fit drapes beautifully. Pairs effortlessly with tailored trousers or high-waisted jeans.",
    price: 129.99,
    category: "clothing",
    subcategory: "tops",
    gender: "women",
    colors: ["ivory/floral", "navy/floral", "blush/floral"],
    sizes: ["XS", "S", "M", "L"],
    materials: ["100% mulberry silk"],
    tags: ["blouse", "silk", "floral", "elegant", "feminine", "office"],
    occasions: ["work", "brunch", "dinner", "date night"],
    seasons: ["spring", "summer"],
    stock: 13,
    rating: 4.6,
    reviews: 67,
    imageUrl: "/images/products/silk-blouse.png",
    isNew: true,
  },
  {
    id: 17,
    name: "Merino Wool Scarf",
    description: "Sumptuously soft merino wool scarf in deep burgundy. Generous dimensions for versatile styling. A polished finishing touch for any cold-weather ensemble.",
    price: 59.99,
    category: "accessories",
    subcategory: "scarves",
    gender: "unisex",
    colors: ["burgundy", "camel", "charcoal", "navy"],
    sizes: ["one size"],
    materials: ["100% extra-fine merino wool"],
    tags: ["scarf", "wool", "winter", "burgundy", "cozy", "layering"],
    occasions: ["everyday", "work", "travel"],
    seasons: ["fall", "winter"],
    stock: 28,
    rating: 4.4,
    reviews: 92,
    imageUrl: "/images/products/wool-scarf.png",
  },
  {
    id: 18,
    name: "High-Waisted Tailored Trousers",
    description: "Elegantly cut high-waisted trousers in classic black. Wide leg creates a powerful, elongating silhouette. Invisible side zipper for a seamless front.",
    price: 109.99,
    category: "clothing",
    subcategory: "pants",
    gender: "women",
    colors: ["black", "cream", "navy"],
    sizes: ["XS", "S", "M", "L", "XL"],
    materials: ["Wool-blend suiting"],
    tags: ["trousers", "tailored", "high-waisted", "office", "formal", "wide-leg"],
    occasions: ["work", "formal", "dinner"],
    seasons: ["fall", "winter", "spring"],
    stock: 16,
    rating: 4.7,
    reviews: 118,
    imageUrl: "/images/products/tailored-trousers.png",
  },
];

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isFeatured);
}

export function getNewArrivals(): Product[] {
  return products.filter((p) => p.isNew);
}

export function getProductById(id: number): Product | undefined {
  return products.find((p) => p.id === id);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q)) ||
      p.category.includes(q) ||
      p.subcategory.includes(q) ||
      p.occasions.some((o) => o.includes(q))
  );
}

export function filterProducts(opts: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  color?: string;
  season?: string;
  occasion?: string;
}): Product[] {
  let result = [...products];

  if (opts.category) {
    result = result.filter((p) => p.category === opts.category);
  }
  if (opts.minPrice !== undefined) {
    result = result.filter((p) => p.price >= opts.minPrice!);
  }
  if (opts.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= opts.maxPrice!);
  }
  if (opts.color) {
    const c = opts.color.toLowerCase();
    result = result.filter((p) => p.colors.some((col) => col.toLowerCase().includes(c)));
  }
  if (opts.season) {
    result = result.filter((p) => p.seasons.includes(opts.season!));
  }
  if (opts.occasion) {
    result = result.filter((p) => p.occasions.includes(opts.occasion!));
  }

  if (opts.sortBy) {
    switch (opts.sortBy) {
      case "price_low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }
  }

  return result;
}
