import { AuthTopBar } from "@/components/AuthTopBar";
import { LoginForm } from "@/components/LoginForm";
import { Card } from "@/components/ui/card";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export const metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <>
      <AuthTopBar />
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-12 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))] sm:py-16">
        <div className="w-full min-w-0 max-w-sm">
          <h1 className="text-center font-display text-[clamp(2.25rem,12vw,3.5rem)] uppercase leading-none tracking-[0.06em] text-[var(--accent-strong)]">
            {BRAND_NAME}
          </h1>
          <p className="mt-2 text-center text-base text-[var(--muted)] sm:text-sm">{BRAND_TAGLINE}</p>
          <Card className="mt-8 p-6 shadow-[var(--shadow-md)]">
            <LoginForm />
          </Card>
        </div>
      </div>
    </>
  );
}
