import React from "react";
import SectionCard from "@/components/form/SectionCard";
import { Field, TextArea, YesNo } from "@/components/form/FormFields";

export default function DanoMoralSection({ data, onChange, onChoice }) {
  return <SectionCard number="7" title="Dano moral"><div className="space-y-5">
    <Field label="Nome do superior hierárquico" name="DANO_SUPERVISOR" value={data.DANO_SUPERVISOR} onChange={onChange} />
    <TextArea label="Fatos de dano moral/assédio relatados" name="DANO_FATOS" value={data.DANO_FATOS} onChange={onChange} rows={4} />
    <YesNo label="O posto não tinha banheiro/bebedouro?" name="dano_sem_estrutura" value={data.dano_sem_estrutura} onChange={onChoice} />
  </div></SectionCard>;
}
