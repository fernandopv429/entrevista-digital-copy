import React from "react";
import SectionCard from "@/components/form/SectionCard";
import { Select } from "@/components/form/FormFields";
import { TESTEMUNHA_OPTIONS } from "@/lib/interviewOptions";
import { hasEmpty } from "@/lib/sectionCompleteness";

const FIELDS = ["testemunha"];

export default function TestemunhaSection({ data, onChange }) {
  return <SectionCard number="17" title="Testemunha" incomplete={hasEmpty(data, FIELDS)}><Select label="Testemunha" name="testemunha" value={data.testemunha} options={TESTEMUNHA_OPTIONS} onChange={onChange} /></SectionCard>;
}