import { getMappedProducts } from "@/lib/data";
import { ProductCard } from "@/components/ui/ProductCard";
import { Search } from "lucide-react";

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q || "";
  const allProducts = getMappedProducts();
  
  const filteredProducts = allProducts.filter((product) => {
    const searchStr = `${product.name} ${product.id}`.toLowerCase();
    return searchStr.includes(query.toLowerCase());
  });

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 min-h-[60vh]">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Search className="h-4 w-4" />
            <span className="text-sm font-medium uppercase tracking-wider">Search Results</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {query ? (
              <>
                Results for "<span className="text-primary">{query}</span>"
              </>
            ) : (
              "All Cameras"
            )}
          </h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? "camera" : "cameras"} found in store
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border/60">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No cameras found</h2>
            <p className="text-muted-foreground text-center max-w-md px-6">
              We couldn't find any cameras matching "{query}". Try checking the spelling or use more general terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
