import { ArrowRight, Heart } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const TEASES = [
  "Opa! O Jesus fugiu 🏃💨",
  "Ele tem vergonha, coitado 🙈",
  "Quase! Mas esse botão tem vida própria 😅",
  "O Jesus pediu para dizer que hoje não está disponível 🚫",
  "Insistente… mas só a Helena aceita cliques aqui 🩷",
  "Já desisti de o defender, clica na Helena 😂",
];

type Pos = { x: number; y: number };

function Polaroid({
  src,
  alt,
  name,
  tilt,
}: {
  src: string;
  alt: string;
  name: string;
  tilt: string;
}) {
  return (
    <figure
      className={`relative w-[min(40vw,10.5rem)] bg-polaroid p-2 pb-9 shadow-polaroid ${tilt}`}
    >
      <img
        src={src}
        alt={alt}
        width={720}
        height={960}
        loading="eager"
        className="aspect-[4/5] w-full object-cover"
      />
      <figcaption className="font-hand absolute inset-x-0 bottom-1.5 text-center text-2xl font-bold leading-none text-foreground/75">
        {name}
      </figcaption>
    </figure>
  );
}

const POEM: string[][] = [
  [
    "Isto é só um poema,",
    "umas palavras arrumadas",
    "numa fila, ao pé uma da outra.",
  ],
  [
    "Não tem nenhum feitiço,",
    "nenhuma armadilha,",
    "nenhum truque escondido.",
  ],
  [
    "Mas se o teu sorriso",
    "chegar antes de eu acabar,",
    "a culpa é das palavras,",
    "que nunca sabem ficar quietas",
    "quando falam de ti.",
  ],
  [
    "E se, por acaso,",
    "no fim da última linha",
    "te der um calor no peito…",
    "foi só o poema.",
    "Eu não tenho nada com isso. 😌",
  ],
];

const FACES = ["😏", "😎", "🙈", "😅", "🤭", "🫣"];

const FLOATING_HEARTS = [
  { left: "8%", size: 18, dur: "7s", delay: "0s" },
  { left: "22%", size: 12, dur: "9s", delay: "1.5s" },
  { left: "38%", size: 20, dur: "8s", delay: "3s" },
  { left: "56%", size: 14, dur: "7.5s", delay: "0.8s" },
  { left: "72%", size: 22, dur: "9s", delay: "2.2s" },
  { left: "88%", size: 13, dur: "8s", delay: "4s" },
];

