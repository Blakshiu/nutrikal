import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, type ComponentType, type ReactNode } from "react";

export function PageHead({
  icon: Icon,
  eyebrow,
  title,
  children,
}: {
  icon: ComponentType<{ size?: number }>;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="section" style={{ paddingBottom: 0 }}>
      <div className="container-x page-head">
        <span className="eyebrow">
          <Icon size={14} />
          {eyebrow}
        </span>
        <h1>{title}</h1>
        <p>{children}</p>
      </div>
    </section>
  );
}

/** Convite para o próximo passo do fluxo (mantém a navegação intuitiva). */
export function NextStep({
  to,
  title,
  text,
  cta,
}: {
  to: "/" | "/calculadora" | "/metas" | "/nutrientes" | "/duvidas";
  title: string;
  text: string;
  cta: string;
}) {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container-x">
        <div className="next-step glass" data-reveal>
          <div>
            <strong>{title}</strong>
            <p>{text}</p>
          </div>
          <Link to={to} className="btn btn-primary">
            {cta}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Revela os elementos [data-reveal] ao rolar. Fica dentro de cada página para
 * rodar só depois que o conteúdo da própria página foi hidratado.
 */
export function RevealOnScroll() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}
