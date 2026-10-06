import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Eye, EyeOff, Heart, Image as ImageIcon, LockKeyhole } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
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

function Index() {
  const unlock = useServerFn(unlockSite);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password.trim() || status === "loading") return;
    setStatus("loading");

    try {
      const result = await unlock({ data: { password } });
      setStatus(result.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-6 py-10 text-foreground sm:py-14">
      <Heart className="absolute left-[12%] top-[12%] size-3 rotate-[-12deg] fill-primary/25 text-primary/30" aria-hidden="true" />
      <Heart className="absolute right-[15%] top-[24%] size-2.5 rotate-12 fill-primary/20 text-primary/25" aria-hidden="true" />
      <Heart className="absolute bottom-[13%] left-[16%] size-2 fill-primary/15 text-primary/20" aria-hidden="true" />

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-sm flex-col items-center justify-center">
        <div className="relative mb-9 w-[15.5rem] rotate-[-2deg] bg-polaroid p-3 pb-12 shadow-polaroid sm:w-[17rem]">
          <div className="flex aspect-[4/5] items-center justify-center overflow-hidden bg-photo-muted">
            <ImageIcon className="size-8 stroke-[1.25] text-muted-foreground/50" aria-label="Foto a adicionar" />
          </div>
          <Heart className="absolute bottom-4 right-5 size-4 rotate-6 fill-primary/30 text-primary/40" aria-hidden="true" />
        </div>

        <section className="w-full text-center" aria-labelledby="gate-title">
          <h1 id="gate-title" className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Antes de entrar... <span aria-hidden="true">👀</span>
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            preciso ter certeza de que és tu.
          </p>

          <form className="mt-8 text-left" onSubmit={handleSubmit}>
            <label htmlFor="password" className="mb-2.5 flex items-center gap-2 text-sm font-medium">
              <LockKeyhole className="size-4 text-primary" aria-hidden="true" />
              Digita a senha
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                inputMode="numeric"
                autoComplete="current-password"
                maxLength={80}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
                className="h-13 w-full rounded-md border border-input bg-input-surface px-4 pr-12 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-ring/20"
                aria-invalid={status === "error"}
                aria-describedby="password-message"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>

            <div id="password-message" className="min-h-7 pt-2 text-sm" aria-live="polite">
              {status === "error" && <p className="text-destructive">Essa senha não parece certa. Tenta novamente.</p>}
              {status === "success" && <p className="font-medium text-success">É mesmo você. ♡</p>}
            </div>

            <Button type="submit" variant="romantic" size="wide" disabled={!password.trim() || status === "loading"}>
              {status === "loading" ? "Só um instante..." : status === "success" ? "Senha confirmada" : "Entrar"}
              {status !== "loading" && <ArrowRight aria-hidden="true" />}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
