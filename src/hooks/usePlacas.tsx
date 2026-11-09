import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { db } from "../lib/db";
import { getSetting, setSetting, type Settings } from "../lib/settings-helpers";
import { estadoSequencia, deveMostrarQueda, type EstadoSequencia } from "../lib/sequencia";
import { proximaParte, type ProximaParte } from "../lib/proxima-parte";
import { hojeISO, diaDoAno } from "../lib/today-date";
import { novosDesbloqueios, tempoDoDesbloqueio, type Desbloqueio } from "../lib/desbloqueios";
import { buildDayRoutine } from "../lib/today-routine";
import { contarPraticasFlex } from "../lib/practice-log-helpers";
import { marcosDeCinturaAtingidos, idDoMarcoCintura } from "../lib/conquistas";
import { textoMarcoCintura } from "../lib/placas-texto";
import { PlacaVitoria } from "../components/placas/PlacaVitoria";
import { PlacaQueda } from "../components/placas/PlacaQueda";
import { PlacaConquista, PlacaDesbloqueio } from "../components/placas/PlacaDesbloqueio";

export type PlacaDados =
  | { tipo: "vitoria"; treino: string; de: number; para: number; parte: ProximaParte; fimDeSemana?: boolean }
  | { tipo: "queda"; de: number; diasPerdidos: number; quebra: string; parte: ProximaParte }
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

/** Grava em `desbloqueios` o que a sequência acabou de abrir, com data = hoje,
 *  e devolve só os novos, na ordem da tabela. Nunca tira chave (save point). */
export async function aplicarDesbloqueios(sequencia: number, hoje: string): Promise<Desbloqueio[]> {
  // Ler e gravar numa transação só: o "Finalizar" e o visibilitychange podem
  // chegar juntos, e sem ela os dois liam o mesmo `ja` e devolviam os mesmos
  // novos — duas placas de "Parabéns" pro mesmo desbloqueio. Transações rw na
  // mesma tabela rodam uma depois da outra; a segunda já vê a gravação.
  return db.transaction("rw", db.settings, async () => {
    const ja = await getSetting("desbloqueios");
    const novos = novosDesbloqueios(sequencia, ja);
    if (novos.length === 0) return [];
    await setSetting("desbloqueios", { ...ja, ...Object.fromEntries(novos.map((d) => [d.id, hoje])) });
    return novos;
  });
}

/** Lê, e se a leitura falhar devolve o reserva: a placa sai com o horário e os
 *  minutos da tabela, mas sai. */
async function ouReserva<T>(ler: () => Promise<T>, reserva: T): Promise<T> {
  try {
    return await ler();
  } catch {
    return reserva;
  }
}

/** "YYYY-MM-DD" -> Date na meia-noite LOCAL (dia da semana e do ano certos). */
function diaLocal(iso: string): Date {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d);
}

/** Uma placa por desbloqueio novo, com o horário e os minutos do dia dela
 *  (modo das caminhadas, ajustes de /hoje/horarios, fase do alongamento). O
 *  desbloqueio já foi gravado quando isto roda: se uma leitura falhar, a placa
 *  cai no horário e nos minutos fixos da tabela — o "Parabéns" nunca se perde. */
export async function placasDeDesbloqueio(novos: readonly Desbloqueio[], hoje: string): Promise<PlacaDados[]> {
  if (novos.length === 0) return [];
  const dia = diaLocal(hoje);
  const modo = await ouReserva<Settings["modoCaminhada"] | null>(() => getSetting("modoCaminhada"), null);
  const horarios = await ouReserva<Settings["routineTimes"]>(() => getSetting("routineTimes"), {});
  const praticasManha = await ouReserva<number | null>(() => contarPraticasFlex("manha"), null);
  const tabela = (d: Desbloqueio) => ({ minutos: d.minutos, horario: d.horario });
  return novos.map((d): PlacaDados => {
    let tempo = tabela(d);
    if (modo !== null && praticasManha !== null) {
      try {
        tempo = tempoDoDesbloqueio(d, buildDayRoutine(dia.getDay(), diaDoAno(dia), [], modo), horarios, praticasManha);
      } catch {
        // fica o da tabela
      }
    }
    return { tipo: "desbloqueio", titulo: d.titulo, entra: d.entra, praQue: d.praQue, ...tempo };
  });
}

/** Aplica os desbloqueios da sequência e devolve as placas deles. */
export async function desbloquearComPlacas(sequencia: number, hoje: string): Promise<PlacaDados[]> {
  return placasDeDesbloqueio(await aplicarDesbloqueios(sequencia, hoje), hoje);
}

