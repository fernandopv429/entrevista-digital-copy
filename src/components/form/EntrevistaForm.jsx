import React, { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Download } from "lucide-react";
import { generateInterviewPdf } from "@/lib/interviewPdf";
import { interviewExample } from "@/lib/interviewDefaults";
import AvisoEstimativa from "@/components/form/AvisoEstimativa";
import IdentificationSection from "@/components/form/IdentificationSection";
import ReclamadasSection from "@/components/form/ReclamadasSection";
import PeriodoSection from "@/components/form/PeriodoSection";
import DispensaSection from "@/components/form/DispensaSection";
import JornadaSection from "@/components/form/JornadaSection";
import BeneficiosSection from "@/components/form/BeneficiosSection";
import FeriasSection from "@/components/form/FeriasSection";
import FolgasSection from "@/components/form/FolgasSection";
import IntervaloSection from "@/components/form/IntervaloSection";
import HorasExtrasSection from "@/components/form/HorasExtrasSection";
import AcumuloSection from "@/components/form/AcumuloSection";
import CondicoesSection from "@/components/form/CondicoesSection";
import GratificacoesSection from "@/components/form/GratificacoesSection";
import DocumentosSection from "@/components/form/DocumentosSection";
import DescontosSection from "@/components/form/DescontosSection";
import SaudeSection from "@/components/form/SaudeSection";
import TestemunhaSection from "@/components/form/TestemunhaSection";
import FactsSection from "@/components/form/FactsSection";
import CnpjPainel from "@/components/form/CnpjPainel";

// Campos que só existem enquanto a tese está ativa. Ao responder "Não" depois
// de ter preenchido, o valor precisa ser APAGADO: o payload leva o objeto
// inteiro, e o gerador ainda leria o resíduo em alguns caminhos (ex.: VAL_FT
// é lido quando finais_semana=Sim, mesmo com folgas_trabalhadas=Não). É o
// mesmo problema que a 2ª reclamada tinha ao ser "removida".
const DEPENDENTES = {
  folgas_trabalhadas: ['FT_QTD_MEDIA', 'VAL_FT', 'ft_pagamento', 'folgas_conciliava', 'folgas_periodo_conciliou', 'SALARIOS_ABERTO', 'SALARIOS_ABERTO_QTD', 'VALOR_POR_FORA'],
  intervalo_suprimido: ['INTERVALO_USUFRUIDO'],
  horas_extras: ['media_horas_extras', 'periodo_antecedente', 'periodo_sucedente', 'controle_ponto', 'formato_ponto'],
  acumulo_funcao: ['funcoes_acumuladas'],
  gratificacao: ['gratificacao_qual'],
  assiduidade: ['assiduidade_prometido', 'assiduidade_pago'],
  vale_transporte: ['VAL_CONDUCAO'],
  vale_refeicao: ['VALOR_VALE_REFEICAO'],
  tem_insalubridade: ['insalubridade_porcentagem'],
  tem_periculosidade: ['periculosidade_porcentagem'],
};

// "Contrato em vigor" NÃO é campo da entidade, de propósito: o evento enviado
// ao n8n precisa manter exatamente a mesma estrutura que ele já consome, então
// nenhuma chave nova entra no payload. A resposta vive só no estado do
// formulário e chega ao gerador como frase nos fatos narrados — o campo por
// onde ele já lê a narrativa.
//
// Sem isso, DATA_RESCISAO vazio era indistinguível de campo esquecido, e nas
// rescisões indiretas em que o cliente segue trabalhando esse é o caso normal.
const AVISO_EM_VIGOR = "Contrato de trabalho EM VIGOR na data desta entrevista — não há data de rescisão nem último dia trabalhado. As verbas rescisórias devem ser apuradas a partir da data que o juízo fixar para a rescisão do contrato.";

// Ao abrir um registro já salvo para edição, a resposta é reconstituída: sem
// data de rescisão e com a marca nos fatos narrados, o contrato estava ativo.
// Sem isso o toggle voltaria em branco e o aviso se perderia no primeiro
// "Salvar e reenviar".
const inferirEmVigor = (d) => {
  if (!d) return undefined;
  if (d.DATA_RESCISAO) return false;
  if ((d.fatos_narrados || "").includes("EM VIGOR")) return true;
  return undefined;
};

