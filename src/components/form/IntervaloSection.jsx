import React from "react";
import SectionCard from "@/components/form/SectionCard";
import { Field, YesNo } from "@/components/form/FormFields";
import { hasEmpty } from "@/lib/sectionCompleteness";

export default function IntervaloSection({ data, onChange, onChoice }) {
  const suprimido = data.intervalo_suprimido === true;
  const visiveis = suprimido ? ["intervalo_suprimido","INTERVALO_USUFRUIDO"] : ["intervalo_suprimido"];
  return <SectionCard number="9" title="Intervalo intrajornada" incomplete={hasEmpty(data, visiveis)}><div className="space-y-6">
    <YesNo label="Horário de almoço suprimido?" name="intervalo_suprimido" value={data.intervalo_suprimido} onChange={onChoice} />
    {suprimido && <>
      <Field label="Quanto tempo era usufruído, em média" name="INTERVALO_USUFRUIDO" value={data.INTERVALO_USUFRUIDO} onChange={onChange} placeholder="Ex.: 10 a 15 minutos" required />
      <p className="text-sm text-slate-600">
        Informe uma <strong>duração</strong> (ex.: "10 a 15 minutos"). Este campo entra na frase
        "concessão parcial do intervalo de ...", por isso qualquer outra anotação — como uma
        observação sobre rádio ligado — é desviada para observação e não aparece na peça.
      </p>
    </>}
  </div></SectionCard>;
}