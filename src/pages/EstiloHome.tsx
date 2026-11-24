import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../lib/db";
import { useSettingCarregada } from "../hooks/useSetting";
import { hojeISO } from "../lib/today-date";
import { ofertaDeDegrau, sugestaoDoMes, itensAteDegrau, medidaAtual, mesDe, type ComprasEstilo } from "../lib/estilo-degraus";
import type { ItemEstilo } from "../data/estilo-degraus-seed";
import { CompraDoMesCard } from "../components/estilo/CompraDoMesCard";
import { OfertaDegrauCard } from "../components/estilo/OfertaDegrauCard";
import { GuardaRoupa } from "../components/estilo/GuardaRoupa";
import { faixaDePreco } from "../lib/estilo-texto";

export function EstiloHome() {
  const compras = useSettingCarregada("estiloCompras");
  const mes = useSettingCarregada("estiloMes");
  const degrau = useSettingCarregada("estiloDegrau");
  const desde = useSettingCarregada("estiloDegrauDesde");
  const recusas = useSettingCarregada("estiloRecusas");
  const medidas = useLiveQuery(() => db.measurements.toArray(), []);

  if (compras === undefined || mes === undefined || degrau === undefined || desde === undefined || recusas === undefined || medidas === undefined) {
    return null;
  }

  const hoje = hojeISO();
  const quadril = medidaAtual(medidas, "hipCm", hoje);
  const cintura = medidaAtual(medidas, "waistCm", hoje);
  const estado = sugestaoDoMes({ hoje, degrau, compras, mesFechado: mes });
  const oferta = ofertaDeDegrau({ hoje, degrau, compras, degrauDesde: desde, recusas });
  const medidaDe = (i: ItemEstilo) => (i.medida === "quadril" ? quadril : i.medida === "cintura" ? cintura : null);

  // Os 6 meses do degrau contam do primeiro "Comprei" ou "Pular".
  const iniciar = async () => {
    if (((await db.settings.get("estiloDegrauDesde"))?.value ?? null) === null) {
      await db.settings.put({ key: "estiloDegrauDesde", value: hoje });
    }
  };

  // Lê o que já está gravado dentro da transação: dois toques rápidos não
  // podem sobrescrever um ao outro com o estado velho da tela.
  async function registrar(item: ItemEstilo, valorPago?: number) {
    const m = medidaDe(item);
    const atuais = ((await db.settings.get("estiloCompras"))?.value ?? {}) as ComprasEstilo;
    await db.settings.put({
      key: "estiloCompras",
      value: {
        ...atuais,
        [item.id]: { data: hoje, ...(m ? { medidaCm: m.cm } : {}), ...(valorPago !== undefined && valorPago >= 0 ? { valorPago } : {}) },
      },
    });
  }

  // Cada gesto grava numa transação só: a tela nunca vê a compra sem o mês.
  const comprei = (item: ItemEstilo, valorPago?: number) =>
    db.transaction("rw", db.settings, async () => {
      await registrar(item, valorPago);
      await db.settings.put({ key: "estiloMes", value: { mes: mesDe(hoje), acao: "comprei", itemId: item.id } });
      await iniciar();
    });
  const pular = () =>
    db.transaction("rw", db.settings, async () => {
      await db.settings.put({ key: "estiloMes", value: { mes: mesDe(hoje), acao: "pulei" } });
      await iniciar();
    });
  const jaTenho = (item: ItemEstilo) =>
    db.transaction("rw", db.settings, async () => {
      await registrar(item);
      await iniciar();
    });
  const aceitar = () =>
    oferta
      ? db.transaction("rw", db.settings, async () => {
          await db.settings.put({ key: "estiloDegrau", value: oferta.para });
          await db.settings.put({ key: "estiloDegrauDesde", value: hoje });
        })
      : undefined;
  const agoraNao = () =>
    oferta
      ? db.transaction("rw", db.settings, async () => {
          const atuais = ((await db.settings.get("estiloRecusas"))?.value ?? {}) as Record<string, string>;
          await db.settings.put({ key: "estiloRecusas", value: { ...atuais, [oferta.id]: hoje } });
        })
      : undefined;

  return (
    <div className="p-4 pb-24 space-y-5">
      <h1 className="font-serif text-2xl text-nude">Estilo</h1>

      {oferta && <OfertaDegrauCard oferta={oferta} onAceitar={aceitar} onAgoraNao={agoraNao} />}

      <CompraDoMesCard
        estado={estado}
        degrau={degrau}
        medida={estado.estado === "sugestao" ? medidaDe(estado.item) : null}
        onComprei={comprei}
        onPular={pular}
      />

      <section className="space-y-2" aria-labelledby="seu-degrau">
        <h2 id="seu-degrau" className="text-nude-warm font-medium">Seu degrau</h2>
        <ul className="space-y-2">
          {itensAteDegrau(degrau).filter((i) => i.degrau === degrau || !compras[i.id]).map((i) => (
            <li key={i.id} className="card flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0">
                <p className="text-nude-warm">{i.nome}</p>
                <p className="text-muted text-xs tabular-nums">
                  {i.degrau < degrau && <>Ainda do degrau {i.degrau} · </>}
                  {faixaDePreco(i)}
                </p>
              </div>
              {compras[i.id] ? (
                <span className="text-feito text-xs flex-none">Tenho</span>
              ) : (
                <button type="button" onClick={() => jaTenho(i)} className="flex-none rounded-md px-3 py-1 text-xs border border-bg-border text-muted">
                  Já tenho
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <GuardaRoupa compras={compras} quadrilAtual={quadril?.cm ?? null} cinturaAtual={cintura?.cm ?? null} />

      <section className="space-y-2">
        <Link to="/beleza/estilo" className="card block text-sm">
          <span className="text-nude-warm">Paleta</span>
          <ul className="text-muted text-xs mt-1 list-disc pl-4 space-y-0.5">
            <li>Teste do subtom: pano branco contra off-white, o que fica melhor no rosto.</li>
            <li>Dourado contra prateado, no pulso ou no pescoço.</li>
            <li>Faça perto da janela, com luz do dia.</li>
          </ul>
        </Link>
        <Link to="/beleza/estilo/pecas" className="card block text-sm">Ver a vitrine de peças</Link>
      </section>
    </div>
  );
}
