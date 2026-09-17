// Gera um documento Word (.doc) a partir de HTML compatível com o Word,
// seguindo o estilo do modelo de entrevista jurídica: página 1 com
// identificação do cliente em parágrafo corrido + reclamadas; página 2
// com as seções em checklist; página 3 com fatos narrados.
import { TIPO_DISPENSA_OPTIONS } from "@/lib/interviewOptions";

const fmtDate = (v) => {
  if (!v) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
};
const txt = (v) => (v === undefined || v === null || v === "" ? "" : String(v));
const esc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const check = (v) => (v === true ? "(x)" : "( )");
const checkVal = (val, target) => (val === target ? "(x)" : "( )");
const dispensaLabel = (v) => TIPO_DISPENSA_OPTIONS.find((o) => o.value === v)?.label || "";

const RECLAMADAS = [
  { n: "1ª RECLAMADA", nome: "RECL1_NOME", cnpj: "RECL1_CNPJ", log: "RECL1_LOGRADOURO", compl: "RECL1_ENDCOMPL", cep: "RECL1_CEP", tempo: "RECL1_TEMPO_LABORADO", escala: "RECL1_ESCALA_HORARIO" },
  { n: "2ª RECLAMADA", nome: "RECL2_NOME", cnpj: "RECL2_CNPJ", log: "RECL2_LOGRADOURO", compl: "RECL2_ENDCOMPL", cep: "RECL2_CEP", tempo: "RECL2_TEMPO_LABORADO", escala: "RECL2_ESCALA_HORARIO" },
  { n: "3ª RECLAMADA", nome: "RECL3_NOME", cnpj: "RECL3_CNPJ", log: "RECL3_LOGRADOURO", compl: "RECL3_ENDCOMPL", cep: "RECL3_CEP", tempo: "RECL3_TEMPO_LABORADO", escala: "RECL3_ESCALA_HORARIO" },
  { n: "4ª RECLAMADA", nome: "RECL4_NOME", cnpj: "RECL4_CNPJ", log: "RECL4_LOGRADOURO", compl: "RECL4_ENDCOMPL", cep: "RECL4_CEP", tempo: "RECL4_TEMPO_LABORADO", escala: "RECL4_ESCALA_HORARIO" },
];

const LOGO_URL = "https://media.base44.com/images/public/6a734d6c72c1f853994b8733/0dbb0b8f0_image.png";

function buildIdentificacaoCliente(d) {
  const nome = (txt(d.RECL_NOME) || "").toUpperCase();
  const partes = [];
  const nasc = fmtDate(d.RECL_NASC);
  if (nasc) partes.push(`nascido(a) em ${nasc}`);
  if (txt(d.RECL_NACIONALIDADE)) partes.push(txt(d.RECL_NACIONALIDADE));
  if (txt(d.RECL_ESTADOCIVIL)) partes.push(txt(d.RECL_ESTADOCIVIL));
  if (txt(d.RECL_RG)) partes.push(`portador(a) da cédula de identidade com RG: ${txt(d.RECL_RG)}`);
  if (txt(d.RECL_CPF)) partes.push(`CPF/MF nº ${txt(d.RECL_CPF)}`);
  if (txt(d.RECL_PIS)) partes.push(`PIS nº ${txt(d.RECL_PIS)}`);
  if (txt(d.RECL_SERIE)) partes.push(`Série nº ${txt(d.RECL_SERIE)}`);
  if (txt(d.RECL_CTPS)) partes.push(`CTPS nº ${txt(d.RECL_CTPS)}`);
  if (txt(d.RECL_FILIACAO)) partes.push(`filho(a) de ${txt(d.RECL_FILIACAO)}`);
  if (txt(d.RECL_ENDERECO) || txt(d.RECL_CEP))
    partes.push(`residente e domiciliado(a) ${txt(d.RECL_ENDERECO) ? "na " + txt(d.RECL_ENDERECO) : ""}${txt(d.RECL_CEP) ? ", CEP: " + txt(d.RECL_CEP) : ""}`);
  if (txt(d.email)) partes.push(`e-mail: ${txt(d.email)}`);
  if (txt(d.telefone)) partes.push(`telefone nº ${txt(d.telefone)}`);

  const resto = partes.join(", ");
  const paragrafo = resto ? `${resto}.` : "";
  return `
    <p style="text-align:justify;text-indent:1cm;margin:0 0 14pt 0;">
      <b>${esc(nome)}</b>${paragrafo ? ", " + esc(paragrafo) : ""}
    </p>`;
}

