import { AppFooter } from "@/components/AppFooter";
import { AppNav } from "@/components/AppNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNav />
      <main className="mx-auto w-full min-w-0 max-w-3xl flex-1 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-6 sm:py-8">
        {children}
      </main>
      <AppFooter />
    </>
  );
}
