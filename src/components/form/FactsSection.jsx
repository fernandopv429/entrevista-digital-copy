import React from "react";
import SectionCard from "@/components/form/SectionCard";
import { TextArea } from "@/components/form/FormFields";
import { hasEmpty } from "@/lib/sectionCompleteness";

const FIELDS = ["fatos_narrados"];

export default function FactsSection({ data, onChange }) {
  return <SectionCard number="18" title="Fatos narrados pelo reclamante" incomplete={hasEmpty(data, FIELDS)}><TextArea label="Relato completo" name="fatos_narrados" value={data.fatos_narrados} onChange={onChange} rows={13} /></SectionCard>;
}