// A frase é aplicada no submit e no PDF, nunca no textarea: assim não duplica
// se o entrevistador alternar a resposta nem se o registro for reeditado.
const comAvisoEmVigor = (d, emVigor) => {
  if (emVigor !== true) return { ...d };
  const base = (d.fatos_narrados || "").trim();
  if (base.includes("EM VIGOR")) return { ...d };
  return { ...d, fatos_narrados: base ? `${base}\n\n${AVISO_EM_VIGOR}` : AVISO_EM_VIGOR };
};

export default function EntrevistaForm({ initialData, onSubmit, submitLabel = "Salvar entrevista", savedLabel = "Entrevista salva com sucesso.", listenExample = false }) {
  const [data, setData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [emVigor, setEmVigor] = useState(() => inferirEmVigor(initialData));

  const change = ({ target }) => { setSaved(false); setData(v => ({ ...v, [target.name]: target.value })); };
  // Dados fictícios para testar o fluxo sem usar o cadastro de um cliente real.
  const carregarExemplo = () => { setSaved(false); setEmVigor(inferirEmVigor(interviewExample)); setData(interviewExample); };

  const escolherEmVigor = (valor) => {
    setSaved(false);
    setEmVigor(valor);
    // Com o contrato ativo as duas datas de saída não existem: precisam ser
    // APAGADAS, não só escondidas — um valor digitado antes continuaria
    // viajando no payload, fora da tela.
    if (valor === true) setData(v => ({ ...v, DATA_RESCISAO: "", ULTIMO_DIA_TRABALHADO: "" }));
  };
  // Permite disparar o "Carregar exemplo" a partir do menu (Sidebar), que
  // emite o evento window abaixo. Assim o botão sai do cabeçalho sem perder
  // a funcionalidade de pré-preencher com dados fictícios.
  useEffect(() => {
    if (!listenExample) return;
    const handler = () => carregarExemplo();
    window.addEventListener("entrevista:carregar-exemplo", handler);
    return () => window.removeEventListener("entrevista:carregar-exemplo", handler);
  }, [listenExample]);

  const choice = (name, value) => {
    setSaved(false);
    setData(v => {
      const next = { ...v, [name]: value };
      if (value === false) for (const campo of DEPENDENTES[name] || []) next[campo] = undefined;
      // O valor do auxílio-alimentação serve a dois booleanos; só zera quando os dois caírem.
      if (!next.vale_alimentacao && !next.vale_refeicao) next.VALOR_AUX_ALIMENTACAO = '';
      return next;
    });
  };

  // SALARIOS_ABERTO_QTD é o único campo numérico do schema. O formulário
  // controla ele como string (input type=number devolve string), e enviar ""
  // ou "2" para um campo number faz a validação do backend rejeitar com 400.
  // Normalizamos antes de salvar.
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = comAvisoEmVigor(data, emVigor);
    const qtd = payload.SALARIOS_ABERTO_QTD;
    const qtdNum = Number(qtd);
    if (qtd === "" || qtd === null || qtd === undefined || !Number.isFinite(qtdNum)) delete payload.SALARIOS_ABERTO_QTD;
    else payload.SALARIOS_ABERTO_QTD = qtdNum;
    try {
      await onSubmit(payload);
      setSaved(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  return <form onSubmit={submit} className="mx-auto mt-6 max-w-4xl px-4 sm:px-6 xl:max-w-6xl">
    {saved && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><CheckCircle2 className="h-5 w-5" />{savedLabel}</div>}
    <AvisoEstimativa />
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-6 xl:items-start">
      <div className="space-y-5">
        <IdentificationSection data={data} onChange={change} />
        <ReclamadasSection data={data} onChange={change} />
...
        <FactsSection data={data} onChange={change} />
      </div>
      <div className="xl:fixed xl:right-6 xl:top-24 xl:z-30 xl:w-[340px]"><CnpjPainel data={data} /></div>
    </div>
    <div className="sticky bottom-4 z-10 flex flex-wrap justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur"><button type="button" onClick={() => generateInterviewPdf(comAvisoEmVigor(data, emVigor))} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50 sm:w-auto"><Download className="h-5 w-5" />Baixar PDF</button><button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">{saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}{saving ? "Salvando..." : submitLabel}</button></div>
  </form>;
}