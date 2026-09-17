import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertTriangle, X, Search, ChevronDown, ChevronUp, Building2 } from "lucide-react";

const ROTULO_RECLAMADA = { RECL1: "1ª Reclamada", RECL2: "2ª Reclamada", RECL3: "3ª Reclamada", RECL4: "4ª Reclamada" };

function parseMunicipioUf(compl) {
  if (!compl) return {};
  const s = String(compl).trim();
  const porBarra = s.split("/").map(p => p.trim()).filter(Boolean);
  if (porBarra.length >= 2) {
    const uf = porBarra[porBarra.length - 1].substring(0, 2).toUpperCase();
    const municipio = porBarra.slice(0, -1).join("/").trim();
    return { municipio, uf };
  }
  const parts = s.split(/[-,]/).map(p => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const uf = parts[parts.length - 1].substring(0, 2).toUpperCase();
    const municipio = parts.slice(0, -1).join(" ").trim();
    return { municipio, uf };
  }
  return { municipio: s, uf: "" };
}

export default function CnpjSugestao({ prefixo, nome, logradouro, cep, compl }) {
  const [status, setStatus] = useState("idle");
  const [candidatos, setCandidatos] = useState([]);
  const [ambiguo, setAmbiguo] = useState(false);
  const [erro, setErro] = useState("");
  const [expandido, setExpandido] = useState(false);
  const [fechado, setFechado] = useState(false);
  const [debug, setDebug] = useState("");
  const timer = useRef(null);
  const ultimaChave = useRef("");

  const { municipio: complMun, uf: complUf } = parseMunicipioUf(compl);
  const cepDig = (cep || "").replace(/\D/g, "");
  const temNome = (nome || "").trim().length >= 4;
  const temCep = cepDig.length === 8;
  const temCidadeUf = !!(complMun && complUf);
  const podeBuscar = temNome || temCep || temCidadeUf;
  const chaveBusca = `${nome || ""}|${logradouro || ""}|${cep || ""}|${compl || ""}`;

  const buscar = async () => {
    const razao = (nome || "").trim();
    if (!podeBuscar) { setStatus("idle"); setCandidatos([]); return; }
    setStatus("loading"); setCandidatos([]); setAmbiguo(false); setErro(""); setExpandido(false);
    try {
      const params = { razao_social: razao, endereco: logradouro || "", municipio: complMun || "", uf: complUf || "", cep: cep || "" };
      const res = await base44.functions.invoke("localizarCnpj", params);
      let data = res.data || res;
      if (typeof data?.json === "function") data = await data.json();
      const dKeys = data ? Object.keys(data).join(",") : "null";
      setDebug("busca=" + razao.substring(0, 30) + " | keys=" + dKeys + " status=" + data?.status + " cands=" + (data?.candidatos?.length ?? "undef"));
      if (data.status === "error") {
        setStatus("error"); setErro(data.mensagem || "Falha na consulta"); return;
      }
      const cands = data.candidatos || [];
      if (!cands.length) { setStatus("empty"); return; }
      setCandidatos(cands); setAmbiguo(!!data.ambiguo); setStatus("success");
    } catch (e) {
      const errData = e?.response?.data;
      const errKeys = errData ? Object.keys(errData).join(",") : "none";
      setDebug("erro catch: " + (e.message || "?") + " | errDataKeys=" + errKeys + " | errStatus=" + e?.response?.status);
      setStatus("error"); setErro(e.message || "Erro ao consultar");
    }
  };

  useEffect(() => {
    if (!podeBuscar) { setStatus("idle"); setCandidatos([]); return; }
    if (chaveBusca === ultimaChave.current) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { ultimaChave.current = chaveBusca; buscar(); }, 900);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveBusca, podeBuscar]);

  if (!podeBuscar || fechado) return null;

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <Search className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <div>
            <span className="block text-xs font-bold uppercase tracking-wide text-blue-700">{ROTULO_RECLAMADA[prefixo] || "Reclamada"}</span>
            <span className="text-sm font-bold text-slate-800">{temNome ? "Dados encontrados com a razão social" : "Empresas neste endereço"}</span>
          </div>
        </div>
        <button type="button" onClick={() => setFechado(true)} className="text-slate-400 hover:text-slate-700"><X className="h-4 w-4" /></button>
      </div>

      {status === "idle" && (
        <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Preparando busca...</div>
      )}

      {status === "falta" && (
        <p className="text-sm leading-relaxed text-slate-700">
          Encontrei a razão social informada. Para garantir mais precisão, adicione mais dados como <b>endereço</b>, <b>CEP</b> e <b>cidade/UF</b> no campo Complemento.
        </p>
      )}

      {status === "loading" && (
        <div className="flex items-center gap-2 text-sm text-slate-600"><Loader2 className="h-4 w-4 animate-spin" /> Buscando dados da empresa...</div>
      )}

      {status === "empty" && (
        <div>
          <p className="text-sm leading-relaxed text-slate-700">
            Nenhum CNPJ encontrado com essa razão social. Confira a grafia ou adicione mais dados (endereço, CEP, cidade/UF) para refinar a busca.
          </p>
          {debug && <p className="mt-2 text-xs text-slate-400">DEBUG: {debug}</p>}
        </div>
      )}

      {status === "error" && (
        <div>
          <p className="text-sm font-semibold text-rose-700">Falha ao consultar: {erro}</p>
          {debug && <p className="mt-2 text-xs text-slate-400">DEBUG: {debug}</p>}
        </div>
      )}

      {status === "success" && (
        <div className="space-y-2">
          {ambiguo && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-100 p-2 text-xs font-semibold text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Há mais de uma empresa compatível — confira os dados antes de confirmar o CNPJ correto.
            </div>
          )}
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {candidatos.map((c, i) => (
            <div key={c.cnpj} className={`rounded-xl border p-3 text-sm ${i === 0 ? "border-blue-300 bg-white" : "border-slate-200 bg-white"}`}>
              <div className="flex items-start gap-2">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">
                    {c.cnpj_formatado}
                    {i === 0 && <span className="ml-1.5 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">1º</span>}
                  </p>
                  <p className="text-slate-700">{c.razao_social}</p>
                  <p className="text-xs text-slate-500">{c.matriz_filial} · {c.situacao}</p>
                  <p className="text-xs text-slate-500">CNAE: {c.cnae_principal?.codigo} — {c.cnae_principal?.descricao}</p>
                  {c.endereco_completo && <p className="mt-0.5 text-xs text-slate-400">{c.endereco_completo}</p>}
                  {i === 0 && c.qtd_cnae_secundario > 0 && (
                    <button type="button" onClick={() => setExpandido(v => !v)} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline">
                      {expandido ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {c.qtd_cnae_secundario} CNAE(s) secundário(s)
                    </button>
                  )}
                  {i === 0 && expandido && c.cnaes_secundarios?.length > 0 && (
                    <ul className="mt-1 space-y-0.5 pl-3 text-xs text-slate-500">
                      {c.cnaes_secundarios.map((s, idx) => <li key={idx}>{s.codigo} — {s.descricao}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
          <p className="pt-1 text-xs leading-relaxed text-slate-500">
            Confirme se o CNPJ acima corresponde à empresa correta antes de preencher. Para garantir mais precisão, adicione mais dados como <b>endereço</b>, <b>CEP</b> e <b>cidade/UF</b>.
          </p>
        </div>
      )}
    </div>
  );
}