import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { z } from "zod";

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
    return { ok: true as const };
  });