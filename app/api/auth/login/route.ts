import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, signSessionToken, verifyPassword } from "@/lib/auth";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Usuário e senha são obrigatórios." }, { status: 400 });
  }

  const { username, password } = parsed.data;

  const usuario = await prisma.usuario.findUnique({ where: { username } });
  if (!usuario || !usuario.ativo) {
    return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 });
  }

  const valido = await verifyPassword(password, usuario.passwordHash);
  if (!valido) {
    return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 });
  }

  const token = await signSessionToken({ userId: usuario.id });
  await setSessionCookie(token);
  await prisma.usuario.update({ where: { id: usuario.id }, data: { ultimoLoginEm: new Date() } });

  return NextResponse.json({
    id: usuario.id,
    username: usuario.username,
    nome: usuario.nome,
  });
}
