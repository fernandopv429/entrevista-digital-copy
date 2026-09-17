import React from "react";
import SectionCard from "@/components/form/SectionCard";
import { Field, YesNo } from "@/components/form/FormFields";
import { hasEmpty } from "@/lib/sectionCompleteness";

// Estes dois valores alimentam os itens "auxílio-alimentação nas folgas" e
// "vale-transporte nas folgas" (mathUtils.js:458 e :464).
//
// NÃO são obrigatórios de propósito. As peças reais declaram o valor como
// número da CONVENÇÃO, não como informação do cliente — "R$ 37,00 por cada dia
// laborado, conforme CCT" (Denizard x Macor), "R$ 24,80 ... conforme cláusula da
// convenção" (Douglas x XRS). O gerador já busca essa cláusula na CCT
// consultada e, se não achar, aplica o padrão da categoria com aviso. Exigir o
// número aqui obrigaria o entrevistador a consultar a convenção durante o
// atendimento, sem evitar nenhuma falha real.
export default function BeneficiosSection({ data, onChange, onChoice }) {
  const temAlimentacao = data.vale_alimentacao || data.vale_refeicao;
  const temFolgas = data.folgas_trabalhadas === true;
  const visiveis = ["vale_refeicao","vale_alimentacao","vale_transporte"];
  if (data.vale_refeicao) visiveis.push("VALOR_VALE_REFEICAO");
  if (temAlimentacao) visiveis.push("VALOR_AUX_ALIMENTACAO");
  if (data.vale_transporte) visiveis.push("VAL_CONDUCAO");
  return <SectionCard number="6" title="Benefícios" incomplete={hasEmpty(data, visiveis)}><div className="space-y-6">
    <div className="grid gap-7 sm:grid-cols-3">
      <YesNo label="Vale-refeição" name="vale_refeicao" value={data.vale_refeicao} onChange={onChoice} />
      <YesNo label="Vale-alimentação" name="vale_alimentacao" value={data.vale_alimentacao} onChange={onChoice} />
      <YesNo label="Vale-transporte" name="vale_transporte" value={data.vale_transporte} onChange={onChoice} />
    </div>
    {(temAlimentacao || data.vale_transporte) && <>
      <div className="grid gap-5 sm:grid-cols-3">
        {data.vale_refeicao && <Field label="Valor diário do vale-refeição (opcional)" name="VALOR_VALE_REFEICAO" value={data.VALOR_VALE_REFEICAO} onChange={onChange} format="currency" placeholder="Ex.: R$ 25,00" />}
        {temAlimentacao && <Field label="Valor diário do auxílio-alimentação (opcional)" name="VALOR_AUX_ALIMENTACAO" value={data.VALOR_AUX_ALIMENTACAO} onChange={onChange} format="currency" placeholder="Ex.: R$ 37,00" />}
        {data.vale_transporte && <Field label="Valor diário da condução (opcional)" name="VAL_CONDUCAO" value={data.VAL_CONDUCAO} onChange={onChange} format="currency" placeholder="Ex.: R$ 10,00" />}
      </div>
      <p className="text-sm text-slate-600">
        Preencha só se souber o valor da convenção. Em branco, o sistema busca a cláusula na CCT
        vigente e, se não localizar, aplica o padrão da categoria e marca a peça para revisão.
        {temFolgas
          ? " Como houve folgas trabalhadas, estes valores entram no cálculo: liquidam o auxílio-alimentação e o vale-transporte devidos nos dias de folga."
          : " Sem folgas trabalhadas (Seção 8) estes valores não entram em nenhum cálculo — os dois pedidos existem apenas na modalidade \"nas folgas trabalhadas\"."}
      </p>
    </>}
  </div></SectionCard>;
}