import { HeroCarousel } from "@/components/home/HeroCarousel";
import { ProductCategories } from "@/components/home/ProductCategories";
import { ProductScroller } from "@/components/home/ProductScroller";
import { NewsSection } from "@/components/home/NewsSection";
import { getMappedProducts } from "@/lib/data";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = getMappedProducts();

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
