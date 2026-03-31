import { getProductById } from "@/lib/data";
import { ChevronLeft, ShoppingCart, Heart, Shield, Truck, RotateCcw, Info, Camera, Monitor, Cpu, Maximize, Zap, Battery, Weight, Ruler } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const formatTHB = (amount: number) =>
    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);

  // Group specs into logical categories
  const categories = [
    {
      title: "Imaging & Sensor",
      icon: <Cpu className="h-4 w-4" />,
      keys: ["Sensor type", "Sensor size", "Effective megapixels", "Total megapixels", "Sensor resolution", "Max. image resolution", "Crop factor"]
    },
    {
      title: "Video & Display",
      icon: <Monitor className="h-4 w-4" />,
      keys: ["Max. video resolution", "Screen size", "Screen resolution", "Viewfinder"]
    },
    {
      title: "Exposure & Focus",
      icon: <Zap className="h-4 w-4" />,
      keys: ["ISO", "Max. shutter speed", "Min. shutter speed", "Metering", "Exposure Compensation", "Focus points", "Normal focus range", "Macro focus range"]
    },
    {
      title: "Physical & Battery",
      icon: <Battery className="h-4 w-4" />,
      keys: ["Dimensions", "Weight", "Battery", "USB", "Storage types"]
    }
  ];

  const getSpecValue = (key: string) => product[key] || "N/A";

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Breadcrumb / Back Navigation */}
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group">
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Store
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        {/* Left: Product Image (Single Photo Only) */}
        <div className="sticky top-24">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-muted/20 border border-border/50 flex items-center justify-center p-8 md:p-12 group">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground italic">
            High-fidelity manufacturer provided image
          </p>
        </div>

        {/* Right: Product Info */}
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                {product.Brand} Official
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                product.stock_level > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {product.status}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-4xl font-bold text-primary">
                {formatTHB(product.price)}
              </span>
              <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest">THB</span>
            </div>
          </div>

          {/* Key Specs Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1 px-4 py-3 rounded-2xl bg-muted/30 border border-border/40">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Year</span>
              <span className="text-sm font-bold">{product.Year || "—"}</span>
            </div>
            <div className="flex flex-col gap-1 px-4 py-3 rounded-2xl bg-muted/30 border border-border/40">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Megapixels</span>
              <span className="text-sm font-bold">{product["Effective megapixels"] || product["Total megapixels"] || "—"}</span>
            </div>
            <div className="flex flex-col gap-1 px-4 py-3 rounded-2xl bg-muted/30 border border-border/40">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Mount</span>
              <span className="text-sm font-bold">{product.Brand} RF/Z/E</span>
            </div>
            <div className="flex flex-col gap-1 px-4 py-3 rounded-2xl bg-muted/30 border border-border/40">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Weight</span>
              <span className="text-sm font-bold">{product.Weight || "—"}</span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-[2] bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg shadow-primary/20">
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>
              <button className="flex-1 px-8 py-4 rounded-xl border border-border bg-background font-bold text-lg hover:bg-muted/50 transition-all flex items-center justify-center">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Value Props Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-accent-sapientia/10">
                <Shield className="h-5 w-5 text-accent-sapientia" />
              </div>
              <div>
                <p className="text-sm font-bold">2 Year Warranty</p>
                <p className="text-[11px] text-muted-foreground leading-snug">Full coverage by {product.Brand} Thailand.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-accent-sapientia/10">
                <Truck className="h-5 w-5 text-accent-sapientia" />
              </div>
              <div>
                <p className="text-sm font-bold">Fast Delivery</p>
                <p className="text-[11px] text-muted-foreground leading-snug">Free shipping within 24 hours.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Technical Specifications Section */}
      <section className="mt-24 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {categories.map((cat) => (
            <div key={cat.title} className="space-y-6 p-8 rounded-3xl bg-muted/10 border border-border/40 transition-colors hover:bg-muted/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-bold tracking-tight">{cat.title}</h3>
              </div>
              
              <div className="space-y-4">
                {cat.keys.map((key) => {
                  const value = product[key];
                  if (value === null || value === "") return null;
                  return (
                    <div key={key} className="flex justify-between items-start py-2 border-b border-border/20 last:border-0 group">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{key}</span>
                      <span className="text-sm font-medium text-right max-w-[200px]">{String(value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Manufacturer History */}
      <div className="mt-20 p-12 rounded-[2rem] bg-gradient-to-br from-muted/50 to-background border border-border/50">
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="h-20 w-20 flex-shrink-0 bg-white p-4 rounded-2xl flex items-center justify-center border border-borderShadow">
             <span className="text-black font-black text-2xl tracking-tighter">{product.Brand}</span>
          </div>
          <div className="space-y-3">
             <h3 className="text-2xl font-bold">About the Generation</h3>
             <p className="text-muted-foreground leading-relaxed">
               The {product.name} introduced in {product.Year} represents a significant milestone for {product.Brand}. 
               Built with a {product["Sensor size"]} {product["Sensor type"]} sensor, it was designed to target 
               {product["Max. video resolution"]?.includes("8K") ? " cinema-grade production " : " high-end amateur and professional creators "} 
               who demand uncompromising results.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
