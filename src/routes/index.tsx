import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Delete, Heart, LockKeyhole } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { unlockSite } from "@/lib/gate.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Antes de entrar…" },
      { name: "description", content: "Um espaço privado, preparado com carinho." },
      { property: "og:title", content: "Antes de entrar…" },
      { property: "og:description", content: "Um espaço privado, preparado com carinho." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const MIN_DOTS = 6;
const MAX_DIGITS = 12;
const DIGIT_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
];

type Status = "idle" | "loading" | "error" | "success";

function Index() {
  const unlock = useServerFn(unlockSite);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [shakeKey, setShakeKey] = useState(0);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
    };
  }, []);

  const addDigit = useCallback((digit: string) => {
    setStatus((current) => (current === "loading" || current === "success" ? current : "idle"));
    setPassword((current) => (current.length >= MAX_DIGITS ? current : current + digit));
  }, []);

  const removeDigit = useCallback(() => {
    setStatus((current) => (current === "loading" || current === "success" ? current : "idle"));
    setPassword((current) => current.slice(0, -1));
  }, []);

  const submit = useCallback(async () => {
    if (!password || status === "loading" || status === "success") return;
    setStatus("loading");

    try {
      const result = await unlock({ data: { password } });
      if (result.ok) {
        setStatus("success");
        return;
      }
    } catch {
      // cai no estado de erro abaixo
    }

    setStatus("error");
    setShakeKey((key) => key + 1);
    clearTimer.current = setTimeout(() => setPassword(""), 450);
  }, [password, status, unlock]);

  // teclado físico (computador): números, apagar e Enter
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (/^\d$/.test(event.key)) addDigit(event.key);
      else if (event.key === "Backspace") removeDigit();
      else if (event.key === "Enter") void submit();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [addDigit, removeDigit, submit]);

  const locked = status === "loading" || status === "success";
  const dotCount = Math.max(MIN_DOTS, password.length);

  return (
    <main className="gate-bg relative min-h-dvh overflow-x-hidden px-6 pb-12 pt-8 text-foreground">
      <Heart
        className="absolute left-[9%] top-[7%] size-3 rotate-[-12deg] fill-primary/25 text-primary/30"
        aria-hidden="true"
      />
      <Heart
        className="absolute right-[10%] top-[16%] size-2.5 rotate-12 fill-primary/20 text-primary/25"
        aria-hidden="true"
      />
      <Heart
        className="absolute bottom-[6%] right-[8%] size-2 fill-primary/20 text-primary/25"
        aria-hidden="true"
      />

      <div className="mx-auto flex w-full max-w-xs flex-col items-center">
        <Bow className="h-14 w-16 drop-shadow-sm" />

        <section className="mt-2 w-full text-center" aria-labelledby="gate-title">
          <h1 id="gate-title" className="font-hand text-4xl font-bold leading-none text-primary">
            Minha Senha
          </h1>
          <p className="mt-1.5 text-sm text-foreground/65">uma data especial para nós</p>

          <div
            key={shakeKey}
            className={`gate-pill mx-auto mt-5 flex h-12 w-full items-center gap-3 rounded-xl px-4 ${shakeKey > 0 && status === "error" ? "gate-shake" : ""}`}
            role="group"
            aria-label={`Senha: ${password.length} dígitos`}
          >
            <LockKeyhole className="size-4 shrink-0 text-white/70" aria-hidden="true" />
            <div className="flex flex-1 items-center justify-center gap-2" aria-hidden="true">
              {Array.from({ length: dotCount }, (_, index) => (
                <span
                  key={index}
                  className={`size-2.5 rounded-full transition-colors ${index < password.length ? "bg-white" : "bg-white/25"}`}
                />
              ))}
            </div>
            <span className="size-4 shrink-0" aria-hidden="true" />
          </div>

          <div className="min-h-6 pt-2 text-sm" aria-live="polite">
            {status === "error" && (
              <p className="font-medium text-destructive">
                Essa senha não parece certa. Tenta novamente.
              </p>
            )}
            {status === "success" && <p className="font-medium text-success">É mesmo você. ♡</p>}
          </div>

          <div className="mx-auto mt-1 grid w-full max-w-[17rem] grid-cols-3 gap-x-4 gap-y-3">
            {DIGIT_ROWS.flat().map((digit) => (
              <button
                key={digit}
                type="button"
                className="gate-key h-11 rounded-xl text-xl font-semibold disabled:opacity-60"
                onClick={() => addDigit(digit)}
                disabled={locked}
                aria-label={digit}
              >
                {digit}
              </button>
            ))}

            <button
              type="button"
              className="gate-key gate-key-action grid h-11 place-items-center rounded-xl disabled:opacity-60"
              onClick={() => void submit()}
              disabled={!password || locked}
              aria-label="Entrar"
            >
              <Heart className="size-5 fill-current" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="gate-key h-11 rounded-xl text-xl font-semibold disabled:opacity-60"
              onClick={() => addDigit("0")}
              disabled={locked}
              aria-label="0"
            >
              0
            </button>
            <button
              type="button"
              className="gate-key grid h-11 place-items-center rounded-xl disabled:opacity-60"
              onClick={removeDigit}
              disabled={!password || locked}
              aria-label="Apagar"
            >
              <Delete className="size-5" aria-hidden="true" />
            </button>
          </div>
        </section>

        <figure className="relative mt-8 w-[12rem] rotate-[-3deg] bg-polaroid p-2.5 pb-11 shadow-polaroid sm:w-[13rem]">
          <img
            src="/foto.jpg"
            alt="A nossa foto"
            width={900}
            height={1125}
            className="aspect-[4/5] w-full object-cover"
          />
          <figcaption className="absolute inset-x-0 bottom-2.5 flex items-center justify-center gap-1.5 font-hand text-xl leading-none text-foreground/75">
            Eu te amo
            <Heart className="size-3.5 fill-transparent text-primary/70" aria-hidden="true" />
          </figcaption>
        </figure>
      </div>
    </main>
  );
}

function Bow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 56" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="bow-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.82 0.12 352)" />
          <stop offset="1" stopColor="oklch(0.66 0.17 355)" />
        </linearGradient>
      </defs>
      <path d="M30 28 C20 6 2 6 3 22 C4 36 18 42 30 30 Z" fill="url(#bow-grad)" />
      <path d="M34 28 C44 6 62 6 61 22 C60 36 46 42 34 30 Z" fill="url(#bow-grad)" />
      <path d="M29 33 L19 52 L28 47 L31 55 L33 35 Z" fill="url(#bow-grad)" opacity="0.9" />
      <path d="M35 33 L45 52 L36 47 L33 55 L31 35 Z" fill="url(#bow-grad)" opacity="0.9" />
      <path d="M12 16 C16 14 22 18 26 26" fill="none" stroke="white" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M52 16 C48 14 42 18 38 26" fill="none" stroke="white" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="32" cy="29" rx="6" ry="7" fill="oklch(0.6 0.18 355)" />
      <ellipse cx="30.5" cy="26.5" rx="2" ry="3" fill="white" fillOpacity="0.35" />
    </svg>
  );
}
