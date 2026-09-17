import React from "react";
import SectionCard from "@/components/form/SectionCard";
import { Select, YesNo } from "@/components/form/FormFields";
import { FERIAS_OPTIONS } from "@/lib/interviewOptions";
import { hasEmpty } from "@/lib/sectionCompleteness";

const FIELDS = ["ferias","ferias_quantidade"];

export default function FeriasSection({ data, onChange, onChoice }) {
  return <SectionCard number="7" title="Férias" incomplete={hasEmpty(data, FIELDS)}><div className="grid gap-7 sm:grid-cols-2">
    <YesNo label="Possuiu férias?" name="ferias" value={data.ferias} onChange={onChoice} />
    <Select label="Quantidade" name="ferias_quantidade" value={data.ferias_quantidade} options={FERIAS_OPTIONS} onChange={onChange} />
  </div></SectionCard>;
}