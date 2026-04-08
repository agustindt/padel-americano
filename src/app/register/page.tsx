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
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-center font-display text-4xl uppercase tracking-wide text-[var(--accent-strong)]">
            Crear cuenta
          </h1>
          <p className="mt-1 text-center text-sm text-[var(--muted)]">
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
