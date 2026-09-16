export interface PontoMedicao {
  local: string;
  cloro?: number;
  ph?: number;
  turbidez?: number;
}

export interface LeituraHidrometro {
  local: string;
  leitura: number;
}

export interface ParametrosMedidos {
  pontos: PontoMedicao[];
  hidrometros: LeituraHidrometro[];
}

/** Lê os campos indexados `ponto_local_0`, `ponto_cloro_0`, `ponto_local_1`... até faltar um. */
export function lerPontosDoFormData(formData: FormData): PontoMedicao[] {
  const pontos: PontoMedicao[] = [];
  for (let i = 0; formData.has(`ponto_local_${i}`); i++) {
    const local = (formData.get(`ponto_local_${i}`) as string)?.trim();
    if (!local) continue;
    const num = (chave: string) => {
      const v = formData.get(chave);
      return v && v !== "" ? Number(v) : undefined;
    };
    pontos.push({
      local,
      cloro: num(`ponto_cloro_${i}`),
      ph: num(`ponto_ph_${i}`),
      turbidez: num(`ponto_turbidez_${i}`),
    });
  }
  return pontos;
}

export function lerHidrometrosDoFormData(formData: FormData): LeituraHidrometro[] {
  const hidrometros: LeituraHidrometro[] = [];
  for (let i = 0; formData.has(`hidro_local_${i}`); i++) {
    const local = (formData.get(`hidro_local_${i}`) as string)?.trim();
    const leituraRaw = formData.get(`hidro_leitura_${i}`);
    if (!local || !leituraRaw) continue;
    hidrometros.push({ local, leitura: Number(leituraRaw) });
  }
  return hidrometros;
}
