import { ArrowRight, Heart } from "lucide-react";
import { LoveMenu } from "@/components/LoveMenu";
import { Polaroid } from "@/components/Polaroid";
import { useCallback, useEffect, useRef, useState } from "react";

type Pos = { x: number; y: number };

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
  const [menu, setMenu] = useState(false);
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

  // limpa o timer ao sair
  useEffect(() => {
    return () => {
      if (fleeTimer.current) clearTimeout(fleeTimer.current);
    };
  }, []);

  const tease = dodges > 0;

  if (menu) return <LoveMenu />;

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

        {!chosen ? (
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
              <Polaroid src="/jesus.jpg" alt="Foto do Jesus" name="Jesus" tilt="rotate-[-4deg]" />
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
                onPointerDown={(event) => {
                  event.preventDefault();
                  dodge();
                }}
                onClick={(event) => {
                  event.preventDefault();
                  dodge();
                }}
              >
                Jesus{dodges > 0 ? ` ${fleeing ? "🏃💨" : FACES[face]}` : ""}
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

            <div className="mt-3 min-h-[3.75rem] px-2" aria-live="polite">
              {tease && (
                <div className="gate-in" key={dodges}>
                  <p className="text-sm font-bold text-primary">Escolhe outra pessoa 😳</p>
                  <p className="mt-0.5 text-xs leading-snug text-foreground/70">
                    Se disseres que o Jesus é fofo, ele fica sem jeito.
                    <br />
                    Escolhe a Helena 🩷
                  </p>
                </div>
              )}
            </div>
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
                setMenu(true);
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
