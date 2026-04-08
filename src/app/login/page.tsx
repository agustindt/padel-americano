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
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-center font-display text-5xl uppercase tracking-[0.06em] text-[var(--accent-strong)]">
            {BRAND_NAME}
          </h1>
          <p className="mt-1 text-center text-sm text-[var(--muted)]">{BRAND_TAGLINE}</p>
          <Card className="mt-8 p-6 shadow-[var(--shadow-md)]">
            <LoginForm />
          </Card>
        </div>
      </div>
    </>
  );
}
