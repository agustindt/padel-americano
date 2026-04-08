import Link from "next/link";
import { AuthTopBar } from "@/components/AuthTopBar";
import { RegisterForm } from "@/components/RegisterForm";
import { Card } from "@/components/ui/card";
import { BRAND_NAME } from "@/lib/brand";

export const metadata = {
  title: "Registro",
};

export default function RegisterPage() {
  return (
    <>
      <AuthTopBar />
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-12 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))] sm:py-16">
        <div className="w-full min-w-0 max-w-sm">
          <h1 className="text-center font-display text-[clamp(1.85rem,9vw,2.5rem)] uppercase leading-tight tracking-wide text-[var(--accent-strong)]">
            Crear cuenta
          </h1>
          <p className="mt-2 text-center text-base text-[var(--muted)] sm:text-sm">
            Un perfil en {BRAND_NAME} — como te verán en la tabla
          </p>
          <Card className="mt-8 p-6 shadow-[var(--shadow-md)]">
            <RegisterForm />
          </Card>
          <p className="mt-6 text-center text-xs text-[var(--muted)]">
            <Link href="/login" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
              Ya tengo cuenta
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
