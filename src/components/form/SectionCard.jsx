import React from "react";

export default function SectionCard({ number, title, children, incomplete }) {
  return <section className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:p-7"><div className="mb-6 flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{number}</span><h2 className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">{title}</h2>{incomplete && <span className="ml-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-brand ring-4 ring-orange-100" title="Há campos não preenchidos nesta seção" />}</div>{children}</section>;
}