import { mkdir, unlink, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put, del } from "@vercel/blob";

// Na Vercel o filesystem é somente-leitura/efêmero, então anexos vivem no Vercel Blob lá
// (BLOB_READ_WRITE_TOKEN é injetado automaticamente quando um Blob store é conectado ao projeto).
// Localmente (sem token), cai para disco em storage/attachments — assim `npm run dev` funciona
// sem depender da nuvem. Mesmo padrão do projeto IMETAL.
const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const STORAGE_ROOT = path.join(process.cwd(), "storage", "attachments");

function entidadeDir(entidadeTipo: string, entidadeId: number): string {
  return path.join(/*turbopackIgnore: true*/ STORAGE_ROOT, entidadeTipo, String(entidadeId));
}

/** Gera um nome de arquivo seguro para filesystem, sem permitir path traversal. */
function safeStoredName(originalName: string): string {
  const ext = path.extname(originalName).replace(/[^a-zA-Z0-9.]/g, "").slice(0, 10);
  return `${randomUUID()}${ext}`;
}

/** Checagem de contenção real — startsWith puro aceitaria erroneamente um diretório irmão. */
function isWithinStorageRoot(fullPath: string): boolean {
  return fullPath === STORAGE_ROOT || fullPath.startsWith(STORAGE_ROOT + path.sep);
}

/**
 * Retorna um identificador opaco do arquivo salvo — caminho relativo em disco no modo local,
 * ou a URL do Blob no modo Blob. Quem chama deve sempre passar por readAttachmentFile /
 * deleteAttachmentFile em vez de interpretar esse valor diretamente.
 */
export async function saveAttachmentFile(
  entidadeTipo: string,
  entidadeId: number,
  originalName: string,
  bytes: Buffer
): Promise<string> {
  if (USE_BLOB) {
    const blob = await put(`${entidadeTipo}/${entidadeId}/${safeStoredName(originalName)}`, bytes, {
      access: "public",
      addRandomSuffix: true,
    });
    return blob.url;
  }

  const dir = entidadeDir(entidadeTipo, entidadeId);
  await mkdir(dir, { recursive: true });
  const storedName = safeStoredName(originalName);
  const fullPath = path.join(/*turbopackIgnore: true*/ dir, storedName);
  await writeFile(fullPath, bytes);
  return path.join(entidadeTipo, String(entidadeId), storedName);
}

/**
 * Lê o arquivo de volta através do próprio servidor — mesmo no modo Blob, nunca entregamos a
 * URL pública ao cliente diretamente. A checagem de permissão fica inteira na rota que chama isso.
 */
export async function readAttachmentFile(storedPath: string): Promise<Buffer> {
  if (storedPath.startsWith("http://") || storedPath.startsWith("https://")) {
    const res = await fetch(storedPath);
    if (!res.ok) throw new Error("Não foi possível ler o anexo do armazenamento.");
    return Buffer.from(await res.arrayBuffer());
  }

  const fullPath = path.join(/*turbopackIgnore: true*/ STORAGE_ROOT, storedPath);
  if (!isWithinStorageRoot(fullPath)) {
    throw new Error("Caminho de anexo inválido.");
  }
  return readFile(fullPath);
}

export async function deleteAttachmentFile(storedPath: string): Promise<void> {
  if (storedPath.startsWith("http://") || storedPath.startsWith("https://")) {
    await del(storedPath).catch(() => undefined);
    return;
  }

  const fullPath = path.join(/*turbopackIgnore: true*/ STORAGE_ROOT, storedPath);
  if (!isWithinStorageRoot(fullPath)) return;
  await unlink(fullPath).catch(() => undefined);
}
