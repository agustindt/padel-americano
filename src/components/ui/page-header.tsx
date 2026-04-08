type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="space-y-2">
      <h1 className="font-display text-4xl uppercase tracking-[0.04em] text-[var(--foreground)] sm:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-xl text-sm leading-relaxed text-[var(--muted)]">{description}</p>
      ) : null}
    </header>
  );
}
