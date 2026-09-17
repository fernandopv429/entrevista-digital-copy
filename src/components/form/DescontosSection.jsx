import React from "react";
import SectionCard from "@/components/form/SectionCard";
import { Field, YesNo } from "@/components/form/FormFields";
import { hasEmpty } from "@/lib/sectionCompleteness";

const FIELDS = ["desconto_indevido","desconto_qual"];

export default function DescontosSection({ data, onChange, onChoice }) {
  return <SectionCard number="15" title="Descontos" incomplete={hasEmpty(data, FIELDS)}><div className="space-y-7">
    <YesNo label="Houve desconto indevido?" name="desconto_indevido" value={data.desconto_indevido} onChange={onChoice} />
    <Field label="Qual" name="desconto_qual" value={data.desconto_qual} onChange={onChange} />
  </div></SectionCard>;
}