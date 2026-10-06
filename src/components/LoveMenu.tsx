import { ArrowLeft, CalendarHeart, Camera, Heart, Mail, Puzzle } from "lucide-react";
import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";
import { Polaroid } from "@/components/Polaroid";

// ✏️ Edita aqui -------------------------------------------------------------
// Data em que tudo começou (formato "AAAA-MM-DD"). Enquanto estiver null,
// o Calendário do Amor mostra só o mês atual, sem contador.
const LOVE_START: string | null = null;

// Fotos das Nossas Memórias (põe os ficheiros em /public e acrescenta aqui).
const MEMORIES = [
  { src: "/helena.jpg", name: "Helena", tilt: "rotate-[-3deg]" },
  { src: "/jesus.jpg", name: "Jesus", tilt: "rotate-[3deg] mt-4" },
];

const NOTES = [
  "Hoje acordei a pensar em ti. Sem motivo nenhum. Só porque sim. 🩷",
  "Se eu pudesse guardar o teu sorriso num frasco, andava com ele no bolso. 😌",
  "Tu és a razão de eu olhar para o telemóvel mais vezes do que deveria. 😂",
  "Não prometo ser perfeito, mas prometo reparar nas pequenas coisas em ti. 👀",
  "O teu nome tem um jeito de me fazer sorrir sem eu perceber. 🤭",
  "O meu dia fica melhor só porque tu existes. ✨",
  "Esta nota é secreta. Só tu e eu sabemos. 🤫",
];
// ---------------------------------------------------------------------------

type SectionId = "memories" | "calendar" | "game" | "notes";

const ITEMS: {
  id: SectionId;
  title: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
  tilt: string;
}[] = [
  {
    id: "memories",
    title: "Nossas Memórias",
    hint: "momentos guardados com carinho",
    icon: Camera,
    tilt: "-rotate-2",
  },
  {
    id: "calendar",
    title: "Calendário do Amor",
    hint: "o tempo do nosso cantinho",
    icon: CalendarHeart,
    tilt: "rotate-2",
  },
  {
    id: "game",
    title: "Jogo da Memória",
    hint: "combina os pares",
    icon: Puzzle,
    tilt: "rotate-1",
  },
  {
    id: "notes",
    title: "Notas de Amor",
    hint: "mensagens escondidas",
    icon: Mail,
    tilt: "-rotate-1",
  },
];