function buildReclamadas(d) {
  const blocos = RECLAMADAS.filter((r) => txt(d[r.nome]) || txt(d[r.cnpj]))
    .map((r) => {
      const endereco = [txt(d[r.log]), txt(d[r.compl])].filter(Boolean).join(" - ");
      const campos = [
        ["CNPJ/MF", txt(d[r.cnpj])],
        ["ENDEREÇO", endereco],
        ["CEP", txt(d[r.cep])],
        ["CARGO", txt(d.FUNCAO)],
        ["TEMPO LABORADO", txt(d[r.tempo])],
        ["ESCALA/HORÁRIO", txt(d[r.escala])],
      ]
        .filter(([, v]) => v)
        .map(([k, v]) => `<p style="margin:0 0 6pt 0;"><b>${k}:</b> ${esc(v)}</p>`)
        .join("");
      return `
        <p style="margin:10pt 0 6pt 0;"><b><u>${r.n}:  ${esc(txt(d[r.nome]).toUpperCase())}</u></b></p>
        <div style="margin-left:0.5cm;">${campos}</div>`;
    })
    .join("");
  return blocos || `<p style="margin:6pt 0;">Nenhuma reclamada informada.</p>`;
}

function buildSecao(num, titulo, linhas) {
  return `
    <p style="margin:6pt 0 4pt 0;"><b>${num}. ${esc(titulo)}</b></p>
    <div style="margin-left:0.4cm;">
      ${linhas.map((l) => `<p style="margin:0 0 3pt 0;">${esc(l)}</p>`).join("")}
    </div>`;
}

