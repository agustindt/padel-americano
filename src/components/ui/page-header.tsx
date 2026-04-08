type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="min-w-0 space-y-2">
      <h1 className="font-display text-[clamp(1.65rem,6.5vw,3rem)] uppercase leading-[1.05] tracking-[0.04em] text-[var(--foreground)] sm:text-5xl">
        <span className="break-words">{title}</span>
      </h1>
      {description ? (
        <p className="max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-sm">{description}</p>
      ) : null}
    </header>
  );
}
