import React from "react";
import SectionCard from "@/components/form/SectionCard";
import { Field } from "@/components/form/FormFields";
import { hasEmpty } from "@/lib/sectionCompleteness";

const FIELDS = ["titulo","RECL_NOME","RECL_NACIONALIDADE","RECL_ESTADOCIVIL","RECL_RG","RECL_CPF","RECL_PIS","RECL_CTPS","RECL_SERIE","RECL_NASC","RECL_FILIACAO","RECL_ENDERECO","RECL_CEP","email","telefone"];

export default function IdentificationSection({ data, onChange }) {
  return <SectionCard number="1" title="Identificação do cliente" incomplete={hasEmpty(data, FIELDS)}><div className="grid gap-5 sm:grid-cols-2">
    <div className="sm:col-span-2"><Field label="Título do caso" name="titulo" value={data.titulo} onChange={onChange} placeholder="Ex.: Fernando x Belfort" /></div>
    <div className="sm:col-span-2"><Field label="Nome completo" name="RECL_NOME" value={data.RECL_NOME} onChange={onChange} required /></div>
    <Field label="Nacionalidade" name="RECL_NACIONALIDADE" value={data.RECL_NACIONALIDADE} onChange={onChange} />
    <Field label="Estado civil" name="RECL_ESTADOCIVIL" value={data.RECL_ESTADOCIVIL} onChange={onChange} />
    <Field label="RG" name="RECL_RG" value={data.RECL_RG} onChange={onChange} />
    <Field label="CPF" name="RECL_CPF" value={data.RECL_CPF} onChange={onChange} required format="cpf" />
    <Field label="PIS" name="RECL_PIS" value={data.RECL_PIS} onChange={onChange} />
    <Field label="CTPS (número)" name="RECL_CTPS" value={data.RECL_CTPS} onChange={onChange} />
    <Field label="CTPS (série)" name="RECL_SERIE" value={data.RECL_SERIE} onChange={onChange} />
    <Field label="Data de nascimento" name="RECL_NASC" value={data.RECL_NASC} onChange={onChange} type="date" />
    <div className="sm:col-span-2"><Field label="Filiação" name="RECL_FILIACAO" value={data.RECL_FILIACAO} onChange={onChange} /></div>
    <div className="sm:col-span-2"><Field label="Endereço (logradouro)" name="RECL_ENDERECO" value={data.RECL_ENDERECO} onChange={onChange} /></div>
    <Field label="CEP" name="RECL_CEP" value={data.RECL_CEP} onChange={onChange} />
    <Field label="E-mail" name="email" value={data.email} onChange={onChange} type="email" />
    <Field label="Telefone" name="telefone" value={data.telefone} onChange={onChange} format="phone" />
  </div></SectionCard>;
}