export function LoveMenu() {
  const [section, setSection] = useState<SectionId | null>(null);
  const current = ITEMS.find((item) => item.id === section);

  return (
    <div className="gate-bg fixed inset-0 z-50 overflow-y-auto px-5 py-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex min-h-full w-full max-w-sm flex-col items-center">
        {!current ? (
          <div className="gate-in flex w-full flex-col items-center pt-6">
            <Heart className="size-7 fill-primary text-primary" aria-hidden="true" />
            <h1 className="font-hand mt-3 text-center text-[clamp(2.2rem,7dvh,3rem)] font-bold leading-none text-primary">
              Menu do Nosso Cantinho
            </h1>
            <p className="mt-2 text-sm text-foreground/65">♡ cada clique é uma surpresa ♡</p>

            <div className="mt-8 grid w-full grid-cols-2 gap-4">
              {ITEMS.map(({ id, title, hint, icon: Icon, tilt }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSection(id)}
                  className={`${tilt} flex flex-col items-center rounded-2xl bg-white/90 px-3 py-5 text-center shadow-polaroid transition-transform active:scale-95`}
                >
                  <span className="grid size-14 place-items-center rounded-full bg-primary/12 text-primary">
                    <Icon className="size-7" />
                  </span>
                  <span className="font-hand mt-3 text-[1.2rem] font-bold leading-tight text-foreground/85">
                    {title}
                  </span>
                  <span className="mt-1 text-[0.7rem] leading-snug text-foreground/60">{hint}</span>
                  <Heart className="mt-2 size-3.5 text-primary/60" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <section
            className="gate-in flex w-full flex-1 flex-col items-center pb-6"
            key={current.id}
          >
            <div className="flex w-full items-center">
              <button
                type="button"
                onClick={() => setSection(null)}
                className="gate-key inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Voltar
              </button>
            </div>
            <h2 className="font-hand mt-5 text-center text-[2.2rem] font-bold leading-none text-primary">
              {current.title}
            </h2>

            <div className="mt-6 flex w-full flex-1 flex-col items-center">
              {current.id === "memories" && <Memories />}
              {current.id === "calendar" && <LoveCalendar />}
              {current.id === "game" && <MemoryGame />}
              {current.id === "notes" && <LoveNotes />}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Memories() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-5">
      {MEMORIES.map((memory) => (
        <Polaroid
          key={memory.src}
          src={memory.src}
          alt={`Foto de ${memory.name}`}
          name={memory.name}
          tilt={memory.tilt}
        />
      ))}
    </div>
  );
}

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

function LoveCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const monthLabel = today.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });

  let daysTogether: number | null = null;
  if (LOVE_START) {
    const start = new Date(`${LOVE_START}T00:00:00`);
    const diff = Math.floor((today.getTime() - start.getTime()) / 86_400_000);
    if (!Number.isNaN(diff) && diff >= 0) daysTogether = diff;
  }

  return (
    <div className="flex w-full flex-col items-center">
      {daysTogether !== null && (
        <div className="mb-5 rounded-2xl bg-white/90 px-6 py-4 text-center shadow-polaroid">
          <p className="font-hand text-5xl font-bold leading-none text-primary">{daysTogether}</p>
          <p className="mt-1 text-xs text-foreground/65">dias de carinho ❤️</p>
        </div>
      )}

      <div className="w-full rounded-2xl bg-white/90 p-4 shadow-polaroid">
        <p className="font-hand mb-3 text-center text-2xl font-bold capitalize text-foreground/85">
          {monthLabel}
        </p>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {WEEKDAYS.map((d, i) => (
            <span key={i} className="py-1 font-semibold text-primary/70">
              {d}
            </span>
          ))}
          {cells.map((day, i) => (
            <span
              key={i}
              className={
                day === today.getDate()
                  ? "grid aspect-square place-items-center rounded-full bg-primary font-bold text-primary-foreground"
                  : "grid aspect-square place-items-center text-foreground/70"
              }
            >
              {day}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-foreground/65">
        Hoje é um ótimo dia para sorrir 🩷
      </p>
    </div>
  );
}

const EMOJIS = ["🩷", "🌹", "🍫", "🧸", "💌", "✨"];

type Card = { id: number; emoji: string; flipped: boolean; matched: boolean };

function shuffled(): Card[] {
  const deck = [...EMOJIS, ...EMOJIS].map((emoji, id) => ({
    id,
    emoji,
    flipped: false,
    matched: false,
  }));
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = deck[i];
    const b = deck[j];
    if (a && b) {
      deck[i] = b;
      deck[j] = a;
    }
  }
  return deck;
}

function MemoryGame() {
  const [cards, setCards] = useState<Card[]>(shuffled);
  const [moves, setMoves] = useState(0);
  const lock = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const won = cards.every((card) => card.matched);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const flip = (id: number) => {
    if (lock.current) return;
    const target = cards.find((card) => card.id === id);
    if (!target || target.flipped || target.matched) return;

    const next = cards.map((card) => (card.id === id ? { ...card, flipped: true } : card));
    setCards(next);

    const open = next.filter((card) => card.flipped && !card.matched);
    if (open.length < 2) return;

    setMoves((count) => count + 1);
    lock.current = true;
    const isMatch = open[0]?.emoji === open[1]?.emoji;
    timer.current = setTimeout(
      () => {
        setCards((prev) =>
          prev.map((card) =>
            card.flipped && !card.matched
              ? isMatch
                ? { ...card, matched: true }
                : { ...card, flipped: false }
              : card,
          ),
        );
        lock.current = false;
      },
      isMatch ? 350 : 800,
    );
  };

  const restart = () => {
    if (timer.current) clearTimeout(timer.current);
    lock.current = false;
    setCards(shuffled());
    setMoves(0);
  };

  return (
    <div className="flex w-full flex-col items-center">
      <p className="mb-4 text-sm text-foreground/65">Jogadas: {moves}</p>
      <div className="grid w-full grid-cols-4 gap-2.5">
        {cards.map((card) => {
          const visible = card.flipped || card.matched;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flip(card.id)}
              aria-label={visible ? card.emoji : "Carta virada"}
              className={`grid aspect-square place-items-center rounded-xl text-3xl shadow-polaroid transition-all duration-300 ${
                visible ? "bg-white" : "bg-primary"
              } ${card.matched ? "opacity-70" : ""}`}
            >
              {visible ? (
                card.emoji
              ) : (
                <Heart className="size-5 fill-white/80 text-white/80" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {won && (
        <div className="gate-in mt-5 text-center">
          <p className="font-hand text-3xl font-bold text-primary">Conseguiste! 🥰</p>
          <p className="mt-1 text-sm text-foreground/70">Em {moves} jogadas. Boa memória!</p>
        </div>
      )}
      <button
        type="button"
        onClick={restart}
        className="gate-key mt-5 rounded-xl px-5 py-2 text-sm font-semibold"
      >
        Jogar de novo
      </button>
    </div>
  );
}

function LoveNotes() {
  const [index, setIndex] = useState<number | null>(null);
  const [opens, setOpens] = useState(0);

  const openNote = () => {
    setIndex((prev) => {
      let next = Math.floor(Math.random() * NOTES.length);
      if (NOTES.length > 1 && next === prev) next = (next + 1) % NOTES.length;
      return next;
    });
    setOpens((count) => count + 1);
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div className="grid min-h-44 w-full place-items-center rounded-2xl bg-white/90 p-6 text-center shadow-polaroid">
        {index === null ? (
          <div className="flex flex-col items-center gap-2">
            <Mail className="size-10 text-primary" aria-hidden="true" />
            <p className="text-sm text-foreground/65">Há mensagens escondidas aqui dentro…</p>
          </div>
        ) : (
          <p
            key={opens}
            className="gate-in font-hand text-[1.5rem] leading-snug text-foreground/85"
          >
            {NOTES[index]}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={openNote}
        className="gate-key mt-6 rounded-2xl px-7 py-3 text-sm font-bold tracking-[0.12em]"
      >
        {index === null ? "ABRIR UMA NOTA" : "OUTRA NOTA"}
      </button>
    </div>
  );
}
