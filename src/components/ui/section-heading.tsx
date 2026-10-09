type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <header className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="display-heading text-balance">{title}</h2>
      {description ? <p className="section-intro">{description}</p> : null}
    </header>
  );
}
