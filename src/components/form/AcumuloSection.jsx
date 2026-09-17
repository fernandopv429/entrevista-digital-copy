import React from "react";
import SectionCard from "@/components/form/SectionCard";
import { TextArea, YesNo } from "@/components/form/FormFields";
import { hasEmpty } from "@/lib/sectionCompleteness";

// A descrição das atividades é o que sustenta a tese: o gerador a envia como
// desvio_atividades (vigilante) ou acumulo_atividades (demais categorias), e é
// dela que a IA escreve os FATOS do capítulo de enquadramento. Marcar "Sim" sem
// descrever produzia capítulo sem causa de pedir.
export default function AcumuloSection({ data, onChange, onChoice }) {
  const houve = data.acumulo_funcao === true;
  const visiveis = houve ? ["acumulo_funcao","funcoes_acumuladas"] : ["acumulo_funcao"];
  return <SectionCard number="11" title="Acúmulo/desvio de função" incomplete={hasEmpty(data, visiveis)}><div className="space-y-6">
    <YesNo label="Houve acúmulo ou desvio de função?" name="acumulo_funcao" value={data.acumulo_funcao} onChange={onChoice} />
    {houve && <>
      <TextArea label="Quais atividades passou a exercer" name="funcoes_acumuladas" value={data.funcoes_acumuladas} onChange={onChange} rows={3} placeholder="Ex.: conferência de mercadorias, controle de validade de produtos, contagem de paletes" required />
      <p className="text-sm text-slate-600">
        Descreva as tarefas concretas, não o nome do cargo. O enquadramento entre desvio e acúmulo é
        decidido pelo sistema conforme a função e a convenção da categoria — os dois são
        alternativos e nunca cumulados sobre os mesmos fatos.
      </p>
    </>}
  </div></SectionCard>;
}