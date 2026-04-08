import { AppFooter } from "@/components/AppFooter";
import { AppNav } from "@/components/AppNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
      <AppFooter />
    </>
  );
}