function buildSecoes(d) {
  const secs = [];

  // 1. Tipo de dispensa
  const dispOpts = [
    { label: "Justa causa", val: "reversao_justa_causa" },
    { label: "Sem justa causa", val: "sem_justa_causa" },
    { label: "Pedido de demissão", val: "nulidade_pedido_demissao" },
    { label: "Rescisão indireta", val: "rescisao_indireta" },
  ];
  const ultimoDia = fmtDate(d.DATA_RESCISAO) || fmtDate(d.ULTIMO_DIA_TRABALHADO);
  const dispLines = dispOpts.map((o) => `${checkVal(d.tipo_dispensa, o.val)} ${o.label}`);
  if (ultimoDia) dispLines.push(`Último dia trabalhado: ${ultimoDia}`);
  secs.push({ t: "Tipo de Dispensa", lines: dispLines });

  // 2. Benefícios
  const benLines = [];
  if (d.vale_refeicao === true || txt(d.VALOR_VALE_REFEICAO)) benLines.push(`Vale-refeição: ${txt(d.VALOR_VALE_REFEICAO) || "Sim"}`);
  if (d.vale_alimentacao === true || txt(d.VALOR_AUX_ALIMENTACAO)) benLines.push(`Vale-alimentação: ${txt(d.VALOR_AUX_ALIMENTACAO) || "Sim"}`);
  if (d.vale_transporte === true || txt(d.VAL_CONDUCAO)) benLines.push(`Vale-transporte: ${txt(d.VAL_CONDUCAO) || "Sim"}`);
  if (!benLines.length) benLines.push("Nenhum benefício informado");
  secs.push({ t: "Benefícios", lines: benLines });

  // 3. Jornada de trabalho
  secs.push({ t: "Jornada de Trabalho", lines: [
    "Trabalhou em finais de semana e feriados:",
    `${check(d.finais_semana)} Sim  ${check(d.finais_semana === false)} Não`,
  ]});

  // 4. Férias
  const ferLines = ["Possuiu férias:", `${check(d.ferias)} Sim  ${check(d.ferias === false)} Não`];
  if (d.ferias === true && txt(d.ferias_quantidade)) ferLines.push(`Quantidade: ${d.ferias_quantidade}`);
  secs.push({ t: "Férias", lines: ferLines });

  // 5. Folgas trabalhadas
  const ftLines = [`${check(d.folgas_trabalhadas)} Sim  ${check(d.folgas_trabalhadas === false)} Não`];
  if (d.folgas_trabalhadas === true) {
    if (txt(d.FT_QTD_MEDIA)) ftLines.push(`Quantidade: ${d.FT_QTD_MEDIA}`);
    if (txt(d.VAL_FT)) ftLines.push(`Valor recebido: ${d.VAL_FT}`);
    if (txt(d.ft_pagamento)) ftLines.push(`Forma de recebimento: ${d.ft_pagamento}`);
    ftLines.push("Possui comprovante de pagamento:", `${check(d.ft_comprovante)} Sim  ${check(d.ft_comprovante === false)} Não`);
    if (txt(d.SALARIOS_ABERTO)) ftLines.push(`Salários em aberto: ${d.SALARIOS_ABERTO}`);
    if (txt(d.VALOR_POR_FORA)) ftLines.push(`Valor por fora: ${d.VALOR_POR_FORA}`);
  }
  secs.push({ t: "Folgas Trabalhadas (FT)", lines: ftLines });

  // 6. Intervalo
  const intLines = ["Horário de almoço suprimido", `${check(d.intervalo_suprimido)} Sim  ${check(d.intervalo_suprimido === false)} Não`];
  if (d.intervalo_suprimido === true && txt(d.INTERVALO_USUFRUIDO)) intLines.push(`Quanto tempo em média: ${d.INTERVALO_USUFRUIDO}`);
  secs.push({ t: "Intervalo Intrajornada", lines: intLines });

  // 7. Horas extras
  const heLines = [`${check(d.horas_extras)} Sim  ${check(d.horas_extras === false)} Não`];
  if (d.horas_extras === true) {
    if (txt(d.media_horas_extras)) heLines.push(`Média de horas extras: ${d.media_horas_extras}`);
    if (txt(d.periodo_antecedente)) heLines.push(`Período antecedente à jornada: ${d.periodo_antecedente}`);
    if (txt(d.periodo_sucedente)) heLines.push(`Período sucedente: ${d.periodo_sucedente}`);
    if (d.controle_ponto !== undefined) heLines.push(`Controle de ponto: ${d.controle_ponto ? "Sim" : "Não"}${txt(d.formato_ponto) ? " — " + d.formato_ponto : ""}`);
  }
  secs.push({ t: "Horas Extras", lines: heLines });

  // 8. Acúmulo
  const acLines = [`${check(d.acumulo_funcao)} Sim  ${check(d.acumulo_funcao === false)} Não`];
  if (d.acumulo_funcao === true && txt(d.funcoes_acumuladas)) acLines.push(`Quais funções: ${d.funcoes_acumuladas}`);
  secs.push({ t: "Acúmulo/Desvio de função", lines: acLines });

  // 9. Condições
  secs.push({ t: "Condições de Trabalho", lines: [
    "Utilizava armamento e colete:",
    `${check(d.armamento_colete)} Sim  ${check(d.armamento_colete === false)} Não`,
  ]});

  // 10. Gratificações
  const gratLines = ["Recebe algum tipo de gratificação:", `${check(d.gratificacao)} Sim  ${check(d.gratificacao === false)} Não`];
  if (d.gratificacao === true && txt(d.gratificacao_qual)) gratLines.push(`Qual: ${d.gratificacao_qual}`);
  if (d.assiduidade === true) {
    if (txt(d.assiduidade_prometido)) gratLines.push(`Assiduidade prometida: ${d.assiduidade_prometido}`);
    if (txt(d.assiduidade_pago)) gratLines.push(`Assiduidade paga: ${d.assiduidade_pago}`);
  }
  secs.push({ t: "Gratificações", lines: gratLines });

  // 11. Documentos
  secs.push({ t: "Documentos", lines: [
    "Holerites:", `${check(d.holerites)} Sim  ${check(d.holerites === false)} Não`,
    "Rescisão contratual:", `${check(d.rescisao_contratual)} Sim  ${check(d.rescisao_contratual === false)} Não`,
    "Espelho de ponto:", `${check(d.espelho_ponto)} Sim  ${check(d.espelho_ponto === false)} Não`,
  ]});

  // 12. Descontos
  const descLines = ["Houve desconto indevido:", `${check(d.desconto_indevido)} Sim  ${check(d.desconto_indevido === false)} Não`];
  if (d.desconto_indevido === true && txt(d.desconto_qual)) descLines.push(`Qual: ${d.desconto_qual}`);
  secs.push({ t: "Descontos", lines: descLines });

  // 13. Saúde
  const saudeLines = [
    "Doença ou acidente de trabalho:", `${check(d.tem_doenca)} Sim  ${check(d.tem_doenca === false)} Não`,
    "Insalubridade:", `${check(d.tem_insalubridade)} Sim  ${check(d.tem_insalubridade === false)} Não`,
    "Periculosidade:", `${check(d.tem_periculosidade)} Sim  ${check(d.tem_periculosidade === false)} Não`,
  ];
  if (txt(d.produtos)) saudeLines.push(`Quais produtos: ${d.produtos}`);
  if (txt(d.epi)) saudeLines.push(`Utilizava EPI: ${d.epi}`);
  secs.push({ t: "Saúde e Segurança", lines: saudeLines });

  // 14. Testemunha
  const temVal = txt(d.testemunha);
  secs.push({ t: "Testemunha", lines: [
    `${checkVal(temVal, "Sim")} Sim  ${checkVal(temVal, "Não")} Não`,
    `${checkVal(temVal, "Irá verificar")} Irá Verificar`,
  ]});

  return secs;
}

