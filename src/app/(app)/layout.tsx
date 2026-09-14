import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/shell/AppHeader";
import { BottomNav } from "@/components/shell/BottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Server-side mandatory auth check
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center">
      {/* Fixed Authenticated Header */}
      <AppHeader />

      {/* Main Scrollable App Container */}
      <main className="w-full max-w-lg flex-1 pt-20 pb-24 px-4 overflow-x-hidden">
        {children}
      </main>

      {/* Fixed Authenticated Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
