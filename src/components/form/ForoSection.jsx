import React from "react";
import SectionCard from "@/components/form/SectionCard";
import { Field } from "@/components/form/FormFields";

export default function ForoSection({ data, onChange }) {
  return <SectionCard number="3" title="Competência e foro"><div className="grid gap-5 sm:grid-cols-2">
    <Field label="Comarca/UF" name="COMARCA_UF" value={data.COMARCA_UF} onChange={onChange} placeholder="Ex.: São Paulo/SP" />
    <Field label="Região do TRT" name="REGIAO_TRT" value={data.REGIAO_TRT} onChange={onChange} placeholder="Ex.: SEGUNDA REGIÃO" />
    <div className="sm:col-span-2"><Field label="Foro de competência" name="FORO_COMPETENCIA" value={data.FORO_COMPETENCIA} onChange={onChange} /></div>
  </div></SectionCard>;
}
