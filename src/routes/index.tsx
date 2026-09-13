import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import heroForest from "@/assets/hero-forest.jpg";
import mentorPortrait from "@/assets/mentor-portrait-original.jpg.asset.json";
import horizon from "@/assets/horizon.jpg";
import logoOriginal from "@/assets/logo-transparent.png.asset.json";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    links: [
      // LCP hint — pré-carrega a imagem do hero em alta prioridade
      { rel: "preload", as: "image", href: heroForest, fetchpriority: "high" } as any,
    ],
  }),
});

// Configuração de CTAs — edite estas URLs livremente
const CTA_URL = "https://wa.me/5585996983300?text=Quero%20solicitar%20uma%20entrevista%20para%20a%20mentoria%20Os%20Ressurgentes";
const CONTACT_URL = "https://wa.me/5585996983300?text=Quero%20solicitar%20uma%20entrevista%20para%20a%20mentoria%20Os%20Ressurgentes";

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

function ManifestoVideo() {
  return (
    <div
      className="relative overflow-hidden"
      style={{ backgroundColor: "var(--ink)" }}
    >
      <video
        src="https://d2ol7oe51mr4n9.cloudfront.net/user_3ItB0RucAUWN5dkTKtmjlxlAikf/87d73e3c-0abf-4840-afab-1d2f4bcdae41.mp4"
        controls
        muted
        playsInline
        preload="metadata"
        aria-label="Vídeo da Travessia dos Ressurgentes"
        className="block aspect-video w-full object-cover"
      />
    </div>
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
    ["#limbo", "Para quem é"],
    ["#travessia", "Como funciona"],
    ["#duvidas", "Dúvidas"],
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
          <img src={logoOriginal.url} alt="" aria-hidden className="h-10 w-10 object-contain" style={{ filter: "invert(1)" }} />
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
  return (
    <div id="top" style={{ backgroundColor: "var(--ink)", color: "var(--ivory)" }}>
      {/* Barra de progresso do scroll — guia sutil, dourada */}
      <div ref={progressRef} className="scroll-progress" aria-hidden />

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
              Mentoria individual para homens em reconstrução: uma experiência guiada, um plano de ação e acompanhamento para o seu próximo passo.
            </p>
            <p
              className="serif mt-10 text-xl italic reveal"
              style={{ color: "var(--gold)" }}
            >
              Descer ao fundo. Ressurgir transformado.
            </p>
            <div className="mt-12 flex flex-wrap gap-4 reveal">
              <a href={CTA_URL} className="ds-btn ds-btn-primary">Solicitar entrevista</a>
              <a href="#travessia" className="ds-btn ds-btn-ghost">Como funciona a mentoria</a>
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


      {/* ============ PARA QUEM É ============ */}
      <section id="limbo" className="scroll-mt-24 py-20 md:py-28" style={{ backgroundColor: "var(--forest)" }}>
        <div className="container-editorial">
          <div className="max-w-2xl reveal">
            <Eyebrow>para homens em reconstrução</Eyebrow>
            <SectionTitle>A vida segue. Você quer voltar a fazer parte dela.</SectionTitle>
          </div>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["Decisões adiadas", "Você sabe que precisa mudar algo, mas continua deixando para depois."],
              ["Padrões que se repetem", "Você percebe os mesmos impasses nas suas escolhas e relações."],
              ["Falta de direção", "Você quer organizar o próximo passo e assumir um compromisso com ele."],
            ].map(([title, body]) => (
              <li key={title} className="reveal border-t pt-6" style={{ borderColor: "var(--gold)" }}>
                <h3 className="serif text-2xl">{title}</h3>
                <p className="mt-3 text-base leading-relaxed" style={{ color: "var(--sand)" }}>{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ A TRAVESSIA ============ */}
      <section id="travessia" className="scroll-mt-24 py-20 md:py-28" style={{ backgroundColor: "var(--ink)" }}>
        <div className="container-editorial">
          <div className="max-w-3xl reveal">
            <Eyebrow>como funciona</Eyebrow>
            <SectionTitle>Três etapas. Um próximo passo concreto.</SectionTitle>
            <p className="mt-6 text-lg leading-relaxed" style={{ color: "var(--sand)" }}>
              Na Travessia Individual, você traz um desafio da sua vida. O processo passa pela escuta,
              por uma experiência guiada e pela construção de um plano com acompanhamento.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-base reveal">
            {["Formato individual", "12 horas no total", "Plano e acompanhamento"].map((label) => (
              <span key={label} className="border px-4 py-2" style={{ borderColor: "var(--border)", color: "var(--sand)" }}>{label}</span>
            ))}
          </div>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { title: "Encarar", time: "1 hora · entrevista", body: "Conversar sobre o seu momento e definir o desafio que você quer trabalhar.", focus: "Foco: clareza sobre o ponto de partida." },
              { title: "Romper", time: "4 horas · experiência guiada", body: "Explorar esse desafio com o Jogo do Herói, por meio de perguntas, reflexão e novas possibilidades de ação.", focus: "Foco: reconhecer padrões e considerar outras escolhas." },
              { title: "Reescrever", time: "7 horas · plano e acompanhamento", body: "Construir um plano de ação e acompanhar os próximos passos da sua reconstrução.", focus: "Foco: transformar reflexão em ações na sua rotina." },
            ].map(({ title, time, body, focus }, i) => (
              <li key={title} className="reveal border p-6 md:p-8" style={{ borderColor: "var(--border)", backgroundColor: "var(--forest)" }}>
                <span className="serif text-4xl" style={{ color: "var(--gold)" }}>0{i + 1}</span>
                <h3 className="serif mt-5 text-3xl">{title}</h3>
                <p className="mt-2 text-sm" style={{ color: "var(--gold)" }}>{time}</p>
                <p className="mt-6 text-base leading-relaxed" style={{ color: "var(--sand)" }}>{body}</p>
                <p className="mt-6 border-t pt-5 text-base leading-relaxed" style={{ borderColor: "var(--border)" }}>{focus}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col items-start gap-5 reveal">
            <p className="max-w-2xl text-base leading-relaxed" style={{ color: "var(--sand)" }}>
              O primeiro contato é pelo WhatsApp para solicitar a entrevista.
              Consulte a agenda, a distribuição dos encontros e o investimento antes de decidir participar.
            </p>
            <a href={CTA_URL} className="ds-btn ds-btn-primary">Solicitar entrevista</a>
          </div>
        </div>
      </section>

      {/* ============ MINHA TRAVESSIA ============ */}
      <section className="py-32 md:py-40" style={{ backgroundColor: "var(--ink)" }}>
        <div className="container-editorial grid gap-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-24">
          <div className="reveal">
            <div className="sticky top-32">
              <img src={mentorPortrait.url} alt="Fotografia de o.gentólogo" className="w-full object-cover" loading="lazy" width={1024} height={1024} />
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


      {/* ============ PERGUNTAS FREQUENTES ============ */}
      <section id="duvidas" className="scroll-mt-24 py-20 md:py-28" style={{ backgroundColor: "var(--forest)" }}>
        <div className="container-editorial max-w-3xl">
          <div className="reveal">
            <Eyebrow>antes de começar</Eyebrow>
            <SectionTitle>Dúvidas práticas.</SectionTitle>
          </div>
          <div className="mt-10 reveal">
            {[
              ["O que vou trabalhar na mentoria?", "Você parte de um desafio da sua vida. A Travessia combina entrevista, experiência guiada e um plano de ação com acompanhamento."],
              ["Preciso conhecer o Jogo do Herói?", "A experiência é guiada. Você participa a partir do seu desafio, com perguntas e reflexões ao longo do processo."],
              ["Como são distribuídas as 12 horas?", "São 1 hora de entrevista, 4 horas de experiência guiada e 7 horas de plano e acompanhamento. A distribuição dos encontros deve ser combinada antes do início."],
              ["Como consultar agenda e investimento?", "Use o botão Solicitar entrevista para conversar pelo WhatsApp e conhecer as condições de participação."],
              ["A mentoria substitui terapia?", "Não. Este trabalho não substitui acompanhamento médico, psicológico ou psiquiátrico."],
            ].map(([question, answer]) => (
              <details key={question} className="group border-b py-5" style={{ borderColor: "var(--border)" }}>
                <summary className="ds-focus cursor-pointer text-lg leading-relaxed">{question}</summary>
                <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--sand)" }}>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MANIFESTO ============ */}
      <section id="manifesto" className="scroll-mt-24 py-20 md:py-28" style={{ backgroundColor: "var(--ink)" }}>
        <div className="container-editorial grid items-center gap-12 lg:grid-cols-2">
          <div className="reveal">
            <Eyebrow>o compromisso do ressurgente</Eyebrow>
            <p className="serif text-2xl md:text-3xl italic leading-snug">
              Eu deixo de me prender ao medo, assumo meu poder criador e uso minha intensidade para curar, prosperar e florescer.
            </p>
            <button onClick={() => setManifestoOpen(true)} className="ds-btn ds-btn-ghost mt-8">Ler o manifesto completo</button>
          </div>
          <div className="reveal-scale">
            <ManifestoVideo />
          </div>
        </div>
      </section>

      {/* ============ CONVOCAÇÃO FINAL ============ */}
      <section id="convocacao" className="relative overflow-hidden py-24 md:py-32">
        <img src={horizon} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, var(--ink), rgba(13,15,14,0.8))" }} />
        <div className="container-editorial relative max-w-3xl text-center">
          <h2 className="text-display text-[clamp(2rem,5vw,4rem)] reveal">Vamos conversar sobre seu próximo passo?</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed reveal" style={{ color: "var(--sand)" }}>
            Solicite uma entrevista para entender se a Travessia faz sentido para o seu momento.
          </p>
          <a href={CONTACT_URL} className="ds-btn ds-btn-primary mt-8 reveal">Solicitar entrevista</a>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t py-16" style={{ borderColor: "var(--border)", backgroundColor: "var(--ink)" }}>
        <div className="container-editorial">
          <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-4">
                <img src={logoOriginal.url} alt="Os Ressurgentes" className="h-16 w-16 object-contain" style={{ filter: "invert(1)" }} />
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
                <li><a href="#limbo" className="hover:text-[color:var(--gold)]">Para quem é</a></li>
                <li><a href="#duvidas" className="hover:text-[color:var(--gold)]">Dúvidas práticas</a></li>
                <li><a href="#travessia" className="hover:text-[color:var(--gold)]">Como funciona</a></li>
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
