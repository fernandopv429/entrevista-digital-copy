import React from "react";
import SectionCard from "@/components/form/SectionCard";
import { Field, TextArea, YesNo } from "@/components/form/FormFields";

export default function ConditionsSection({ data, onChange, onChoice }) {
  return <SectionCard number="4" title="Condições, documentos e segurança"><div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
    <YesNo label="Houve acúmulo ou desvio de função?" name="acumulo_funcao" value={data.acumulo_funcao} onChange={onChoice} /><div className="sm:col-span-2"><TextArea label="Quais funções?" name="funcoes_acumuladas" value={data.funcoes_acumuladas} onChange={onChange} rows={3} /></div>
    <YesNo label="Utilizava armamento e colete?" name="armamento_colete" value={data.armamento_colete} onChange={onChoice} /><YesNo label="Recebia gratificação?" name="gratificacao" value={data.gratificacao} onChange={onChoice} /><Field label="Qual gratificação?" name="gratificacao_qual" value={data.gratificacao_qual} onChange={onChange} />
    <YesNo label="Possui holerites?" name="holerites" value={data.holerites} onChange={onChoice} /><YesNo label="Possui rescisão contratual?" name="rescisao_contratual" value={data.rescisao_contratual} onChange={onChoice} /><YesNo label="Possui espelho de ponto?" name="espelho_ponto" value={data.espelho_ponto} onChange={onChoice} />
    <YesNo label="Houve desconto indevido?" name="desconto_indevido" value={data.desconto_indevido} onChange={onChoice} /><Field label="Qual desconto?" name="desconto_qual" value={data.desconto_qual} onChange={onChange} />
    <YesNo label="Doença ou acidente de trabalho?" name="doenca_acidente" value={data.doenca_acidente} onChange={onChoice} /><YesNo label="Havia insalubridade?" name="insalubridade" value={data.insalubridade} onChange={onChoice} /><YesNo label="Havia periculosidade?" name="periculosidade" value={data.periculosidade} onChange={onChoice} /><Field label="Quais produtos?" name="produtos" value={data.produtos} onChange={onChange} /><Field label="Utilizava quais EPIs?" name="epi" value={data.epi} onChange={onChange} /><Field label="Testemunha" name="testemunha" value={data.testemunha} onChange={onChange} />
  </div></SectionCard>;
}