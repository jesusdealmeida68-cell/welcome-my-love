import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";
import { redirect } from "@tanstack/react-router";

type GateSession = { unlocked?: boolean };

const passwordSchema = z.object({
  password: z.string().trim().min(1).max(80),
});

function getSessionConfig() {
  const secret = process.env["SESSION_SECRET"];
  if (!secret) throw new Error("SESSION_SECRET is not configured");

  return {
    password: secret,
    name: "private-gate",
    maxAge: 60 * 60 * 24 * 7,
    cookie: {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

async function passwordsMatch(input: string, expected: string) {
  const encoder = new TextEncoder();
  const [inputDigest, expectedDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(input)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const inputBytes = new Uint8Array(inputDigest);
  const expectedBytes = new Uint8Array(expectedDigest);
  let difference = 0;
  for (let index = 0; index < inputBytes.length; index += 1) {
    difference |= (inputBytes[index] ?? 0) ^ (expectedBytes[index] ?? 0);
  }
  return difference === 0;
}

export const unlockSite = createServerFn({ method: "POST" })
  .inputValidator((data) => passwordSchema.parse(data))
  .handler(async ({ data }) => {
    const expected = process.env["SITE_PASSWORD"];
    if (!expected) throw new Error("SITE_PASSWORD is not configured");

    if (!(await passwordsMatch(data.password, expected))) {
      return { ok: false as const };
    }

    const session = await useSession<GateSession>(getSessionConfig());
    await session.update({ unlocked: true });
    const music = await import("@/assets/turning-page-piano.m4a.asset.json");
    return { ok: true as const, music: music.default.url };
  });

export const getLoveLetter = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<GateSession>(getSessionConfig());
  if (!session.data.unlocked) throw redirect({ to: "/" });
  const [portrait, smile, garden, music] = await Promise.all([
    import("@/assets/helena-retrato.jpg.asset.json"),
    import("@/assets/helena-sorriso.jpg.asset.json"),
    import("@/assets/helena-jardim.jpg.asset.json"),
    import("@/assets/turning-page-piano.m4a.asset.json"),
  ]);
  return {
    photos: [portrait.default.url, smile.default.url, garden.default.url],
    music: music.default.url,
    poem: `No dia que te conheci,
o mundo não fez silêncio.
O sol nasceu,
as pessoas correram,
os carros atravessaram as ruas
e a vida continuou sem saber
que alguém estava prestes a se tornar
uma das minhas histórias favoritas.

Você chegou sem chegar.
Primeiro foi uma voz,
depois uma conversa,
depois aquele sorriso que apareceu em mim
sem que eu tivesse pedido.

Ainda não sabia o teu nome
dentro do meu coração.
Você era só alguém. 8

E talvez seja assim
que as pessoas mais importantes chegam:
sem avisar que vão ficar.

Eu não sabia que aquela conversa
seria lembrança.
Não sabia que a tua maneira de falar
ficaria presa em algum lugar da minha memória.
Não sabia que, entre tantas pessoas
que o mundo colocou no meu caminho,
eu encontraria você.

Naquele dia,
nada mudou lá fora.
Mas alguma coisa mudou em mim.

E hoje penso:
talvez alguns encontros
não aconteçam para mudar o mundo.
Apenas para mudar
o nosso mundo.

E você mudou o meu.`,
  };
});