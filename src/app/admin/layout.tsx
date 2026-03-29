import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { LogOut, Camera } from "lucide-react";
import { SidebarNav } from "@/components/admin/SidebarNav";
import { ADMIN_EMAILS } from "@/lib/config";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId || !user) {
    redirect("/");
  }

  // Check role in metadata OR email in whitelist
  const role = user.publicMetadata?.role as string;
  const userEmail = user.emailAddresses[0]?.emailAddress ?? "";
  const isAdmin = role === 'admin' || ADMIN_EMAILS.includes(userEmail);

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col py-8 px-4">
        <div className="flex items-center gap-2 mb-10 px-2">
          <Camera className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tighter">Sapientia Admin</span>
        </div>

        <SidebarNav />

        <div className="pt-4 border-t border-border mt-auto">
           <Link 
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-all text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-muted/20">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            Welcome back, {user.firstName || "Admin"}
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 uppercase font-bold tracking-widest">PRO</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs uppercase overflow-hidden">
              {user.imageUrl ? <img src={user.imageUrl} alt="Avatar" /> : (user.firstName?.[0] || "A")}
            </div>
          </div>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
