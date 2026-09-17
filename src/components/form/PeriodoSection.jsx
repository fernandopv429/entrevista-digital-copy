import React from "react";
import SectionCard from "@/components/form/SectionCard";
import { Field, YesNo } from "@/components/form/FormFields";
import { hasEmpty } from "@/lib/sectionCompleteness";

// "Contrato em vigor" NÃO é campo da entidade, de propósito: o evento
// enviado ao n8n precisa manter exatamente a mesma estrutura que ele já
// consome, então nenhuma chave nova entra no payload. A resposta vive só no
// estado do formulário e produz dois efeitos: as datas de saída ficam
// escondidas e vazias (como já ficavam nesses atendimentos) e o submit
// acrescenta uma frase padronizada aos fatos narrados — que é o campo por
// onde o gerador lê a narrativa.
//
// Sem isso, DATA_RESCISAO vazio era indistinguível de campo esquecido.
export default function PeriodoSection({ data, onChange, emVigor, onEmVigor }) {
  const ativo = emVigor === true;
  const FIELDS = ativo
    ? ["DATA_ADMISSAO", "SALARIO"]
    : ["DATA_ADMISSAO", "DATA_RESCISAO", "SALARIO"];
  return <SectionCard number="3" title="Período do contrato e remuneração" incomplete={hasEmpty(data, FIELDS)}><div className="space-y-5">
    <YesNo label="Contrato ainda em vigor?" name="contrato_em_vigor" value={emVigor} onChange={(_, valor) => onEmVigor(valor)} />
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Admissão" name="DATA_ADMISSAO" type="date" value={data.DATA_ADMISSAO} onChange={onChange} />
      {!ativo && <Field label="Rescisão / último dia trabalhado" name="DATA_RESCISAO" type="date" value={data.DATA_RESCISAO} onChange={onChange} />}
      <Field label="Salário-base mensal" name="SALARIO" value={data.SALARIO} onChange={onChange} format="currency" />
    </div>
    {ativo && (
      <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        O vínculo segue ativo, então não há data de rescisão nem último dia trabalhado. Isso é
        registrado na minuta, e as verbas rescisórias saem para apuração a partir da data que o
        juízo fixar — típico da rescisão indireta em que o cliente opta por continuar trabalhando.
      </p>
    )}
    <p className="text-sm text-slate-600">
      Confira o salário no holerite ou na CTPS. Todo o rol de pedidos é calculado sobre ele — aviso prévio,
      13º, férias, FGTS, multas e hora normal. Se ficar em branco, a minuta sai calculada sobre o piso da
      convenção coletiva e volta marcada para revisão.
    </p>
  </div></SectionCard>;
}