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

const PASSWORD_LENGTH = 6;
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
  const clearing = useRef(false);

  useEffect(() => {
    return () => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
    };
  }, []);

  const addDigit = useCallback((digit: string) => {
    if (clearing.current) return;
    setStatus((current) => (current === "loading" || current === "success" ? current : "idle"));
    setPassword((current) => (current.length >= PASSWORD_LENGTH ? current : current + digit));
  }, []);

  const removeDigit = useCallback(() => {
    if (clearing.current) return;
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
    clearing.current = true;
    clearTimer.current = setTimeout(() => {
      clearing.current = false;
      setPassword("");
    }, 450);
  }, [password, status, unlock]);

  // entra sozinho assim que o último número é digitado
  useEffect(() => {
    if (password.length === PASSWORD_LENGTH && status === "idle") void submit();
  }, [password, status, submit]);

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
  const dotCount = PASSWORD_LENGTH;

  return (
    <main className="gate-bg flex h-dvh items-center justify-center overflow-hidden px-6 py-[max(1rem,env(safe-area-inset-top))]">
      <div className="gate-in flex w-full max-w-xs flex-col items-center">
        <figure className="relative w-[clamp(7rem,23dvh,13rem)] rotate-[-2.5deg] bg-polaroid p-2.5 pb-[clamp(1.75rem,4.6dvh,2.5rem)] shadow-polaroid">
          <img
            src="/foto.jpg"
            alt="A nossa foto"
            width={900}
            height={1125}
            className="aspect-[4/5] w-full object-cover"
          />
          <Heart
            className="absolute bottom-[clamp(0.55rem,1.4dvh,0.8rem)] left-1/2 size-4 -translate-x-1/2 fill-transparent text-foreground/55"
            aria-hidden="true"
          />
        </figure>

        <section
          className="mt-[clamp(0.9rem,3dvh,1.75rem)] w-full text-center"
          aria-labelledby="gate-title"
        >
          <h1
            id="gate-title"
            className="font-hand text-[clamp(2rem,5.4dvh,2.5rem)] font-bold leading-none text-primary"
          >
            Minha Senha
          </h1>

          <div
            key={shakeKey}
            className={`gate-pill mx-auto mt-[clamp(0.6rem,2dvh,1.25rem)] flex h-[clamp(2.6rem,6.4dvh,3.1rem)] w-full max-w-[19rem] items-center gap-3 rounded-xl px-4 ${shakeKey > 0 && status === "error" ? "gate-shake" : ""}`}
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

          <div
            className="grid h-[clamp(2rem,4.8dvh,2.75rem)] place-items-center text-xs sm:text-sm"
            aria-live="polite"
          >
            {status === "error" && (
              <p className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-destructive sm:text-sm shadow-sm">
                Hmm… acho que você não é a pessoa indicada 🥰
              </p>
            )}
            {status === "success" && (
              <p className="rounded-full bg-white/85 px-3 py-1 font-semibold text-success shadow-sm">
                É mesmo você. ♡
              </p>
            )}
          </div>

          <div className="mx-auto grid w-full max-w-[19rem] grid-cols-3 gap-x-[clamp(0.75rem,3.4vw,1.1rem)] gap-y-[clamp(0.45rem,1.5dvh,0.85rem)]">
            {DIGIT_ROWS.flat().map((digit) => (
              <button
                key={digit}
                type="button"
                className="gate-key h-[clamp(2.9rem,7.6dvh,3.9rem)] rounded-2xl text-2xl font-semibold tabular-nums disabled:opacity-60"
                onClick={() => addDigit(digit)}
                disabled={locked}
                aria-label={digit}
              >
                {digit}
              </button>
            ))}

            <span aria-hidden="true" />
            <button
              type="button"
              className="gate-key h-[clamp(2.9rem,7.6dvh,3.9rem)] rounded-2xl text-2xl font-semibold tabular-nums disabled:opacity-60"
              onClick={() => addDigit("0")}
              disabled={locked}
              aria-label="0"
            >
              0
            </button>
            <button
              type="button"
              className="gate-key grid h-[clamp(2.9rem,7.6dvh,3.9rem)] place-items-center rounded-2xl disabled:opacity-60"
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
