import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Loader2, Building2, CalendarDays, Send, CheckCircle2, AlertCircle, Download, Pencil, Trash2, Search, Clock, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { TIPO_DISPENSA_OPTIONS } from "@/lib/interviewOptions";
import { generateInterviewPdf } from "@/lib/interviewPdf";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function dispensaLabel(value) {
  return TIPO_DISPENSA_OPTIONS.find(o => o.value === value)?.label || value || "—";
}

export default function Entrevistas() {
  const [entrevistas, setEntrevistas] = useState(null);
  const [error, setError] = useState(null);
  const [resending, setResending] = useState({});
  const [resendResult, setResendResult] = useState({});
  const [deleting, setDeleting] = useState({});
  const [busca, setBusca] = useState("");

  const termo = busca.trim().toLowerCase();
  const filtradas = (entrevistas || []).filter(item => {
    if (!termo) return true;
    const nome = (item.RECL_NOME || "").toLowerCase();
    const cpf = (item.RECL_CPF || "").toLowerCase();
    const id = (item.id || "").toLowerCase();
    return nome.includes(termo) || cpf.includes(termo) || id.includes(termo);
  });

  useEffect(() => {
    let active = true;
    base44.entities.Entrevista.list("-created_date", 100)
      .then(items => { if (active) setEntrevistas(items); })
      .catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);

  const resend = async (item) => {
    setResending(r => ({ ...r, [item.id]: true }));
    setResendResult(r => { const n = { ...r }; delete n[item.id]; return n; });
    try {
      await base44.functions.invoke("enviarWebhookEntrevista", item);
      setResendResult(r => ({ ...r, [item.id]: { ok: true } }));
    } catch (e) {
      setResendResult(r => ({ ...r, [item.id]: { ok: false, msg: e.message } }));
    } finally {
      setResending(r => { const n = { ...r }; delete n[item.id]; return n; });
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Excluir a entrevista de "${item.RECL_NOME || "Sem nome"}"? Esta ação não pode ser desfeita.`)) return;
    setDeleting(r => ({ ...r, [item.id]: true }));
    try {
      await base44.entities.Entrevista.delete(item.id);
      setEntrevistas(list => (list || []).filter(e => e.id !== item.id));
    } catch (e) {
      window.alert(`Erro ao excluir: ${e.message}`);
    } finally {
      setDeleting(r => { const n = { ...r }; delete n[item.id]; return n; });
    }
  };

  return <main className="min-h-screen pb-20 text-slate-950">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Entrevistas salvas</h1>
        <p className="mt-1 text-sm text-slate-500">Histórico de entrevistas cadastradas no sistema.</p>
      </div>
    </header>

    <div className="mx-auto mt-6 max-w-4xl space-y-4 px-4 sm:px-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar por nome, CPF ou ID..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-orange-100"
        />
      </div>

      {entrevistas === null && !error && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-12 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Carregando entrevistas...</div>
      )}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-800">Erro ao carregar entrevistas: {error}</div>
      )}
      {entrevistas !== null && entrevistas.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="font-semibold text-slate-700">Nenhuma entrevista salva ainda.</p>
          <p className="mt-1 text-sm text-slate-500">Use o menu para criar uma nova entrevista.</p>
        </div>
      )}
      {entrevistas !== null && entrevistas.length > 0 && filtradas.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <Search className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="font-semibold text-slate-700">Nenhuma entrevista encontrada.</p>
          <p className="mt-1 text-sm text-slate-500">Tente outro termo de pesquisa.</p>
        </div>
      )}
      {entrevistas !== null && filtradas.length > 0 && filtradas.map(item => {
        const reclamadas = [
          { razao_social: item.RECL1_NOME, cnpj: item.RECL1_CNPJ },
          { razao_social: item.RECL2_NOME, cnpj: item.RECL2_CNPJ },
          { razao_social: item.RECL3_NOME, cnpj: item.RECL3_CNPJ },
          { razao_social: item.RECL4_NOME, cnpj: item.RECL4_CNPJ },
        ].filter(r => r.razao_social);
        return (
        <article key={item.id} className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-950">{item.RECL_NOME || "Sem nome"}</h2>
              <p className="mt-1 text-sm text-slate-500">CPF: {item.RECL_CPF || "—"} {item.FUNCAO && `· ${item.FUNCAO}`}</p>
              <p className="mt-0.5 font-mono text-xs text-slate-400">ID: {item.id}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"><CalendarDays className="h-3.5 w-3.5" />{formatDate(item.created_date)}</span>
              {item.aprovacao_status === "aprovado" && <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Aprovado</span>}
              {item.aprovacao_status === "reprovado" && <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700"><XCircle className="h-3.5 w-3.5" />Reprovado</span>}
              {(!item.aprovacao_status || item.aprovacao_status === "pendente") && <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"><Clock className="h-3.5 w-3.5" />Pendente</span>}
            </div>
          </div>
          {item.aprovacao_status === "reprovado" && item.aprovacao_motivo && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-bold">Motivo da reprovação</p>
                <p className="mt-0.5">{item.aprovacao_motivo}</p>
              </div>
            </div>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="text-sm"><span className="font-semibold text-slate-700">Nascimento: </span><span className="text-slate-600">{formatDate(item.RECL_NASC)}</span></div>
            <div className="text-sm"><span className="font-semibold text-slate-700">Dispensa: </span><span className="text-slate-600">{dispensaLabel(item.tipo_dispensa)}</span></div>
            <div className="text-sm"><span className="font-semibold text-slate-700">Rescisão: </span><span className="text-slate-600">{formatDate(item.DATA_RESCISAO)}</span></div>
            <div className="text-sm"><span className="font-semibold text-slate-700">Telefone: </span><span className="text-slate-600">{item.telefone || "—"}</span></div>
          </div>
          {reclamadas.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Reclamadas</p>
              {reclamadas.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <span><span className="font-semibold text-slate-700">{r.razao_social}</span>{r.cnpj && ` · CNPJ ${r.cnpj}`}</span>
                </div>
              ))}
            </div>
          )}
          {item.fatos_narrados && (
            <p className="mt-4 line-clamp-3 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-600">{item.fatos_narrados}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={() => generateInterviewPdf(item)} className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-black/5"><Download className="h-4 w-4" />Baixar PDF</button>
            <Link to={`/entrevistas/${item.id}/editar`} className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-black/5"><Pencil className="h-4 w-4" />Editar</Link>
            <button type="button" onClick={() => resend(item)} disabled={!!resending[item.id]} className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60">
              {resending[item.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {resending[item.id] ? "Enviando..." : "Reenviar evento"}
            </button>
            {resendResult[item.id]?.ok && <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-4 w-4" />Evento reenviado</span>}
            {resendResult[item.id] && !resendResult[item.id].ok && <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-700"><AlertCircle className="h-4 w-4" />Falha: {resendResult[item.id].msg}</span>}
            <button type="button" onClick={() => remove(item)} disabled={!!deleting[item.id]} className="ml-auto inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60">
              {deleting[item.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {deleting[item.id] ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </article>
        );
      })}
    </div>
  </main>;
}