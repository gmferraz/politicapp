const CORES_PARTIDO: Record<string, string> = {
  PT: "#C4122D",
  PL: "#1B3F94",
  UNIÃO: "#0B3A6B",
  PP: "#1E5FA8",
  "REPUBLICANOS": "#1D5C8C",
  PSD: "#F0A500",
  MDB: "#0F9B4C",
  PSDB: "#0080C8",
  PDT: "#E52521",
  PSB: "#F2C300",
  PSOL: "#8B1E3F",
  PCDOB: "#A31621",
  PODE: "#1FA05A",
  PV: "#4CA64C",
  REDE: "#2FA69B",
  NOVO: "#F26522",
  CIDADANIA: "#E4007C",
  AVANTE: "#00A0DF",
  SOLIDARIEDADE: "#E96A1E",
  PRD: "#4A5568",
  PMB: "#7A5195",
  DC: "#2C5F2D",
  AGIR: "#5B6C8F",
  MOBILIZA: "#00857C",
}

const CINZA = "#8A8A8E"

export const corDoPartido = (partido: string) =>
  CORES_PARTIDO[partido.trim().toLocaleUpperCase("pt-BR")] ?? CINZA