function buildHtml(d) {
  const mid = Math.ceil(buildSecoes.length / 2);
  const secs = buildSecoes(d);
  const half = Math.ceil(secs.length / 2);
  const col1 = secs.slice(0, half);
  const col2 = secs.slice(half);
  const renderCol = (arr, offset) =>
    arr.map((s, i) => buildSecao(offset + i + 1, s.t, s.lines)).join("");

  const fatos = txt(d.fatos_narrados);

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>Entrevista — ${esc(txt(d.RECL_NOME))}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
  @page { size: A4; margin: 2.5cm; }
  @page Section1 { mso-page-orientation: portrait; }
  body { font-family: 'Times New Roman', serif; font-size: 11pt; color:#000; }
  p { line-height:1.35; }
  .logo { text-align:center; margin-bottom:10pt; }
  .logo img { max-width:180px; max-height:65px; }
  .doc-title { text-align:center; font-weight:bold; font-size:12pt; margin:14pt 0; }
  .sec-title { text-align:center; font-weight:bold; font-size:12pt; text-decoration:underline; margin:18pt 0 8pt; }
  .pagebreak { page-break-before: always; }
  table.cols { width:100%; border-collapse:collapse; }
  table.cols td { width:50%; vertical-align:top; padding:0 8pt; }
  .fatos { text-align:justify; }
  .footer { font-size:8pt; color:#999; text-align:center; margin-top:20pt; }
</style>
</head>
<body>

<div class="logo"><img src="${LOGO_URL}" alt="logo"></div>
<p class="doc-title">(ENTREVISTA)</p>

<p class="sec-title">IDENTIFICAÇÃO DO(A) CLIENTE</p>
${buildIdentificacaoCliente(d)}

<p class="sec-title">IDENTIFICAÇÃO DO(S) RECLAMADO(S)</p>
${buildReclamadas(d)}

<div class="pagebreak"></div>

<table class="cols"><tr>
  <td>${renderCol(col1, 0)}</td>
  <td>${renderCol(col2, half)}</td>
</tr></table>

${fatos ? `
<div class="pagebreak"></div>
<p class="sec-title">FATOS NARRADOS PELO RECLAMANTE</p>
<p class="fatos">${esc(fatos)}</p>
` : ""}

<p class="footer">Gerado em ${new Date().toLocaleString("pt-BR")}</p>
</body>
</html>`;
}

export function generateInterviewDoc(data) {
  const html = buildHtml(data);
  const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = (txt(data.RECL_NOME) || "entrevista")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  a.download = `${safeName}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}