import image1 from "../images/products/athletic-cotton-socks-6-pairs.jpg";
import image2 from "../images/products/intermediate-composite-basketball.jpg";
import image3 from "../images/products/adult-plain-cotton-tshirt-2-pack-teal.jpg";
import image4 from "../images/products/women-chunky-knit-sweater.jpg";
import image5 from "../images/products/stainless-steel-water-bottle.jpg";
export const products = [
  {
    id: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
    image: image1,
    name: "Black and Gray Athletic Cotton Socks - 6 Pairs",
    rating: { stars: 4.5, count: 87 },
    priceCents: 1090,
    keywords: ["socks", "sports", "apparel"],
  },
  {
    id: "15b6fc6f-327a-4ec4-896f-486349e85a3d",
    image: image2,
    name: "Intermediate Size Basketball",
    rating: { stars: 4, count: 127 },
    priceCents: 2095,
    keywords: ["sports", "basketballs"],
  },
  {
    id: "f57c8b49-9a78-4ad1-8b7a-778a3b37a33f",
    image: image3,
    name: "Plain Cotton T-Shirt - 2 Pack (Teal)",
    rating: { stars: 4.6, count: 56 },
    priceCents: 1599,
    keywords: ["t-shirt", "cotton", "apparel"],
  },
  {
    id: "a74b1ed6-b349-4c2c-a6db-48fdbf4dffb2",
    image: image4,
    name: "Women's Chunky Knit Sweater",
    rating: { stars: 4.8, count: 190 },
    priceCents: 3499,
    keywords: ["sweater", "women", "fashion"],
  },
  {
    id: "22cb7fd5-51d6-4f3b-bd40-7efb29260c3a",
    image: image5,
    name: "Stainless Steel Water Bottle",
    rating: { stars: 4.7, count: 211 },
    priceCents: 2499,
    keywords: ["water bottle", "sports", "outdoor"],
  },
];

// Hàm lấy sản phẩm theo ID
export const getProduct = (productId) => {
  return products.find((product) => product.id === productId) || null;
};