export function WhoIsCuterModal({
  onChosen,
  onContinue,
}: {
  onChosen?: () => void;
  onContinue?: () => void;
}) {
  const [note, setNote] = useState(false);
  const [poemStage, setPoemStage] = useState<"intro" | "poem" | null>(null);
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [tilt, setTilt] = useState(0);
  const [fleeing, setFleeing] = useState(false);
  const [dodges, setDodges] = useState(0);
  const [face, setFace] = useState(0);
  const [chosen, setChosen] = useState(false);
  const jesusRef = useRef<HTMLButtonElement | null>(null);
  const posRef = useRef<Pos>({ x: 0, y: 0 });
  const fleeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const moveRandom = useCallback((minDistance: number) => {
    const el = jesusRef.current;
    if (!el) return;

    // posição "natural" do botão (sem o deslocamento atual)
    const current = posRef.current;
    const rect = el.getBoundingClientRect();
    const baseLeft = rect.left - current.x;
    const baseTop = rect.top - current.y;
    const margin = 12;

    const minX = margin - baseLeft;
    const maxX = window.innerWidth - margin - (baseLeft + rect.width);
    const minY = margin - baseTop;
    const maxY = window.innerHeight - margin - (baseTop + rect.height);

    let next = current;
    for (let i = 0; i < 12; i += 1) {
      next = {
        x: minX + Math.random() * Math.max(0, maxX - minX),
        y: minY + Math.random() * Math.max(0, maxY - minY),
      };
      if (Math.hypot(next.x - current.x, next.y - current.y) > minDistance) break;
    }

    posRef.current = next;
    setPos(next);
    setTilt(Math.round((Math.random() - 0.5) * 36));
    setFace(Math.floor(Math.random() * FACES.length));
  }, []);

  // foge de verdade quando ela tenta tocar/clicar
  const dodge = useCallback(() => {
    moveRandom(130);
    setDodges((count) => count + 1);
    setFleeing(true);
    if (fleeTimer.current) clearTimeout(fleeTimer.current);
    fleeTimer.current = setTimeout(() => setFleeing(false), 700);
  }, [moveRandom]);

  // depois do "Eu sabia!", mostra o cantinho
  useEffect(() => {
    if (!chosen) return;
    const timer = setTimeout(() => setNote(true), 2600);
    return () => clearTimeout(timer);
  }, [chosen]);

  // enquanto isso, anda sozinho pela tela fingindo que não é nada com ele
  useEffect(() => {
    if (chosen) return;
    const interval = setInterval(() => moveRandom(60), 1400);
    return () => {
      clearInterval(interval);
      if (fleeTimer.current) clearTimeout(fleeTimer.current);
    };
  }, [chosen, moveRandom]);

  const tease = dodges > 0 ? TEASES[(dodges - 1) % TEASES.length] : null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-foreground/45 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cuter-title"
    >
      <div className="gate-in relative flex max-h-dvh w-full max-w-sm flex-col items-center rounded-3xl bg-[color-mix(in_oklab,var(--gate-top)_88%,white)] px-4 pb-5 pt-6 text-center shadow-polaroid">
        <Heart
          className="absolute -top-3 left-1/2 size-7 -translate-x-1/2 fill-primary text-primary"
          aria-hidden="true"
        />

        {poemStage === "intro" ? (
          <div className="gate-in flex w-full flex-col items-center px-2 pb-1 pt-3">
            <div className="grid size-16 place-items-center rounded-full bg-primary/10 text-3xl" aria-hidden="true">
              📜
            </div>
            <h2
              id="cuter-title"
              className="font-hand mt-5 text-[clamp(2.1rem,6.4dvh,2.9rem)] font-bold leading-[1.05] text-primary"
            >
              É só um poema.
            </h2>
            <p className="mt-3 max-w-[16rem] text-[0.95rem] leading-relaxed text-foreground/75">
              Não vais te apaixonar, tá, meu bem? 😌
            </p>
            <button
              type="button"
              className="gate-key mt-7 inline-flex items-center gap-2 rounded-2xl px-7 py-3 text-sm font-bold tracking-[0.18em]"
              onClick={() => setPoemStage("poem")}
            >
              LER O POEMA
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : poemStage === "poem" ? (
          <article
            className="flex max-h-[calc(100dvh-4rem)] w-full flex-col items-center overflow-y-auto px-3 pb-2 pt-2"
            aria-labelledby="cuter-title"
          >
            <h2
              id="cuter-title"
              className="font-hand gate-in text-[clamp(2rem,6dvh,2.6rem)] font-bold leading-none text-primary"
            >
              Só um poema
            </h2>
            <span className="mt-3 h-px w-14 bg-primary/35" aria-hidden="true" />

            <div className="mt-5 space-y-5">
              {(() => {
                let index = 0;
                return POEM.map((stanza, si) => (
                  <p key={si} className="font-hand text-[1.35rem] leading-snug text-foreground/85">
                    {stanza.map((line) => {
                      const delay = 500 + index * 380;
                      index += 1;
                      return (
                        <span
                          key={line}
                          className="gate-in block"
                          style={{ animationDelay: `${delay}ms` }}
                        >
                          {line}
                        </span>
                      );
                    })}
                  </p>
                ));
              })()}
            </div>

            <Heart
              className="gate-in mt-6 size-5 fill-primary text-primary"
              style={{ animationDelay: `${500 + POEM.flat().length * 380 + 300}ms` }}
              aria-hidden="true"
            />
          </article>
        ) : !chosen ? (
          <>
            <h2
              id="cuter-title"
              className="font-hand text-[clamp(1.7rem,5dvh,2.2rem)] font-bold leading-tight text-primary"
            >
              Última verificação, juro! 🕵️‍♀️
            </h2>
            <p className="mt-1 max-w-[18rem] text-sm text-foreground/75">
              Assim só para confirmar mesmo… <br />
              quem é o mais fofo? 🩷
            </p>

            <div className="mt-5 flex items-start justify-center gap-3">
              <Polaroid
                src="/jesus.jpg"
                alt="Foto do Jesus"
                name="Jesus"
                tilt="rotate-[-4deg]"
              />
              <Polaroid
                src="/helena.jpg"
                alt="Foto da Helena"
                name="Helena"
                tilt="rotate-[3.5deg] mt-3"
              />
            </div>

            <div className="mt-5 flex w-full items-center justify-center gap-3">
              <button
                ref={jesusRef}
                type="button"
                className="gate-key relative z-10 rounded-2xl px-5 py-2.5 text-base font-semibold"
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px) rotate(${tilt}deg) scale(${fleeing ? 1.12 : 1})`,
                  transition: fleeing
                    ? "transform 240ms cubic-bezier(0.34, 1.56, 0.64, 1)"
                    : "transform 1100ms cubic-bezier(0.45, 0, 0.25, 1)",
                }}
                onPointerEnter={dodge}
                onPointerDown={(event) => {
                  event.preventDefault();
                  dodge();
                }}
                onTouchStart={(event) => {
                  event.preventDefault();
                  dodge();
                }}
                onFocus={dodge}
                onClick={(event) => {
                  event.preventDefault();
                  dodge();
                }}
              >
                Jesus {fleeing ? "🏃💨" : FACES[face]}
              </button>

              <button
                type="button"
                className="gate-key relative z-20 rounded-2xl px-5 py-2.5 text-base font-semibold"
                onClick={() => {
                  setChosen(true);
                  onChosen?.();
                }}
              >
                Helena 🩷
              </button>
            </div>

            <p
              className="mt-3 h-10 text-xs font-semibold text-primary sm:text-sm"
              aria-live="polite"
            >
              {tease}
            </p>
          </>
        ) : note ? (
          <div className="gate-in relative flex w-full flex-col items-center overflow-hidden px-2 pb-1 pt-3">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              {FLOATING_HEARTS.map((h, i) => (
                <Heart
                  key={i}
                  className="heart-float absolute bottom-0 fill-primary/40 text-primary/40"
                  style={
                    {
                      left: h.left,
                      width: h.size,
                      height: h.size,
                      "--dur": h.dur,
                      "--delay": h.delay,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>

            <div className="relative grid size-16 place-items-center rounded-full bg-primary/10">
              <Heart className="size-8 fill-primary text-primary" aria-hidden="true" />
            </div>

            <h2
              id="cuter-title"
              className="font-hand relative mt-5 text-[clamp(2.1rem,6.4dvh,2.9rem)] font-bold leading-[1.05] text-primary"
            >
              Fiz este cantinho pensando em ti. <span className="not-italic">❤️</span>
            </h2>

            <span className="relative mt-4 h-px w-16 bg-primary/35" aria-hidden="true" />

            <p className="relative mt-4 max-w-[17rem] text-[0.95rem] leading-relaxed text-foreground/75">
              Não é perfeito, mas cada detalhe foi feito com carinho.
            </p>

            <button
              type="button"
              className="gate-key relative mt-7 inline-flex items-center gap-2 rounded-2xl px-7 py-3 text-sm font-bold tracking-[0.18em]"
              onClick={() => {
                setPoemStage("intro");
                onContinue?.();
              }}
            >
              CONTINUAR
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <h2
              id="cuter-title"
              className="font-hand text-[clamp(1.9rem,5.5dvh,2.5rem)] font-bold leading-tight text-primary"
            >
              Eu sabia! 🥰
            </h2>
            <div className="mt-4">
              <Polaroid
                src="/helena.jpg"
                alt="Foto da Helena"
                name="Helena"
                tilt="rotate-[-2deg]"
              />
            </div>
            <p className="mt-4 max-w-[17rem] text-sm text-foreground/80">
              Resposta oficial e sem recurso: a Helena. Bem-vinda, pessoa maravilhosa ♡
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