/** Marcos de cintura batidos e ainda não vistos: grava em `conquistasVistas`
 *  ANTES de devolver (uma vez só, mesmo se o app fechar com a placa aberta). */
async function conquistasNovas(): Promise<PlacaDados[]> {
  const medidas = await db.measurements.toArray();
  const vistas = await getSetting("conquistasVistas");
  const novos = marcosDeCinturaAtingidos(medidas).filter((m) => !vistas.includes(idDoMarcoCintura(m.cinturaCm)));
  if (novos.length === 0) return [];
  await setSetting("conquistasVistas", [...vistas, ...novos.map((m) => idDoMarcoCintura(m.cinturaCm))]);
  return novos.map((m): PlacaDados => ({ tipo: "conquista", titulo: m.titulo, texto: textoMarcoCintura(m.data) }));
}

/** Ao abrir (ou voltar pro) app, nesta ordem: queda, desbloqueios, conquistas.
 *  Queda: se uma quebra nova aconteceu, grava que foi vista ANTES de mostrar
 *  (uma vez só, mesmo se o app fechar com a placa aberta); se ela já treinou
 *  depois da quebra, a notícia é velha: só grava. Desbloqueios: um treino salvo
 *  sem "Finalizar" destrava aqui. */
async function verificarAoAbrir(mostrar: (p: PlacaDados) => void): Promise<void> {
  const hoje = hojeISO();
  const { estado, parte } = await dadosDaSequencia(hoje);
  const vista = await getSetting("quedaVistaEm");
  if (deveMostrarQueda(estado, vista) && estado.quebra !== null) {
    await setSetting("quedaVistaEm", estado.quebra);
    if (estado.atual === 0) {
      mostrar({ tipo: "queda", de: estado.anterior, diasPerdidos: estado.diasPerdidos, quebra: estado.quebra, parte });
    }
  }
  for (const p of await desbloquearComPlacas(estado.atual, hoje)) mostrar(p);
  for (const p of await conquistasNovas()) mostrar(p);
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
  const verificando = useRef(false);

  const mostrar = useCallback((dados: PlacaDados) => {
    proximoId.current += 1;
    const id = proximoId.current;
    setFila((f) => [...f, { id, dados }]);
  }, []);
  // Por id: dois toques no botão não pulam a placa seguinte.
  const fechar = useCallback((id: number) => setFila((f) => f.filter((x) => x.id !== id)), []);

  useEffect(() => {
    const verificar = () => {
      // Uma verificação por vez (StrictMode e visibilitychange podem se cruzar).
      if (verificando.current) return;
      verificando.current = true;
      // Se o banco falhar (ou fechar no meio), só não aparece placa: a abertura
      // do app não pode quebrar por causa dela.
      verificarAoAbrir(mostrar)
        .catch(() => {})
        .finally(() => { verificando.current = false; });
    };
    // No celular o app quase nunca reabre do zero: volta do fundo.
    const aoVoltar = () => {
      if (document.visibilityState === "visible") verificar();
    };
    verificar();
    document.addEventListener("visibilitychange", aoVoltar);
    return () => document.removeEventListener("visibilitychange", aoVoltar);
  }, [mostrar]);

  const api = useMemo(() => ({ mostrar }), [mostrar]);
  const atual = fila[0];

  return (
    <PlacasContext.Provider value={api}>
      {children}
      {atual && <PlacaAtual key={atual.id} id={atual.id} dados={atual.dados} fechar={fechar} />}
    </PlacasContext.Provider>
  );
}

function PlacaAtual({ id, dados, fechar }: { id: number; dados: PlacaDados; fechar: (id: number) => void }) {
  const onFechar = useCallback(() => fechar(id), [fechar, id]);
  switch (dados.tipo) {
    case "vitoria":
      return (
        <PlacaVitoria
          treino={dados.treino} de={dados.de} para={dados.para} parte={dados.parte}
          fimDeSemana={dados.fimDeSemana} onFechar={onFechar}
        />
      );
    case "queda":
      return <PlacaQueda de={dados.de} diasPerdidos={dados.diasPerdidos} quebra={dados.quebra} parte={dados.parte} onFechar={onFechar} />;
    case "desbloqueio":
      return (
        <PlacaDesbloqueio
          titulo={dados.titulo} entra={dados.entra} praQue={dados.praQue}
          minutos={dados.minutos} horario={dados.horario} onFechar={onFechar}
        />
      );
    case "conquista":
      return <PlacaConquista titulo={dados.titulo} texto={dados.texto} onFechar={onFechar} />;
  }
}
