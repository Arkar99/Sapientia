import fs from "fs";
import path from "path";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { ProductCategories } from "@/components/home/ProductCategories";
import { ProductScroller, Product } from "@/components/home/ProductScroller";
import { NewsSection } from "@/components/home/NewsSection";

export const dynamic = 'force-dynamic';

function generateId(brand: string, model: string) {
  return `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getInventoryProducts(): Product[] {
  try {
    const invPath = path.join(process.cwd(), "src", "data", "inventory.json");
    const camPath = path.join(process.cwd(), "src", "data", "cameras.json");
    
    if (!fs.existsSync(invPath) || !fs.existsSync(camPath)) return [];

    const inventory = JSON.parse(fs.readFileSync(invPath, "utf-8"));
    const cameras = JSON.parse(fs.readFileSync(camPath, "utf-8"));

    return inventory.map((invItem: any) => {
      const cam = cameras.find((c: any) => generateId(c.Brand, c.Model) === invItem.id);
      return {
        id: invItem.id,
        name: cam ? `${cam.Brand} ${cam.Model}` : invItem.id,
        price: invItem.price_thb,
        image: cam && cam.image_file ? `/${cam.image_file}` : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop",
        rating: Number((Math.random() * (5 - 4.2) + 4.2).toFixed(1)), // Mock realistic rating
        reviews: Math.floor(Math.random() * 300) + 10,
        isNew: Math.random() > 0.8
      };
    }).sort(() => Math.random() - 0.5); // Shuffle for variety

  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function Home() {
  const products = getInventoryProducts();

  // Safely slice arrays depending on inventory size
  const newArrivals = products.slice(0, 10);
  const bestSellers = products.slice(10, 20);
  const mirrorless = products.filter(p => !p.name.includes("DSLR")).slice(0, 10);
  const topDslr = products.filter(p => p.name.includes("DSLR") || p.name.includes("Canon EOS")).slice(0, 10);
  const lenses = products.slice(20, 30);
  const actionCinema = products.slice(30, 40);

  return (
    <div className="container mx-auto px-4 md:px-6 space-y-16 pb-16 pt-2">
      <HeroCarousel />
      <ProductCategories />
      {newArrivals.length > 0 && <ProductScroller title="New Arrivals" translationKey="section.new" products={newArrivals} viewAllLink="/shop?sort=new" />}
      {bestSellers.length > 0 && <ProductScroller title="Best Sellers" translationKey="section.best" products={bestSellers} viewAllLink="/shop?sort=bestsellers" />}
      {mirrorless.length > 0 && <ProductScroller title="Top Mirrorless Cameras" translationKey="section.top_mirrorless" products={mirrorless} viewAllLink="/shop/mirrorless" />}
      {topDslr.length > 0 && <ProductScroller title="Top DSLR Cameras" translationKey="section.top_dslr" products={topDslr} viewAllLink="/shop/dslr" />}
      {lenses.length > 0 && <ProductScroller title="Professional Lenses" translationKey="section.lenses" products={lenses} viewAllLink="/shop/lenses" />}
      {actionCinema.length > 0 && <ProductScroller title="Action & Cinema" translationKey="section.action" products={actionCinema} viewAllLink="/shop/action" />}
      <NewsSection />
    </div>
  );
}
