import React from "react";
import SectionCard from "@/components/form/SectionCard";
import { Field } from "@/components/form/FormFields";

export default function ComplementaresSection({ data, onChange }) {
  return <SectionCard number="19" title="Dados complementares"><div className="grid gap-5 sm:grid-cols-2">
    <Field label="Vigência da CCT aplicável" name="CCT_VIGENCIA" value={data.CCT_VIGENCIA} onChange={onChange} placeholder="Ex.: 2024/2025" />
    <Field label="Valor da causa" name="VALOR_CAUSA" value={data.VALOR_CAUSA} onChange={onChange} format="currency" />
    <div className="sm:col-span-2"><Field label="Local e data de assinatura" name="LOCAL_DATA_ASSINATURA" value={data.LOCAL_DATA_ASSINATURA} onChange={onChange} placeholder="Ex.: São Paulo, 11 de agosto de 2025" /></div>
  </div></SectionCard>;
}
