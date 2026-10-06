import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Delete, Heart, LockKeyhole } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { unlockSite } from "@/lib/gate.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Minha Senha" },
      { name: "description", content: "Um espaço privado, preparado com carinho." },
      { property: "og:title", content: "Minha Senha" },
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
    <main className="gate-bg relative min-h-dvh overflow-x-hidden px-6 pb-10 pt-8 text-foreground">
      <Heart
        className="absolute left-[9%] top-[6%] size-3 rotate-[-12deg] fill-white/40 text-white/60"
        aria-hidden="true"
      />
      <Heart
        className="absolute right-[10%] top-[14%] size-2.5 rotate-12 fill-white/35 text-white/55"
        aria-hidden="true"
      />
      <Heart
        className="absolute bottom-[5%] left-[8%] size-2 fill-white/35 text-white/55"
        aria-hidden="true"
      />

      <div className="mx-auto flex w-full max-w-xs flex-col items-center">
        <figure className="relative w-[10.75rem] rotate-[-3deg] bg-polaroid p-2.5 pb-9 shadow-polaroid sm:w-[12rem]">
          <img
            src="/foto.jpg"
            alt="A nossa foto"
            width={900}
            height={1125}
            className="aspect-[4/5] w-full object-cover"
          />
          <Heart
            className="absolute bottom-3 left-1/2 size-4 -translate-x-1/2 fill-transparent text-foreground/60"
            aria-hidden="true"
          />
        </figure>

        <section className="mt-6 w-full text-center" aria-labelledby="gate-title">
          <h1 id="gate-title" className="font-hand text-4xl font-bold leading-none text-primary">
            Minha Senha
          </h1>

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

          <div className="min-h-12 pt-2 text-sm" aria-live="polite">
            {status === "error" && (
              <p className="font-medium text-destructive">
                Hmm… acho que você não é a pessoa indicada 🥰
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
      </div>
    </main>
  );
}
