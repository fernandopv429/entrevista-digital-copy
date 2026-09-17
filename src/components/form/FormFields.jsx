import React from "react";
import { applyFormat } from "@/lib/formatters";

// Colar um texto longo num campo controlado faz o navegador rolar a página
// para manter o cursor visível. Capturamos a posição antes da colagem e
// restauramos depois, evitando o "pulo" do scroll.
const handlePaste = (e) => {
  const y = window.scrollY;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (window.scrollY !== y) window.scrollTo(0, y);
    })
  );
};

// `placeholder` era passado por seis campos do formulário e caía no vazio: o
// componente não recebia a prop, então nenhum daqueles exemplos ("Ex.: das 19h
// às 07h", "Ex.: São Paulo/SP") jamais chegou à tela.
export function Field({ label, name, value, onChange, type = "text", required = false, format, placeholder }) {
  const handle = format
    ? (e) => onChange({ target: { name: e.target.name, value: applyFormat(format, e.target.value) } })
    : onChange;
  return <label className="block space-y-2"><span className="text-sm font-semibold text-slate-700">{label}{required && <span className="text-brand"> *</span>}</span><input name={name} value={value ?? ""} onChange={handle} onPaste={handlePaste} type={type} required={required} placeholder={placeholder} inputMode={format ? "numeric" : undefined} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-orange-100" /></label>;
}

export function TextArea({ label, name, value, onChange, rows = 4, required = false, placeholder }) {
  return <label className="block space-y-2"><span className="text-sm font-semibold text-slate-700">{label}{required && <span className="text-brand"> *</span>}</span><textarea name={name} value={value ?? ""} onChange={onChange} onPaste={handlePaste} rows={rows} required={required} placeholder={placeholder} className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 leading-relaxed text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-orange-100" /></label>;
}

export function Select({ label, name, value, onChange, options, required = false }) {
  const normalized = options.map(opt => (typeof opt === "string" ? { value: opt, label: opt } : opt));
  return <label className="block space-y-2"><span className="text-sm font-semibold text-slate-700">{label}{required && <span className="text-brand"> *</span>}</span><select name={name} value={value ?? ""} onChange={onChange} required={required} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-orange-100"><option value="" disabled>Selecione...</option>{normalized.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></label>;
}

export function YesNo({ label, name, value, onChange }) {
  return <fieldset><legend className="mb-2 text-sm font-semibold text-slate-700">{label}</legend><div className="flex gap-2">{[true, false].map(option => <label key={String(option)} className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition ${value === option ? "border-brand bg-orange-50 text-[#E64A19]" : "border-slate-200 bg-white text-slate-600"}`}><input className="sr-only" type="radio" name={name} checked={value === option} onChange={() => onChange(name, option)} />{option ? "Sim" : "Não"}</label>)}</div></fieldset>;
}