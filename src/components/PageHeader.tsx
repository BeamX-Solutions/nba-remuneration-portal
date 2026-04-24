interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const PageHeader = ({ eyebrow, title, subtitle, action }: PageHeaderProps) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      {eyebrow && (
        <div className="flex items-center gap-3 mb-3">
          <span className="h-px w-8 bg-accent" />
          <span className="text-[11px] tracking-eyebrow uppercase text-accent font-semibold">{eyebrow}</span>
        </div>
      )}
      <h1 className="font-display text-3xl md:text-4xl font-light text-primary tracking-display leading-tight">
        {title}
      </h1>
      <div className="h-px w-12 bg-accent/40 mt-3" />
      {subtitle && <p className="text-muted-foreground mt-3 text-sm">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0 mt-1">{action}</div>}
  </div>
);

export default PageHeader;
