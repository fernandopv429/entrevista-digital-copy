import React from "react";
import { AlertCircle } from "lucide-react";
import SectionCard from "@/components/form/SectionCard";
import { Field, Select, YesNo } from "@/components/form/FormFields";
import { FOLGAS_OPTIONS_ATIVO, FT_PAGAMENTO_OPTIONS } from "@/lib/interviewOptions";
import { hasEmpty } from "@/lib/sectionCompleteness";

// Os campos secundarios so aparecem (e passam a ser obrigatorios) quando a
// resposta e "Sim". Sem quantidade e sem valor, o gerador nao consegue liquidar
// as folgas e o item simplesmente NAO entra no rol de pedidos, em silencio.
export default function FolgasSection({ data, onChange, onChoice }) {
  const trabalhou = data.folgas_trabalhadas === true;
  let visiveis = ["folgas_trabalhadas"];
  if (trabalhou) {
    visiveis = visiveis.concat(["FT_QTD_MEDIA","VAL_FT","ft_pagamento","ft_comprovante","folgas_conciliava","SALARIOS_ABERTO","SALARIOS_ABERTO_QTD","VALOR_POR_FORA"]);
    if (data.folgas_conciliava === true) visiveis.push("folgas_periodo_conciliou");
  }
  return <SectionCard number="8" title="Folgas trabalhadas (FT)" incomplete={hasEmpty(data, visiveis)}><div className="space-y-6">
    <YesNo label="Trabalhou folgas?" name="folgas_trabalhadas" value={data.folgas_trabalhadas} onChange={onChoice} />
    {trabalhou && <>
      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <strong>Preenchimento obrigatório.</strong> Os três campos abaixo são o que permite
          liquidar as folgas no rol de pedidos — sem eles a verba não é calculada e não entra na
          minuta.
        </p>
      </div>
      <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
        <Select label="Média de folgas por mês" name="FT_QTD_MEDIA" value={data.FT_QTD_MEDIA} options={FOLGAS_OPTIONS_ATIVO} onChange={onChange} required />
        <Field label="Valor recebido por FT / diária" name="VAL_FT" value={data.VAL_FT} onChange={onChange} format="currency" placeholder="Ex.: R$ 180,00" required />
        <Select label="Forma de recebimento" name="ft_pagamento" value={data.ft_pagamento} options={FT_PAGAMENTO_OPTIONS} onChange={onChange} required />
        <YesNo label="Possui comprovante de pagamento?" name="ft_comprovante" value={data.ft_comprovante} onChange={onChoice} />
      </div>
      <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
        <YesNo label="Conciliava jornada?" name="folgas_conciliava" value={data.folgas_conciliava} onChange={onChoice} />
        {data.folgas_conciliava === true && (
          <Field label="Período que conciliou" name="folgas_periodo_conciliou" value={data.folgas_periodo_conciliou} onChange={onChange} placeholder="Ex.: jan/2024 a mar/2025" />
        )}
      </div>
      <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
        <Field label="Salários em aberto — quais meses" name="SALARIOS_ABERTO" value={data.SALARIOS_ABERTO} onChange={onChange} placeholder="Ex.: outubro e novembro/2025" />
        <Field label="Salários em aberto — qtd. de meses" name="SALARIOS_ABERTO_QTD" value={data.SALARIOS_ABERTO_QTD} onChange={onChange} type="number" placeholder="Ex.: 2" />
        <Field label="Valor 'por fora' por mês" name="VALOR_POR_FORA" value={data.VALOR_POR_FORA} onChange={onChange} format="currency" placeholder="Ex.: R$ 500,00" />
      </div>
      <p className="text-sm text-slate-600">
        A forma de recebimento importa por si: Pix ou dinheiro caracterizam pagamento por fora e
        acionam o pedido de integração ao salário, com reflexos em DSR, aviso prévio, 13º,
        férias + 1/3 e FGTS + 40%.
      </p>
    </>}
  </div></SectionCard>;
}