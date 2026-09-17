import React from "react";
import SectionCard from "@/components/form/SectionCard";
import { YesNo } from "@/components/form/FormFields";
import { hasEmpty } from "@/lib/sectionCompleteness";

const FIELDS = ["armamento_colete"];

export default function CondicoesSection({ data, onChoice }) {
  return <SectionCard number="12" title="Condições de trabalho" incomplete={hasEmpty(data, FIELDS)}><YesNo label="Utilizava armamento e colete?" name="armamento_colete" value={data.armamento_colete} onChange={onChoice} /></SectionCard>;
}