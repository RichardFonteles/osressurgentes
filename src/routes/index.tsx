import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
const ForestScene = lazy(() => import("@/components/ForestScene"));
import heroForest from "@/assets/hero-forest.jpg";
import mentorPortrait from "@/assets/mentor-portrait.jpg.asset.json";
import horizon from "@/assets/horizon.jpg";
import videoThumb from "@/assets/video-thumb.jpg";
import moss from "@/assets/moss.jpg";
import logoAsset from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    links: [
      // LCP hint — pré-carrega a imagem do hero em alta prioridade
      { rel: "preload", as: "image", href: heroForest, fetchpriority: "high" } as any,
    ],
  }),
});

/**
 * useDeferredMount — só monta o filho depois que o browser está ocioso
 * (ou após 1s de fallback). Reduz TBT e libera a thread para o LCP.
 * Também respeita Save-Data e telas muito pequenas: se `skip` for true,
 * nunca monta.
 */
function useDeferredMount(skip = false) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (skip) return;
    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;
    if (ric) {
      const id = ric(() => setReady(true), { timeout: 1500 });
      return () => (window as any).cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setReady(true), 800);
    return () => clearTimeout(t);
  }, [skip]);
  return ready;
}

// Configuração de CTAs — edite estas URLs livremente
const CTA_URL = "#convocacao";
const CONTACT_URL = "https://wa.me/";

/* ------------ hooks ------------ */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal, .reveal-left, .reveal-scale");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/**
 * useParallax — deslocamento vertical sutil em elementos [data-parallax].
 * `data-parallax="0.15"` → 15% da distância entre o centro do elemento e
 * o centro da viewport. Usa rAF + IntersectionObserver para só calcular
 * quando visível. Respeita prefers-reduced-motion.
 */
function useParallax() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    if (!nodes.length) return;

    const visible = new Set<HTMLElement>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) visible.add(el);
          else visible.delete(el);
        });
      },
      { rootMargin: "200px 0px" },
    );
    nodes.forEach((n) => io.observe(n));

    let raf = 0;
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      visible.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const delta = center - vh / 2;
        const speed = parseFloat(el.dataset.parallax || "0.12");
        el.style.setProperty("--py", `${(-delta * speed).toFixed(1)}px`);
      });
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);
}

/**
 * useScrollProgress — atualiza a variável --sp (0..1) no elemento .scroll-progress
 * conforme a página é rolada. Barra dourada fina no topo, guia sem distrair.
 */
function useScrollProgress(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    let raf = 0;
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      if (ref.current) ref.current.style.setProperty("--sp", p.toString());
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
}

/* ------------ small components ------------ */
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="gold-rule" />
      <span className="label-eyebrow">{children}</span>
    </div>
  );
}

function SectionTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={`text-display text-[clamp(2rem,4.6vw,3.6rem)] text-ivory ${className}`}
      style={{ color: "var(--ivory)" }}
    >
      {children}
    </h2>
  );
}

/* ------------ nav ------------ */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const links: [string, string][] = [
    ["#limbo", "Limbo"],
    ["#correntes", "Correntes"],
    ["#travessia", "Travessia"],
    ["#manifesto", "Manifesto"],
  ];

  return (
    <header
      className="fixed inset-x-0 top-0 z-40"
      style={{
        backgroundColor: scrolled || open ? "rgba(13,15,14,0.78)" : "transparent",
        backdropFilter: scrolled || open ? "blur(14px) saturate(120%)" : "none",
        borderBottom: `1px solid ${scrolled || open ? "rgba(240,234,223,0.08)" : "transparent"}`,
        transition: "background-color 640ms var(--ease-out-editorial), backdrop-filter 640ms var(--ease-out-editorial), border-color 640ms var(--ease-out-editorial), padding 320ms var(--ease-out-editorial)",
        paddingBlock: scrolled ? "0.75rem" : "1.25rem",
      }}
    >
      <div className="container-editorial flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3 ds-focus" style={{ color: "var(--ivory)" }} aria-label="Os Ressurgentes — início">
          <img src={logoAsset.url} alt="" aria-hidden className="h-9 w-9 object-contain" style={{ filter: "invert(1) brightness(1.1)" }} />
          <span className="serif text-[0.78rem] tracking-[0.34em] uppercase hidden sm:inline">Os Ressurgentes</span>
        </a>

        <nav className="hidden md:flex items-center gap-9" aria-label="Navegação principal">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="ds-nav-link">{label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href={CTA_URL} className="ds-btn ds-btn-primary hidden md:inline-flex" style={{ padding: "0.65rem 1.15rem", fontSize: "0.7rem" }}>
            Solicitar entrevista
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            className="md:hidden ds-focus grid h-10 w-10 place-items-center"
            style={{ color: "var(--ivory)" }}
          >
            <span className="relative block h-[2px] w-6" style={{ backgroundColor: "currentColor", transform: open ? "translateY(0) rotate(45deg)" : "translateY(-5px)", transition: "transform 320ms var(--ease-out-editorial)" }} />
            <span className="absolute block h-[2px] w-6" style={{ backgroundColor: "currentColor", transform: open ? "translateY(0) rotate(-45deg)" : "translateY(5px)", transition: "transform 320ms var(--ease-out-editorial)" }} />
          </button>
        </div>
      </div>

      {/* Sheet mobile */}
      <div
        className="md:hidden overflow-hidden"
        style={{
          maxHeight: open ? "80vh" : "0px",
          transition: "max-height 480ms var(--ease-out-editorial)",
        }}
      >
        <nav className="container-editorial flex flex-col gap-1 pb-8 pt-4" aria-label="Navegação mobile">
          {links.map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="serif text-2xl py-3"
              style={{ color: "var(--ivory)", borderBottom: "1px solid var(--border)" }}
            >
              {label}
            </a>
          ))}
          <a href={CTA_URL} onClick={() => setOpen(false)} className="ds-btn ds-btn-primary mt-6">
            Solicitar entrevista
          </a>
        </nav>
      </div>
    </header>
  );
}

