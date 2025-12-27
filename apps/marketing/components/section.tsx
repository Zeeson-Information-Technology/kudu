import { ReactNode } from "react";

type SectionProps = {
  id?: string;
  title?: string;
  kicker?: string;
  children: ReactNode;
};

export function Section({ id, title, kicker, children }: SectionProps) {
  return (
    <section id={id} className="section">
      <div className="section-header">
        {kicker ? <p className="section-kicker">{kicker}</p> : null}
        {title ? <h2 className="section-title">{title}</h2> : null}
      </div>
      <div className="section-body">{children}</div>
    </section>
  );
}
