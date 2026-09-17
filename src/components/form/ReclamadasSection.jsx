import React, { useState } from "react";
import SectionCard from "@/components/form/SectionCard";
import { Field, Select } from "@/components/form/FormFields";
import { ESCALA_OPTIONS } from "@/lib/interviewOptions";
import { hasEmpty } from "@/lib/sectionCompleteness";

// Bloco precisa viver FORA do componente. Declarado dentro de
// ReclamadasSection, ele é recriado a cada render e o React desmonta/remonta
// os inputs a cada tecla — o que derruba o foco e "buga" a digitação.
function BlocoReclamada({ data, onChange, prefixo, rotulo, onRemover }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-700">{rotulo}</span>
        {onRemover && <button type="button" onClick={onRemover} className="text-sm font-medium text-red-600 hover:underline">Remover</button>}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2"><Field label="Razão social" name={`${prefixo}_NOME`} value={data[`${prefixo}_NOME`]} onChange={onChange} /></div>
        <Field label="CNPJ" name={`${prefixo}_CNPJ`} value={data[`${prefixo}_CNPJ`]} onChange={onChange} format="cnpj" />
        <Field label="CEP" name={`${prefixo}_CEP`} value={data[`${prefixo}_CEP`]} onChange={onChange} format="cep" />
        <div className="sm:col-span-2"><Field label="Endereço (logradouro)" name={`${prefixo}_LOGRADOURO`} value={data[`${prefixo}_LOGRADOURO`]} onChange={onChange} /></div>
        <div className="sm:col-span-2"><Field label="Complemento (cidade/UF)" name={`${prefixo}_ENDCOMPL`} value={data[`${prefixo}_ENDCOMPL`]} onChange={onChange} /></div>
        <Field label="Tempo laborado" name={`${prefixo}_TEMPO_LABORADO`} value={data[`${prefixo}_TEMPO_LABORADO`]} onChange={onChange} placeholder="Ex.: 02/01/2023 a 30/06/2025" />
        <Field label="Escala / horário" name={`${prefixo}_ESCALA_HORARIO`} value={data[`${prefixo}_ESCALA_HORARIO`]} onChange={onChange} placeholder="Ex.: 12x36 — das 19h às 07h" />
      </div>
    </div>
  );
}

export default function ReclamadasSection({ data, onChange }) {
  const [show2, setShow2] = useState(!!data.RECL2_NOME);
  const [show3, setShow3] = useState(!!data.RECL3_NOME);
  const [show4, setShow4] = useState(!!data.RECL4_NOME);

  // "Remover" precisa APAGAR os campos, não só escondê-los: o payload leva o
  // objeto inteiro, então uma reclamada oculta continuava sendo enviada.
  const CAMPOS = ["NOME", "CNPJ", "LOGRADOURO", "ENDCOMPL", "CEP", "TEMPO_LABORADO", "ESCALA_HORARIO"];
  const limpar = (prefixo) => {
    for (const campo of CAMPOS) onChange({ target: { name: `${prefixo}_${campo}`, value: "" } });
  };
  const remover2 = () => { limpar("RECL2"); limpar("RECL3"); limpar("RECL4"); setShow4(false); setShow3(false); setShow2(false); };
  const remover3 = () => { limpar("RECL3"); limpar("RECL4"); setShow4(false); setShow3(false); };
  const remover4 = () => { limpar("RECL4"); setShow4(false); };

  const RECL_FIELDS = ["NOME","CNPJ","LOGRADOURO","ENDCOMPL","CEP","TEMPO_LABORADO","ESCALA_HORARIO"];
  const visiveis = ["FUNCAO","escala","JORNADA_HORARIO", ...RECL_FIELDS.map(f => `RECL1_${f}`)];
  if (show2) visiveis.push(...RECL_FIELDS.map(f => `RECL2_${f}`));
  if (show2 && show3) visiveis.push(...RECL_FIELDS.map(f => `RECL3_${f}`));
  if (show2 && show3 && show4) visiveis.push(...RECL_FIELDS.map(f => `RECL4_${f}`));

  return <SectionCard number="2" title="Reclamadas, função e jornada" incomplete={hasEmpty(data, visiveis)}><div className="space-y-6">
    <div className="grid gap-5 sm:grid-cols-3">
      <Field label="Função exercida (cargo)" name="FUNCAO" value={data.FUNCAO} onChange={onChange} />
      <Select label="Escala (geral)" name="escala" value={data.escala} options={ESCALA_OPTIONS} onChange={onChange} />
      <Field label="Horário da jornada (geral)" name="JORNADA_HORARIO" value={data.JORNADA_HORARIO} onChange={onChange} placeholder="Ex.: das 19h às 07h" />
    </div>

    <BlocoReclamada data={data} onChange={onChange} prefixo="RECL1" rotulo="1ª Reclamada (empregadora)" />

    {show2 && <BlocoReclamada data={data} onChange={onChange} prefixo="RECL2" rotulo="2ª Reclamada (tomadora)" onRemover={remover2} />}
    {!show2 && (
      <button type="button" onClick={() => setShow2(true)} className="w-full rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 font-semibold text-slate-600 transition hover:border-blue-700 hover:text-blue-700">+ Adicionar 2ª reclamada</button>
    )}

    {show2 && show3 && <BlocoReclamada data={data} onChange={onChange} prefixo="RECL3" rotulo="3ª Reclamada (tomadora)" onRemover={remover3} />}
    {show2 && !show3 && (
      <button type="button" onClick={() => setShow3(true)} className="w-full rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 font-semibold text-slate-600 transition hover:border-blue-700 hover:text-blue-700">+ Adicionar 3ª reclamada</button>
    )}

    {show2 && show3 && show4 && <BlocoReclamada data={data} onChange={onChange} prefixo="RECL4" rotulo="4ª Reclamada (tomadora)" onRemover={remover4} />}
    {show2 && show3 && !show4 && (
      <button type="button" onClick={() => setShow4(true)} className="w-full rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 font-semibold text-slate-600 transition hover:border-blue-700 hover:text-blue-700">+ Adicionar 4ª reclamada</button>
    )}
  </div></SectionCard>;
}