/* ------------ manifesto modal ------------ */
function ManifestoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 md:p-10"
      style={{ backgroundColor: "rgba(13,15,14,0.92)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl border p-8 md:p-14 animate-fade-in"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--forest)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-xs uppercase tracking-[0.24em]"
          style={{ color: "var(--sand)" }}
          aria-label="Fechar"
        >
          Fechar ✕
        </button>
        <p className="label-eyebrow mb-6">Manifesto</p>
        <h3 className="serif mb-10 text-3xl md:text-4xl" style={{ color: "var(--ivory)" }}>
          Manifesto dos Ressurgentes
        </h3>
        <div className="serif space-y-6 text-lg md:text-xl leading-relaxed" style={{ color: "var(--ivory)" }}>
          <p>Não viemos do topo.<br />Viemos do fundo.</p>
          <p>
            Conhecemos o peso do Limbo,<br />
            as Correntes Invisíveis<br />
            e as Sombras que ninguém vê.
          </p>
          <p>Não buscamos voltar a ser quem éramos.</p>
          <p>Escolhemos atravessar.<br />Reconstruir.<br />Ressurgir diferentes.</p>
          <p>Não estamos aqui para seguir um salvador.</p>
          <p>Estamos aqui para responder ao chamado.</p>
          <p>Não caminhamos porque somos fortes.<br />Caminhamos porque decidimos não permanecer.</p>
          <p>Não prometemos a ninguém uma vida sem medo.<br />Prometemos, a nós mesmos, atravessar carregando o medo.</p>
          <p style={{ color: "var(--gold)" }} className="pt-4">Não volto para salvar.<br />Volto para convocar.</p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================= */
function Landing() {
  useReveal();
  useParallax();
  const progressRef = useRef<HTMLDivElement | null>(null);
  useScrollProgress(progressRef);
  const [manifestoOpen, setManifestoOpen] = useState(false);
  // Save-Data / tela muito estreita → não monta o 3D (mantém metáfora via imagens)
  const skip3D =
    typeof navigator !== "undefined" &&
    (((navigator as any).connection?.saveData ?? false) ||
      ((navigator as any).deviceMemory ?? 8) < 3);
  const sceneReady = useDeferredMount(skip3D);

  return (
    <div id="top" style={{ backgroundColor: "var(--ink)", color: "var(--ivory)" }}>
      {/* Barra de progresso do scroll — guia sutil, dourada */}
      <div ref={progressRef} className="scroll-progress" aria-hidden />

      {/* Cena 3D fixa — brasas ascendentes atrás de todo o conteúdo */}
      {/* Cena 3D fixa — brasas ascendentes atrás de todo o conteúdo.
          Adiada até o browser estar ocioso; desativada em Save-Data. */}
      {sceneReady && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            opacity: 0.4,
          }}
        >
          <Suspense fallback={null}>
            <ForestScene />
          </Suspense>
        </div>
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
      <Nav />


      {/* ============ HERO ============ */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <img
          src={heroForest}
          alt="Homem caminhando por uma floresta escura enevoada"
          className="parallax-y absolute inset-0 h-[115%] w-full -top-[7%] object-cover"
          data-parallax="0.18"
          width={1920}
          height={1280}
          fetchPriority="high"
          decoding="async"
        />
        <div className="mist-overlay" />
        <div className="container-editorial relative z-10 pt-32 pb-24">
          <div className="max-w-3xl">
            <p className="label-eyebrow mb-8 reveal">OS RESSURGENTES · uma travessia para homens</p>
            <h1
              className="text-display text-[clamp(2.4rem,6.4vw,5.6rem)] reveal"
              style={{ color: "var(--ivory)" }}
            >
              Você não está perdido.<br />Está no Limbo.
            </h1>
            <p
              className="mt-8 max-w-xl text-lg md:text-xl font-light leading-relaxed reveal"
              style={{ color: "rgba(240,234,223,0.78)" }}
            >
              Uma mentoria para o homem que já entendeu tudo — e ainda não conseguiu se mover.
            </p>
            <p
              className="serif mt-10 text-xl italic reveal"
              style={{ color: "var(--gold)" }}
            >
              Descer ao fundo. Ressurgir transformado.
            </p>
            <div className="mt-12 flex flex-wrap gap-4 reveal">
              <a href={CTA_URL} className="ds-btn ds-btn-primary">Solicitar entrevista</a>
              <a href="#travessia" className="ds-btn ds-btn-ghost">Conhecer a Travessia</a>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.32em] reveal" style={{ color: "var(--sand)" }}>
              Vagas por entrevista · sem venda automática
            </p>
          </div>
        </div>
        <div className="scroll-cue absolute bottom-8 left-1/2 z-10 text-[0.65rem] uppercase tracking-[0.42em]" style={{ color: "var(--sand)" }} aria-hidden>
          role para descer
        </div>
      </section>

      {/* ============ ESPELHO ============ */}
      <section className="relative py-32 md:py-40" style={{ backgroundColor: "var(--ink)" }}>
        <div className="container-editorial max-w-3xl">
          <div className="reveal">
            <Eyebrow>o espelho</Eyebrow>
            <SectionTitle>
              Você entendeu.<br />
              <span style={{ color: "var(--sand)" }}>E ainda não se moveu.</span>
            </SectionTitle>
          </div>
          <div className="mt-12 space-y-5 text-lg md:text-xl leading-relaxed reveal" style={{ color: "rgba(240,234,223,0.82)" }}>
            <p>Estudou.</p>
            <p>Tentou.</p>
            <p>Recomeçou.</p>
            <p>Prometeu a si mesmo — de novo.</p>
          </div>
          <p className="mt-10 max-w-2xl text-lg md:text-xl leading-relaxed reveal" style={{ color: "rgba(240,234,223,0.7)" }}>
            E continua no mesmo lugar. Não por incapacidade.
          </p>
          <p className="serif mt-10 max-w-2xl text-2xl md:text-3xl italic leading-snug reveal" style={{ color: "var(--ivory)" }}>
            Algo invisível ainda decide por você — enquanto você jura que está no <span style={{ color: "var(--gold)" }}>controle</span>.
          </p>
        </div>
      </section>

      {/* ============ LIMBO ============ */}
      <section id="limbo" className="relative overflow-hidden py-32 md:py-44" style={{ backgroundColor: "var(--forest)" }}>
        <img src={moss} alt="" aria-hidden data-parallax="0.12" className="parallax-y absolute inset-0 h-[120%] w-full -top-[10%] object-cover opacity-20" loading="lazy" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, var(--ink), transparent 30%, transparent 70%, var(--ink))" }} />
        <div className="container-editorial relative max-w-3xl">
          <div className="reveal">
            <Eyebrow>o limbo</Eyebrow>
            <SectionTitle>O Limbo não parece uma prisão.</SectionTitle>
          </div>
          <div className="mt-12 space-y-6 text-lg md:text-xl leading-relaxed reveal" style={{ color: "rgba(240,234,223,0.82)" }}>
            <p>Você trabalha.<br />Você entrega.<br />Você cuida de todos.</p>
            <p>Por fora, a vida anda.</p>
            <p>Por dentro, alguma coisa ficou suspensa.</p>
            <p>Existe uma vida esperando por você — e ela nunca começa.</p>
          </div>
          <blockquote
            className="serif mt-16 border-l-2 pl-8 text-2xl md:text-3xl italic leading-snug reveal"
            style={{ borderColor: "var(--gold)", color: "var(--ivory)" }}
          >
            O Limbo é onde o homem continua funcionando — e já não se reconhece na própria vida.
          </blockquote>
        </div>
      </section>

      {/* ============ CORRENTES INVISÍVEIS ============ */}
      <section id="correntes" className="relative py-32 md:py-40" style={{ backgroundColor: "var(--ink)" }}>
        <div className="container-editorial">
          <div className="max-w-3xl reveal">
            <Eyebrow>correntes invisíveis</Eyebrow>
            <SectionTitle>
              Não é falta de capacidade.<br />
              <span style={{ color: "var(--sand)" }}>São Correntes Invisíveis.</span>
            </SectionTitle>
            <div className="mt-10 space-y-4 text-lg leading-relaxed" style={{ color: "rgba(240,234,223,0.78)" }}>
              <p>Elas não aparecem no corpo.<br />Não fazem barulho.<br />Não te impedem de trabalhar.</p>
              <p>Só mantêm tudo girando no mesmo eixo.</p>
            </div>
          </div>

          <div className="mt-20 grid gap-px md:grid-cols-2 lg:grid-cols-3" style={{ backgroundColor: "var(--border)" }}>
            {[
              ["Aprovação", "Adia decisões pra não decepcionar ninguém."],
              ["Espera", "Espera clareza, força ou segurança para começar."],
              ["Controle", "Tenta prever tudo pra não se expor."],
              ["Dispersão", "Se ocupa demais pra não encarar o essencial."],
              ["Culpa", "Ainda paga por histórias que já deviam ter terminado."],
              ["Medo", "Chama de prudência o que é, em silêncio, adiamento."],
            ].map(([title, body], i) => (
              <article
                key={title}
                className="reveal group p-10 transition-colors duration-500 hover:bg-[color:var(--forest)]"
                style={{ backgroundColor: "var(--ink)", ["--reveal-delay" as string]: `${i * 90}ms` }}
              >
                <div className="mb-6 flex items-center gap-3">
                  <span className="serif text-sm" style={{ color: "var(--gold)" }}>0{i + 1}</span>
                  <span className="h-px w-6" style={{ backgroundColor: "var(--gold)" }} />
                </div>
                <h3 className="serif mb-4 text-2xl" style={{ color: "var(--ivory)" }}>{title}</h3>
                <p className="text-base leading-relaxed" style={{ color: "rgba(240,234,223,0.7)" }}>{body}</p>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-16 max-w-2xl text-center text-base italic reveal" style={{ color: "var(--sand)" }}>
            Cada homem carrega a sua combinação. A Travessia começa quando o invisível é nomeado.
          </p>
        </div>
      </section>

      {/* ============ SOMBRAS ============ */}
      <section className="relative overflow-hidden py-32 md:py-44" style={{ backgroundColor: "var(--forest)" }}>
        <div className="container-editorial max-w-3xl">
          <div className="reveal">
            <Eyebrow>as sombras</Eyebrow>
            <SectionTitle>
              Romper correntes não basta.<br />
              <span style={{ color: "var(--sand)" }}>É preciso atravessar as Sombras.</span>
            </SectionTitle>
          </div>
          <div className="mt-12 space-y-6 text-lg md:text-xl leading-relaxed reveal" style={{ color: "rgba(240,234,223,0.82)" }}>
            <p>Sombras não são defeitos a eliminar.</p>
            <p>São desejos, emoções e forças que foram reprimidas — e agora dirigem sua vida em silêncio.</p>
            <p>Quem foge delas, obedece. Quem atravessa, integra.</p>
            <p>O que ameaçava vira consciência, beleza e realização.</p>
          </div>
          <blockquote
            className="serif mt-16 text-2xl md:text-3xl italic leading-snug reveal"
            style={{ color: "var(--ivory)" }}
          >
            <span style={{ color: "var(--gold)" }}>“</span>
            Ajudo homens a atravessar suas sombras, integrar seus desejos e transformar sua intensidade em consciência, beleza e realização.
            <span style={{ color: "var(--gold)" }}>”</span>
            <footer className="mt-6 text-xs uppercase tracking-[0.32em] not-italic" style={{ color: "var(--sand)" }}>
              — o.gentólogo
            </footer>
          </blockquote>
        </div>
      </section>

      {/* ============ CHAMADO ============ */}
      <section className="relative py-32 md:py-40" style={{ backgroundColor: "var(--ink)" }}>
        <div className="container-editorial max-w-3xl">
          <div className="reveal">
            <Eyebrow>o chamado</Eyebrow>
            <SectionTitle>Nem todo homem escuta quando é chamado.</SectionTitle>
          </div>
          <div className="mt-12 space-y-6 text-lg md:text-xl leading-relaxed reveal" style={{ color: "rgba(240,234,223,0.82)" }}>
            <p>Alguns escutam e voltam para o conhecido.</p>
            <p>Outros escutam, sentem medo e ficam.</p>
            <p>Poucos entendem: o chamado não tira o medo.</p>
            <p>Ele só mostra que continuar igual já custa mais caro.</p>
          </div>
          <p className="serif mt-16 text-3xl md:text-4xl italic leading-snug reveal" style={{ color: "var(--gold)" }}>
            Muitos ouvirão.<br />Poucos atravessam.
          </p>
        </div>
      </section>

      {/* ============ O MOMENTO ============ */}
      <section className="relative overflow-hidden py-40 md:py-56">
        <img src={horizon} alt="" aria-hidden data-parallax="0.2" className="parallax-y absolute inset-0 h-[125%] w-full -top-[12%] object-cover opacity-40" loading="lazy" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, var(--ink) 0%, rgba(13,15,14,0.6) 30%, rgba(13,15,14,0.6) 70%, var(--ink) 100%)" }} />
        <div className="container-editorial relative max-w-3xl text-center">
          <p className="label-eyebrow mb-8 reveal" style={{ color: "var(--gold)" }}>o momento</p>
          <h2 className="text-display text-[clamp(2rem,5vw,4rem)] reveal" style={{ color: "var(--ivory)" }}>
            E se hoje for a linha entre quem você é e quem ainda pode se tornar?
          </h2>
          <div className="mx-auto mt-12 max-w-xl space-y-6 text-lg leading-relaxed reveal" style={{ color: "rgba(240,234,223,0.82)" }}>
            <p>Muitos esperam uma oportunidade para mudar.</p>
            <p>Até entenderem que ela não chega como certeza.</p>
            <p style={{ color: "var(--gold)" }}>Chega como decisão.</p>
          </div>
          <p className="serif mt-16 text-2xl md:text-3xl italic reveal" style={{ color: "var(--ivory)" }}>
            Você atravessa — ou deixa passar?
          </p>
          <div className="mt-12 reveal">
            <a href={CTA_URL} className="ds-btn ds-btn-primary">Solicitar entrevista</a>
          </div>
        </div>
      </section>

      {/* ============ A TRAVESSIA ============ */}
      <section id="travessia" className="py-32 md:py-40" style={{ backgroundColor: "var(--ink)" }}>
        <div className="container-editorial">
          <div className="max-w-3xl reveal">
            <Eyebrow>a travessia</Eyebrow>
            <SectionTitle>
              A Travessia não entrega uma vida pronta.<br />
              <span style={{ color: "var(--sand)" }}>Devolve a autoria da sua.</span>
            </SectionTitle>
          </div>

          <ol className="mt-20 mx-auto max-w-3xl">
            {[
              ["Reconhecer o Limbo", "Ver onde a sua vida ficou suspensa."],
              ["Nomear as Correntes", "Identificar os padrões que ainda decidem por você."],
              ["Atravessar as Sombras", "Integrar desejos, medos e emoções negados."],
              ["Assumir o Poder Criador", "Transformar consciência em decisão."],
              ["Reconstruir a Identidade", "Parar de reagir. Começar a construir."],
              ["Ressurgir", "Não voltar a ser. Passar a existir de outro modo."],
            ].map(([title, body], i) => (
              <li key={title} className="reveal-left relative border-l pb-14 pl-10 md:pl-16 last:pb-0" style={{ borderColor: "var(--border)", ["--reveal-delay" as string]: `${i * 80}ms` }}>
                <span
                  className="serif absolute left-0 top-0 -translate-x-1/2 grid h-10 w-10 place-items-center rounded-full text-sm"
                  style={{ backgroundColor: "var(--ink)", color: "var(--gold)", border: "1px solid var(--gold)" }}
                >
                  {i + 1}
                </span>
                <h3 className="serif text-2xl md:text-3xl" style={{ color: "var(--ivory)" }}>{title}</h3>
                <p className="mt-3 text-base md:text-lg leading-relaxed" style={{ color: "rgba(240,234,223,0.72)" }}>{body}</p>
              </li>
            ))}
          </ol>

          <p className="mx-auto mt-12 max-w-2xl text-center text-base italic reveal" style={{ color: "var(--sand)" }}>
            Sem promessa linear. Cada homem no seu ritmo. Há caminho.
          </p>
        </div>
      </section>

      {/* ============ QUEM SÃO ============ */}
      <section className="relative overflow-hidden py-32 md:py-40" style={{ backgroundColor: "var(--forest)" }}>
        <div className="container-editorial max-w-3xl">
          <div className="reveal">
            <Eyebrow>quem são</Eyebrow>
            <SectionTitle>Não são homens que nunca caíram.</SectionTitle>
          </div>
          <div className="mt-12 space-y-6 text-lg md:text-xl leading-relaxed reveal" style={{ color: "rgba(240,234,223,0.82)" }}>
            <p>São homens que decidiram não morar na queda.</p>
            <p>Não procuram salvador.</p>
            <p>Não terceirizam a própria vida.</p>
            <p>Não negam suas Sombras.</p>
            <p>Não esperam a ausência de medo para agir.</p>
            <p>Caminham juntos porque nenhuma Travessia precisa ser solitária.</p>
          </div>
          <p className="serif mt-14 text-2xl md:text-3xl italic reveal" style={{ color: "var(--gold)" }}>
            Não uma comunidade de prontos. Uma comunidade de dispostos.
          </p>
        </div>
      </section>

      {/* ============ MANIFESTO ============ */}
      <section id="manifesto" className="relative py-32 md:py-44" style={{ backgroundColor: "var(--ink)" }}>
        <div className="container-editorial max-w-3xl text-center">
          <p className="label-eyebrow mb-8 reveal">o manifesto</p>
          <div className="serif space-y-8 text-2xl md:text-4xl leading-snug reveal" style={{ color: "var(--ivory)" }}>
            <p>Não viemos do topo.<br />Viemos do fundo.</p>
            <p style={{ color: "rgba(240,234,223,0.65)" }} className="text-xl md:text-2xl">
              Conhecemos o peso do Limbo,<br />as Correntes Invisíveis<br />e as Sombras que ninguém vê.
            </p>
            <p>Escolhemos atravessar.<br />Reconstruir.<br /><span style={{ color: "var(--gold)" }}>Ressurgir diferentes.</span></p>
          </div>
          <p className="serif mt-16 text-3xl md:text-5xl italic reveal" style={{ color: "var(--gold)" }}>
            Não volto para salvar.<br />Volto para convocar.
          </p>
          <div className="mt-14 reveal">
            <button onClick={() => setManifestoOpen(true)} className="ds-btn ds-btn-ghost">
              Ler o manifesto completo
            </button>
          </div>
        </div>
      </section>

      {/* ============ VÍDEO ============ */}
      <section className="py-24 md:py-32" style={{ backgroundColor: "var(--forest)" }}>
        <div className="container-editorial max-w-4xl">
          <div className="text-center reveal">
            <Eyebrow>a convocação</Eyebrow>
            <h2 className="text-display text-[clamp(1.8rem,4vw,3rem)]" style={{ color: "var(--ivory)" }}>
              O Manifesto dos Ressurgentes.
            </h2>
          </div>
          <div className="mt-14 group relative aspect-video overflow-hidden reveal cursor-pointer" style={{ backgroundColor: "var(--ink)" }}>
            <img src={videoThumb} alt="Prévia do vídeo-manifesto" className="h-full w-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 grid place-items-center" style={{ background: "linear-gradient(180deg, rgba(13,15,14,0.3), rgba(13,15,14,0.6))" }}>
              <div className="grid h-20 w-20 place-items-center rounded-full border transition-all group-hover:scale-110" style={{ borderColor: "var(--gold)", backgroundColor: "rgba(13,15,14,0.4)" }}>
                <svg width="20" height="24" viewBox="0 0 20 24" fill="none" aria-hidden>
                  <path d="M0 0L20 12L0 24V0Z" fill="var(--gold)" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-6 left-6 text-xs uppercase tracking-[0.32em]" style={{ color: "var(--ivory)" }}>
              em breve
            </div>
          </div>
          <p className="mx-auto mt-8 max-w-lg text-center text-base italic reveal" style={{ color: "var(--sand)" }}>
            Não é sobre sucesso. É uma convocação para quem cansou de ficar parado.
          </p>
        </div>
      </section>

      {/* ============ MINHA TRAVESSIA ============ */}
      <section className="py-32 md:py-40" style={{ backgroundColor: "var(--ink)" }}>
        <div className="container-editorial grid gap-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-24">
          <div className="reveal">
            <div className="sticky top-32">
              <img src={mentorPortrait.url} alt="Retrato de o.gentólogo" className="w-full object-cover" loading="lazy" width={1200} height={1500} />
              <p className="serif mt-6 text-lg italic" style={{ color: "var(--sand)" }}>o.gentólogo</p>
            </div>
          </div>
          <div>
            <div className="reveal">
              <Eyebrow>minha travessia</Eyebrow>
              <SectionTitle>Também atravesso.</SectionTitle>
            </div>
            <div className="serif mt-10 space-y-8 text-lg md:text-xl leading-relaxed reveal" style={{ color: "rgba(240,234,223,0.85)" }}>
              <p>
                Por muito tempo achei que faltava conhecimento. Estudei, li, ensinei, ajudei muitos —
                e mesmo assim, quando a porta se fechava, sempre a mesma pergunta:
                <span className="italic block mt-4" style={{ color: "var(--gold)" }}>se eu sei tanto, por que ainda estou preso?</span>
              </p>
              <p>
                Foi aí que entendi: o Limbo não é falta de inteligência. É um lugar silencioso onde o
                homem funciona por fora — trabalha, entrega, cuida — enquanto por dentro uma vida
                inteira espera para começar.
              </p>
              <p>
                Conheço o peso do adiar. A culpa de saber o caminho e não caminhar. As Correntes
                Invisíveis que fazem crer no amanhã enquanto se repete o hoje.
              </p>
              <p>
                Minha Travessia não começou quando encontrei respostas. Começou quando parei de fugir
                das minhas Sombras — e entendi que coragem
                <span className="italic" style={{ color: "var(--ivory)" }}> não é ausência de medo, é atravessar carregando o medo.</span>
              </p>
              <p>
                Os Ressurgentes nasceram disso. Não caminho à frente porque sou melhor.
                <span className="block mt-3" style={{ color: "var(--gold)" }}>Caminho ao lado porque também continuo atravessando.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FRASE MESTRA ============ */}
      <section className="relative overflow-hidden py-32 md:py-44" style={{ backgroundColor: "var(--forest)" }}>
        <div className="container-editorial max-w-3xl text-center">
          <p className="label-eyebrow mb-10 reveal">o compromisso do ressurgente</p>
          <p className="serif text-[clamp(1.6rem,3.5vw,2.6rem)] italic leading-snug reveal" style={{ color: "var(--ivory)" }}>
            <span style={{ color: "var(--gold)" }}>“</span>
            Eu deixo de me prender ao medo, assumo meu poder criador e uso minha intensidade para curar, prosperar e florescer.
            <span style={{ color: "var(--gold)" }}>”</span>
          </p>
        </div>
      </section>

      {/* ============ PARA QUEM É / NÃO É ============ */}
      <section className="py-32 md:py-40" style={{ backgroundColor: "var(--ink)" }}>
        <div className="container-editorial grid gap-16 md:grid-cols-2 md:gap-20">
          <div className="reveal">
            <Eyebrow>pode ser para você</Eyebrow>
            <h3 className="serif text-3xl md:text-4xl leading-snug" style={{ color: "var(--ivory)" }}>
              Pode ser para você se…
            </h3>
            <ul className="mt-10 space-y-4 text-base md:text-lg" style={{ color: "rgba(240,234,223,0.82)" }}>
              {[
                "entendeu muito — e ainda não virou movimento;",
                "sente que vive abaixo do que poderia construir;",
                "reconhece padrões que se repetem;",
                "cansou de só se motivar;",
                "quer atravessar as Sombras sem ser julgado;",
                "está pronto para assumir a própria vida;",
                "quer caminhar ao lado de homens em Travessia.",
              ].map((t) => (
                <li key={t} className="flex gap-4">
                  <span className="mt-3 h-px w-4 shrink-0" style={{ backgroundColor: "var(--gold)" }} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal">
            <Eyebrow>não é para</Eyebrow>
            <h3 className="serif text-3xl md:text-4xl leading-snug" style={{ color: "var(--ivory)" }}>
              Não é para quem procura…
            </h3>
            <ul className="mt-10 space-y-4 text-base md:text-lg" style={{ color: "rgba(240,234,223,0.6)" }}>
              {[
                "salvador;",
                "guru;",
                "respostas prontas;",
                "motivação passageira;",
                "fórmula universal;",
                "culpado externo;",
                "atalho sem responsabilidade;",
                "conforto para permanecer na dor.",
              ].map((t) => (
                <li key={t} className="flex gap-4">
                  <span className="mt-3 h-px w-4 shrink-0" style={{ backgroundColor: "var(--muted-foreground)" }} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="serif mt-10 text-lg italic" style={{ color: "var(--sand)" }}>
              Ouvir o chamado não é o mesmo que estar pronto para atravessar.
            </p>
          </div>
        </div>
      </section>

      {/* ============ COMUNIDADE ============ */}
      <section className="relative overflow-hidden py-32 md:py-40" style={{ backgroundColor: "var(--forest)" }}>
        <div className="container-editorial max-w-3xl">
          <div className="reveal">
            <Eyebrow>a comunidade</Eyebrow>
            <SectionTitle>
              Você não estará sozinho na lama.<br />
              <span style={{ color: "var(--sand)" }}>Mas ninguém a atravessa por você.</span>
            </SectionTitle>
          </div>
          <div className="mt-12 space-y-6 text-lg md:text-xl leading-relaxed reveal" style={{ color: "rgba(240,234,223,0.82)" }}>
            <p>OS RESSURGENTES é uma comunidade de homens em Travessia.</p>
            <p>Conversa. Consciência. Desafio. Movimento. Reconstrução.</p>
            <p>Ninguém é carregado. Ninguém é humilhado.</p>
            <p>Ninguém precisa fingir que já venceu.</p>
            <p>Cada homem é convocado ao próximo passo possível.</p>
          </div>
        </div>
      </section>

      {/* ============ CONVOCAÇÃO FINAL ============ */}
      <section id="convocacao" className="relative overflow-hidden py-40 md:py-56">
        <img src={horizon} alt="" aria-hidden data-parallax="0.22" className="parallax-y absolute inset-0 h-[125%] w-full -top-[12%] object-cover" loading="lazy" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, var(--ink) 0%, rgba(13,15,14,0.45) 40%, rgba(13,15,14,0.75) 100%)" }} />
        <div className="container-editorial relative max-w-3xl text-center">
          <p className="label-eyebrow mb-10 reveal" style={{ color: "var(--gold)" }}>a convocação</p>
          <h2 className="text-display text-[clamp(2rem,5.5vw,4.4rem)] reveal" style={{ color: "var(--ivory)" }}>
            Correntes Invisíveis não caem sozinhas.
          </h2>
          <p className="serif mt-8 text-xl md:text-2xl italic reveal" style={{ color: "var(--sand)" }}>
            A entrada é por entrevista. Um encontro. Uma escuta. Uma decisão.
          </p>
          <div className="mx-auto mt-12 max-w-xl space-y-4 text-lg leading-relaxed reveal" style={{ color: "rgba(240,234,223,0.85)" }}>
            <p>Você não precisa ter todas as respostas.</p>
            <p>Precisa reconhecer se continuar igual ainda cabe.</p>
          </div>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-4 reveal">
            <a href={CONTACT_URL} className="ds-btn ds-btn-primary">Solicitar entrevista</a>
            <a href="#manifesto" className="ds-btn ds-btn-ghost">Reler o Manifesto</a>
          </div>
          <p className="mt-10 text-xs uppercase tracking-[0.32em] reveal" style={{ color: "var(--sand)" }}>
            Sem pressão. Sem performance. Só verdade.
          </p>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t py-16" style={{ borderColor: "var(--border)", backgroundColor: "var(--ink)" }}>
        <div className="container-editorial">
          <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-4">
                <img src={logoAsset.url} alt="Os Ressurgentes" className="h-14 w-14 object-contain" style={{ filter: "invert(1) brightness(1.1)" }} />
                <div>
                  <p className="serif text-lg tracking-[0.24em] uppercase" style={{ color: "var(--ivory)" }}>OS RESSURGENTES</p>
                  <p className="serif mt-1 italic" style={{ color: "var(--sand)" }}>o.gentólogo</p>
                </div>
              </div>
              <p className="mt-6 max-w-sm text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                Descer ao fundo. Ressurgir transformado.
              </p>
            </div>
            <div>
              <p className="label-eyebrow mb-4">Navegar</p>
              <ul className="space-y-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                <li><a href="#limbo" className="hover:text-[color:var(--gold)]">O Limbo</a></li>
                <li><a href="#correntes" className="hover:text-[color:var(--gold)]">Correntes Invisíveis</a></li>
                <li><a href="#travessia" className="hover:text-[color:var(--gold)]">A Travessia</a></li>
                <li><a href="#manifesto" className="hover:text-[color:var(--gold)]">Manifesto</a></li>
              </ul>
            </div>
            <div>
              <p className="label-eyebrow mb-4">Entrar</p>
              <ul className="space-y-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                <li><a href={CONTACT_URL} className="hover:text-[color:var(--gold)]">Solicitar entrevista</a></li>
                <li><a href="#" className="hover:text-[color:var(--gold)]">Instagram</a></li>
                <li><a href="#" className="hover:text-[color:var(--gold)]">Política de privacidade</a></li>
                <li><a href="#" className="hover:text-[color:var(--gold)]">Termos de uso</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-14 flex flex-col gap-4 border-t pt-8 text-xs md:flex-row md:items-center md:justify-between" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
            <p>© {new Date().getFullYear()} OS RESSURGENTES · o.gentólogo. Todos os direitos reservados.</p>
            <p className="max-w-md md:text-right">
              Este trabalho não substitui acompanhamento médico, psicológico ou psiquiátrico.
            </p>
          </div>
        </div>
      </footer>

      <ManifestoModal open={manifestoOpen} onClose={() => setManifestoOpen(false)} />
      </div>
    </div>

  );
}
