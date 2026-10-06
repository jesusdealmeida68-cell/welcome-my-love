import { Heart } from "lucide-react";
import { useCallback, useRef, useState } from "react";

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

export function WhoIsCuterModal({ onChosen }: { onChosen?: () => void }) {
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [dodges, setDodges] = useState(0);
  const [chosen, setChosen] = useState(false);
  const jesusRef = useRef<HTMLButtonElement | null>(null);

  const dodge = useCallback(() => {
    const el = jesusRef.current;
    if (!el) return;

    // posição "natural" do botão (sem o deslocamento atual)
    const rect = el.getBoundingClientRect();
    const baseLeft = rect.left - pos.x;
    const baseTop = rect.top - pos.y;
    const margin = 12;

    const minX = margin - baseLeft;
    const maxX = window.innerWidth - margin - (baseLeft + rect.width);
    const minY = margin - baseTop;
    const maxY = window.innerHeight - margin - (baseTop + rect.height);

    // tenta várias vezes até sair longe o suficiente do ponto atual
    let next: Pos = pos;
    for (let i = 0; i < 12; i += 1) {
      const candidate = {
        x: minX + Math.random() * Math.max(0, maxX - minX),
        y: minY + Math.random() * Math.max(0, maxY - minY),
      };
      next = candidate;
      if (Math.hypot(candidate.x - pos.x, candidate.y - pos.y) > 110) break;
    }

    setPos(next);
    setDodges((count) => count + 1);
  }, [pos]);

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
                className="gate-key relative z-10 rounded-2xl px-5 py-2.5 text-base font-semibold transition-transform duration-200 ease-out"
                style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
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
                Jesus
              </button>

              <button
                type="button"
                className="gate-key rounded-2xl px-5 py-2.5 text-base font-semibold"
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
              Resposta oficial e sem recurso: a Helena. Bem-vinda, meu amor ♡
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
