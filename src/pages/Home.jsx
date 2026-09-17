import React from "react";
import { Image } from "@/components/ui/image";
import { base44 } from "@/api/base44Client";
import { interviewDefaults } from "@/lib/interviewDefaults";
import EntrevistaForm from "@/components/form/EntrevistaForm";

export default function Home() {
  const handleSubmit = async (payload) => {
    const saved = await base44.entities.Entrevista.create(payload);
    try { await base44.functions.invoke('enviarWebhookEntrevista', saved); } catch (e) { /* webhook failure não impede o salvamento */ }
  };

  return <main className="min-h-screen pb-20 text-slate-950">
    <header className="border-b border-slate-200 bg-white">
      <div className="absolute left-4 top-4 z-10 sm:left-6"><Image src="https://media.base44.com/images/public/6a734d6c72c1f853994b8733/0dbb0b8f0_image.png" alt="Fernando Vieira Advogados" className="h-12 w-40 sm:h-16 sm:w-56" fittingType="fit" /></div>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-brand">Entrevista trabalhista</p>
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Formulário de atendimento ao cliente</h1>
        <p className="mt-3 max-w-2xl text-slate-600">Preencha os dados do atendimento. O salário-base e a existência de tomadora (2ª reclamada) definem, respectivamente, os valores do rol de pedidos e a comarca — confira os dois antes de salvar.</p>
      </div>
    </header>
    <EntrevistaForm initialData={interviewDefaults} onSubmit={handleSubmit} listenExample submitLabel="Salvar entrevista" savedLabel="Entrevista salva com sucesso." />
  </main>;
}