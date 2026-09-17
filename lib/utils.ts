import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Normaliza um nome pra comparação — maiúsculo, sem acento, sem espaço/hífen. Usada só pra
 * SUGERIR a matéria-prima mais parecida num select; quem confirma a escolha é sempre a pessoa. */
export function chaveNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[\s\-]+/g, "");
}
