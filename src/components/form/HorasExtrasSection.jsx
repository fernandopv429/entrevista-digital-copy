import React from "react";
import SectionCard from "@/components/form/SectionCard";
import { Field, Select, YesNo } from "@/components/form/FormFields";
import { HORAS_EXTRAS_OPTIONS, MINUTOS_OPTIONS } from "@/lib/interviewOptions";
import { hasEmpty } from "@/lib/sectionCompleteness";

export default function HorasExtrasSection({ data, onChange, onChoice }) {
  const fazia = data.horas_extras === true;
  let visiveis = ["horas_extras"];
  if (fazia) {
    visiveis.push("media_horas_extras","controle_ponto","periodo_antecedente","periodo_sucedente");
    if (data.controle_ponto === true) visiveis.push("formato_ponto");
  }
  return <SectionCard number="10" title="Horas extras" incomplete={hasEmpty(data, visiveis)}><div className="space-y-6">
    <YesNo label="Realizava horas extras?" name="horas_extras" value={data.horas_extras} onChange={onChoice} />
    {fazia && (
      <div className="space-y-6">
        <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
          <Select label="Média de horas extras" name="media_horas_extras" value={data.media_horas_extras} options={HORAS_EXTRAS_OPTIONS} onChange={onChange} required />
          <YesNo label="Havia controle de ponto?" name="controle_ponto" value={data.controle_ponto} onChange={onChoice} />
          {data.controle_ponto === true && (
            <Field label="Qual formato do ponto" name="formato_ponto" value={data.formato_ponto} onChange={onChange} placeholder="Ex.: Catraca eletrônica / manual / app" />
          )}
        </div>
        <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
          <Select label="Período antecedente à jornada" name="periodo_antecedente" value={data.periodo_antecedente} options={MINUTOS_OPTIONS} onChange={onChange} required />
          <Select label="Período sucedente" name="periodo_sucedente" value={data.periodo_sucedente} options={MINUTOS_OPTIONS} onChange={onChange} required />
        </div>
      </div>
    )}
  </div></SectionCard>;
}