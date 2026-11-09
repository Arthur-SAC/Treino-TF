import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { db } from "../lib/db";
import { getSetting, setSetting } from "../lib/settings-helpers";
import { estadoSequencia, deveMostrarQueda, type EstadoSequencia } from "../lib/sequencia";
import { proximaParte, type ProximaParte } from "../lib/proxima-parte";
import { hojeISO } from "../lib/today-date";
import { PlacaVitoria } from "../components/placas/PlacaVitoria";
import { PlacaQueda } from "../components/placas/PlacaQueda";

export type PlacaDados =
  | { tipo: "vitoria"; treino: string; de: number; para: number; parte: ProximaParte }
  | { tipo: "queda"; de: number; diasPerdidos: number; parte: ProximaParte }
  | { tipo: "desbloqueio"; titulo: string; entra: string; praQue: string; minutos: number; horario: string | null }
  | { tipo: "conquista"; titulo: string; texto: string };

interface PlacasApi {
  mostrar(p: PlacaDados): void;
}

// Sem provider (testes que montam uma tela solta), mostrar não faz nada.
const PlacasContext = createContext<PlacasApi>({ mostrar: () => {} });

export function usePlacas(): PlacasApi {
  return useContext(PlacasContext);
}

/** Estado da sequência hoje e sem o treino de hoje (o "de" da vitória), mais a
 *  próxima parte. Lê workoutSessions e settings. */
export async function dadosDaSequencia(
  hoje: string,
): Promise<{ estado: EstadoSequencia; semHoje: EstadoSequencia; parte: ProximaParte }> {
  const sessoes = await db.workoutSessions.toArray();
  const datas = [...new Set(sessoes.map((s) => s.date))];
  const desde = await getSetting("sequenciaDesde");
  const activeCycle = await getSetting("activeCycle");
  const cycleStart = await getSetting("cycleStartSessionCount");
  return {
    estado: estadoSequencia(datas, desde, hoje),
    semHoje: estadoSequencia(datas.filter((d) => d !== hoje), desde, hoje),
    parte: proximaParte(activeCycle, sessoes.length, cycleStart),
  };
}

/** Ao abrir o app: se uma quebra nova aconteceu, grava que foi vista ANTES de
 *  mostrar (garante uma vez só, mesmo se o app fechar com a placa aberta). */
async function verificarAoAbrir(mostrar: (p: PlacaDados) => void): Promise<void> {
  const { estado, parte } = await dadosDaSequencia(hojeISO());
  const vista = await getSetting("quedaVistaEm");
  if (!deveMostrarQueda(estado, vista) || estado.quebra === null) return;
  await setSetting("quedaVistaEm", estado.quebra);
  mostrar({ tipo: "queda", de: estado.anterior, diasPerdidos: estado.diasPerdidos, parte });
}

interface NaFila {
  id: number;
  dados: PlacaDados;
}

/** Fila de placas: uma por vez, a próxima ao fechar. Renderiza a placa logo
 *  depois dos filhos — no App, como irmã do <main>. */
export function PlacasProvider({ children }: { children: ReactNode }) {
  const [fila, setFila] = useState<NaFila[]>([]);
  const proximoId = useRef(0);
  const verificou = useRef(false);

  const mostrar = useCallback((dados: PlacaDados) => {
    proximoId.current += 1;
    const id = proximoId.current;
    setFila((f) => [...f, { id, dados }]);
  }, []);
  const fechar = useCallback(() => setFila((f) => f.slice(1)), []);

  useEffect(() => {
    // StrictMode roda o efeito duas vezes; a verificação é uma por abertura.
    if (verificou.current) return;
    verificou.current = true;
    // Se o banco falhar (ou fechar no meio), só não aparece placa: a abertura
    // do app não pode quebrar por causa dela.
    verificarAoAbrir(mostrar).catch(() => {});
  }, [mostrar]);

  const api = useMemo(() => ({ mostrar }), [mostrar]);
  const atual = fila[0];

  return (
    <PlacasContext.Provider value={api}>
      {children}
      {atual && <PlacaAtual key={atual.id} dados={atual.dados} onFechar={fechar} />}
    </PlacasContext.Provider>
  );
}

function PlacaAtual({ dados, onFechar }: { dados: PlacaDados; onFechar: () => void }) {
  // Desbloqueio e conquista são desenhados na Task 10; até lá não travam a fila.
  // O ref segura o StrictMode, que rodaria o efeito duas vezes e pularia duas.
  const semDesenho = dados.tipo === "desbloqueio" || dados.tipo === "conquista";
  const pulou = useRef(false);
  useEffect(() => {
    if (!semDesenho || pulou.current) return;
    pulou.current = true;
    onFechar();
  }, [semDesenho, onFechar]);

  if (dados.tipo === "vitoria") {
    return <PlacaVitoria treino={dados.treino} de={dados.de} para={dados.para} parte={dados.parte} onFechar={onFechar} />;
  }
  if (dados.tipo === "queda") {
    return <PlacaQueda de={dados.de} diasPerdidos={dados.diasPerdidos} parte={dados.parte} onFechar={onFechar} />;
  }
  return null;
}
