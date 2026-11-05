import { Link, useRouterState } from "@tanstack/react-router";
import { Leaf, Menu, X } from "lucide-react";
import { useEffect, useState, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
  const headerRef = useRef<HTMLHeaderElement>(null);
  const navLinksRef = useRef<HTMLNavElement>(null);

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

  // GSAP animations for header and navigation
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate nav links on mount
      const links = navLinksRef.current?.querySelectorAll(".nav-link");
      if (links?.length) {
        gsap.fromTo(
          links,
          { y: -20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: "expo.out",
            delay: 0.3,
          },
        );
      }

      // Animate logo on mount
      const logo = headerRef.current?.querySelector(".logo");
      if (logo) {
        gsap.fromTo(
          logo,
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: "expo.out", delay: 0.2 },
        );
      }
    }, headerRef);

    // ScrollTrigger for header background transition - created outside context to find 'main'
    const scrollTrigger = ScrollTrigger.create({
      trigger: "main",
      start: "top top",
      end: "+=100",
      onEnter: () => setScrolled(true),
      onLeaveBack: () => setScrolled(false),
    });

    return () => {
      ctx.revert();
      scrollTrigger.kill();
    };
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ease-out-expo lg:fixed ${
          scrolled
            ? "bg-[oklch(0.99_0.02_23/0.86)] backdrop-blur-[18px] saturate-[140%] border-b border-[var(--glass-border)]"
            : "bg-[oklch(0.99_0.02_23/0.72)] backdrop-blur-[18px] saturate-[140%] border-b border-transparent"
        }`}
        role="banner"
      >
        <div className="container-x site-header__inner">
          <Logo size={17} />
          <nav
            ref={navLinksRef}
            className="hidden lg:flex items-center gap-8 main-nav"
            aria-label="Navegação principal"
          >
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="nav-link text-[var(--muted-foreground)] font-medium text-sm hover:text-[var(--foreground)] transition-colors duration-200 relative after:absolute after:bottom-[-6px] after:left-0 after:w-full after:h-[2px] after:rounded-[2px] after:bg-[var(--macro-proteina)] after:origin-left after:transition-transform after:duration-[250ms] after:ease-out"
                activeOptions={{ exact: true }}
                activeProps={{ className: "is-active" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <button
            className="lg:hidden p-2 rounded-lg text-[var(--foreground)] hover:bg-[oklch(1_0_0/0.05)] transition-colors menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <nav
          id="mobile-menu"
          className="mobile-nav lg:hidden"
          aria-label="Menu mobile"
          hidden={!menuOpen}
        >
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="nav-link"
              activeOptions={{ exact: true }}
              activeProps={{ className: "is-active" }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
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
