import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 overflow-hidden relative">
        {/* Decorative background blur */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-none p-0",
                headerTitle: "text-foreground font-bold tracking-tight text-2xl mb-2",
                headerSubtitle: "text-muted-foreground",
                formButtonPrimary: "bg-primary text-primary-foreground hover:opacity-90 transition-all font-semibold rounded-xl",
                formFieldLabel: "text-foreground font-medium",
                formFieldInput: "bg-muted border-border rounded-xl",
                footerActionLink: "text-primary font-semibold hover:underline",
                identityPreviewText: "text-foreground",
                identityPreviewEditButton: "text-primary",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
