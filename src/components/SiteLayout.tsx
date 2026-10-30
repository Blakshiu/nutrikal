import { Link, useRouterState } from "@tanstack/react-router";
import { Leaf, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const LINKS = [
  { to: "/", label: "Início" },
  { to: "/calculadora", label: "Calculadora" },
  { to: "/metas", label: "Metas e água" },
  { to: "/nutrientes", label: "Nutrientes" },
  { to: "/duvidas", label: "Dúvidas" },
] as const;

function Logo({ size }: { size: number }) {
  return (
    <Link to="/" className="logo" aria-label="NUTRIKAL — início">
      <span className="logo__mark">
        <Leaf size={size} strokeWidth={2.5} />
      </span>
      <span className="logo__name">
        NUTRI<em>KAL</em>
      </span>
    </Link>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* A cada página: fecha o menu móvel */
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="container-x site-header__inner">
          <Logo size={17} />
          <nav className="main-nav" aria-label="Navegação principal">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="nav-link"
                activeOptions={{ exact: true }}
                activeProps={{ className: "is-active" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <button
            className="menu-toggle"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className={`mobile-nav ${menuOpen ? "is-open" : ""}`} aria-label="Navegação móvel">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="nav-link"
              activeOptions={{ exact: true }}
              activeProps={{ className: "is-active" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main key={pathname} className="page">
        {children}
      </main>
      <footer className="site-footer">
        <div className="container-x site-footer__inner">
          <Logo size={15} />
          <span>© 2026 NUTRIKAL · Dados de referência: Tabela TACO (UNICAMP)</span>
        </div>
      </footer>
    </>
  );
}
