import React from "react";
import SectionCard from "@/components/form/SectionCard";
import { Field, YesNo } from "@/components/form/FormFields";
import { hasEmpty } from "@/lib/sectionCompleteness";

export default function GratificacoesSection({ data, onChange, onChoice }) {
  let visiveis = ["gratificacao","assiduidade"];
  if (data.gratificacao === true) visiveis.push("gratificacao_qual");
  if (data.assiduidade) visiveis.push("assiduidade_prometido","assiduidade_pago");
  return <SectionCard number="13" title="Gratificações e prêmios" incomplete={hasEmpty(data, visiveis)}><div className="space-y-6">
    <div className="grid gap-7 sm:grid-cols-2">
      <YesNo label="Recebe algum tipo de gratificação?" name="gratificacao" value={data.gratificacao} onChange={onChoice} />
      {data.gratificacao === true && <Field label="Qual" name="gratificacao_qual" value={data.gratificacao_qual} onChange={onChange} required />}
    </div>
    <div className="grid gap-x-6 gap-y-7 sm:grid-cols-3">
      <YesNo label="Havia prêmio de assiduidade?" name="assiduidade" value={data.assiduidade} onChange={onChoice} />
      {data.assiduidade && <>
        <Field label="Valor prometido (mensal)" name="assiduidade_prometido" value={data.assiduidade_prometido} onChange={onChange} format="currency" required />
        <Field label="Valor efetivamente pago" name="assiduidade_pago" value={data.assiduidade_pago} onChange={onChange} format="currency" required />
      </>}
    </div>
    <p className="text-sm text-slate-600">
      O que se pede no prêmio de assiduidade é a diferença entre o prometido e o pago (art. 457, §1º, da
      CLT) — por isso os dois valores importam. Sem eles a tese não chega a ser calculada.
    </p>
  </div></SectionCard>;
}