import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Image } from "@/components/ui/image";
import { base44 } from "@/api/base44Client";
import EntrevistaForm from "@/components/form/EntrevistaForm";

export default function EditarEntrevista() {
  const { id } = useParams();
  const [initial, setInitial] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.entities.Entrevista.get(id)
      .then(setInitial)
      .catch(e => setError(e.message));
  }, [id]);

  // Edita o registro existente e reenvia o evento para o webhook, de forma que
  // uma correção dispare novamente o fluxo de geração da peça.
  const handleSubmit = async (payload) => {
    const updated = await base44.entities.Entrevista.update(id, payload);
    try { await base44.functions.invoke('enviarWebhookEntrevista', updated); } catch (e) { /* webhook failure não impede o salvamento */ }
  };

  if (error) return <main className="min-h-screen pb-20 text-slate-950">
    <div className="mx-auto mt-10 max-w-4xl px-4 sm:px-6">
      <Link to="/entrevistas" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"><ArrowLeft className="h-4 w-4" />Voltar</Link>
      <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-800">Erro ao carregar entrevista: {error}</div>
    </div>
  </main>;

  if (!initial) return <main className="min-h-screen flex items-center justify-center text-slate-500"><Loader2 className="h-6 w-6 animate-spin" />Carregando entrevista...</main>;

  return <main className="min-h-screen pb-20 text-slate-950">
    <header className="border-b border-slate-200 bg-white">
      <div className="absolute left-4 top-4 z-10 sm:left-6"><Image src="https://media.base44.com/images/public/6a734d6c72c1f853994b8733/0dbb0b8f0_image.png" alt="Fernando Vieira Advogados" className="h-12 w-40 sm:h-16 sm:w-56" fittingType="fit" /></div>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <Link to="/entrevistas" className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"><ArrowLeft className="h-4 w-4" />Voltar para entrevistas</Link>
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-brand">Entrevista trabalhista</p>
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Editar entrevista — {initial.RECL_NOME || "Sem nome"}</h1>
        <p className="mt-3 max-w-2xl text-slate-600">Ajuste os dados do atendimento. Ao salvar, a entrevista é atualizada e o evento é reenviado automaticamente.</p>
      </div>
    </header>
    {initial.aprovacao_status === "reprovado" && (
      <div className="mx-auto mt-4 max-w-4xl px-4 sm:px-6">
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div>
            <p className="font-bold text-rose-800">Entrevista reprovada</p>
            <p className="mt-1 text-sm text-rose-700">{initial.aprovacao_motivo || "Motivo não informado."}</p>
          </div>
        </div>
      </div>
    )}
    {initial.aprovacao_status === "aprovado" && (
      <div className="mx-auto mt-4 max-w-4xl px-4 sm:px-6">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="font-bold text-emerald-800">Entrevista aprovada</p>
        </div>
      </div>
    )}
    <EntrevistaForm initialData={initial} onSubmit={handleSubmit} submitLabel="Salvar e reenviar" savedLabel="Entrevista atualizada e evento reenviado com sucesso." />
  </main>;
}