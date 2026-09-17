import React from "react";
import SectionCard from "@/components/form/SectionCard";
import { YesNo } from "@/components/form/FormFields";
import { hasEmpty } from "@/lib/sectionCompleteness";

const FIELDS = ["holerites","rescisao_contratual","espelho_ponto"];

export default function DocumentosSection({ data, onChoice }) {
  return <SectionCard number="14" title="Documentos" incomplete={hasEmpty(data, FIELDS)}><div className="grid gap-7 sm:grid-cols-3">
    <YesNo label="Holerites" name="holerites" value={data.holerites} onChange={onChoice} />
    <YesNo label="Rescisão contratual" name="rescisao_contratual" value={data.rescisao_contratual} onChange={onChoice} />
    <YesNo label="Espelho de ponto" name="espelho_ponto" value={data.espelho_ponto} onChange={onChoice} />
  </div></SectionCard>;
}