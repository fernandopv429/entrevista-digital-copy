import { jsPDF } from "jspdf";
import { TIPO_DISPENSA_OPTIONS } from "@/lib/interviewOptions";

const fmtDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
};
const txt = (v) => (v === undefined || v === null || v === "" ? null : String(v));
const bool = (v) => (v === true ? "Sim" : v === false ? "Não" : null);
const check = (v) => (v === true ? "(x)" : "( )");
const dispensaLabel = (v) => TIPO_DISPENSA_OPTIONS.find((o) => o.value === v)?.label || txt(v);

const RECLAMADAS = [
  { n: "1ª RECLAMADA", nome: "RECL1_NOME", cnpj: "RECL1_CNPJ", log: "RECL1_LOGRADOURO", compl: "RECL1_ENDCOMPL", cep: "RECL1_CEP", tempo: "RECL1_TEMPO_LABORADO", escala: "RECL1_ESCALA_HORARIO" },
  { n: "2ª RECLAMADA", nome: "RECL2_NOME", cnpj: "RECL2_CNPJ", log: "RECL2_LOGRADOURO", compl: "RECL2_ENDCOMPL", cep: "RECL2_CEP", tempo: "RECL2_TEMPO_LABORADO", escala: "RECL2_ESCALA_HORARIO" },
  { n: "3ª RECLAMADA", nome: "RECL3_NOME", cnpj: "RECL3_CNPJ", log: "RECL3_LOGRADOURO", compl: "RECL3_ENDCOMPL", cep: "RECL3_CEP", tempo: "RECL3_TEMPO_LABORADO", escala: "RECL3_ESCALA_HORARIO" },
  { n: "4ª RECLAMADA", nome: "RECL4_NOME", cnpj: "RECL4_CNPJ", log: "RECL4_LOGRADOURO", compl: "RECL4_ENDCOMPL", cep: "RECL4_CEP", tempo: "RECL4_TEMPO_LABORADO", escala: "RECL4_ESCALA_HORARIO" },
];

const LOGO_URL = "https://media.base44.com/images/public/6a734d6c72c1f853994b8733/0dbb0b8f0_image.png";
let logoCache = null;
async function loadLogo() {
  if (logoCache) return logoCache;
  try {
    const res = await fetch(LOGO_URL);
    const blob = await res.blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const dims = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = dataUrl;
    });
    logoCache = { dataUrl, width: dims.width, height: dims.height };
  } catch { logoCache = null; }
  return logoCache;
}

export async function generateInterviewPdf(data) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 60;
  const contentW = pageW - marginX * 2;
  let y = 50;

  const newPage = () => { doc.addPage(); y = 50; };
  const ensure = (need) => { if (y + need > pageH - 50) newPage(); };

  // ── helpers de tipografia ──────────────────────────────────────────────────
  const setTitle = () => { doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(0, 0, 0); };
  const setBody = () => { doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(0, 0, 0); };
  const setBold = () => { doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(0, 0, 0); };

  // Escreve texto com wrap e retorna nova posição y
  const writeText = (text, x, startY, maxW, opts = {}) => {
    const lines = doc.splitTextToSize(String(text), maxW);
    lines.forEach((line, i) => {
      doc.text(line, x, startY + i * 15, opts);
    });
    return startY + lines.length * 15;
  };

  // ── CABEÇALHO ─────────────────────────────────────────────────────────────
  const logo = await loadLogo();
  if (logo && logo.width) {
    const maxW = 180; const maxH = 65;
    const scale = Math.min(maxW / logo.width, maxH / logo.height);
    const lw = logo.width * scale; const lh = logo.height * scale;
    doc.addImage(logo.dataUrl, "PNG", (pageW - lw) / 2, y, lw, lh);
    y += lh + 14;
  } else {
    setBold(); doc.text("FERNANDO VIEIRA ADVOGADOS", pageW / 2, y + 12, { align: "center" }); y += 26;
  }

  // Título "(ENTREVISTA)" centralizado e negrito
  setBold(); doc.setFontSize(11);
  doc.text("(ENTREVISTA)", pageW / 2, y, { align: "center" });
  y += 30;

  // ── SEÇÃO: IDENTIFICAÇÃO DO CLIENTE ───────────────────────────────────────
  setTitle(); doc.setFontSize(12);
  const titleIdCliente = "IDENTIFICAÇÃO DO(A) CLIENTE";
  const titleW = doc.getTextWidth(titleIdCliente);
  doc.text(titleIdCliente, pageW / 2, y, { align: "center" });
  // sublinhado manual
  doc.setDrawColor(0); doc.setLineWidth(0.5);
  doc.line((pageW - titleW) / 2, y + 2, (pageW + titleW) / 2, y + 2);
  y += 26;

  // Parágrafo corrido do cliente (estilo jurídico)
  const nome = (txt(data.RECL_NOME) || "").toUpperCase();
  const nasc = fmtDate(data.RECL_NASC);
  const nac = txt(data.RECL_NACIONALIDADE) || "brasileiro(a)";
  const civil = txt(data.RECL_ESTADOCIVIL) || "";
  const rg = txt(data.RECL_RG);
  const cpf = txt(data.RECL_CPF);
  const pis = txt(data.RECL_PIS);
  const serie = txt(data.RECL_SERIE);
  const ctps = txt(data.RECL_CTPS);
  const filia = txt(data.RECL_FILIACAO);
  const end = txt(data.RECL_ENDERECO);
  const cep = txt(data.RECL_CEP);
  const email = txt(data.email);
  const tel = txt(data.telefone);

  // Monta parágrafo linha a linha para poder mesclar bold+normal via jsPDF
  // Como jsPDF não suporta rich text inline, usamos uma abordagem de concat
  // e depois destacamos o nome em negrito com posicionamento manual.
  const partes = [];
  if (nasc) partes.push(`nascido(a) em ${nasc}`);
  if (nac) partes.push(nac);
  if (civil) partes.push(civil);
  if (rg) partes.push(`portador(a) da cédula de identidade com RG: ${rg}`);
  if (cpf) partes.push(`CPF/MF nº ${cpf}`);
  if (pis) partes.push(`PIS nº ${pis}`);
  if (serie) partes.push(`Série nº ${serie}`);
  if (ctps) partes.push(`CTPS nº ${ctps}`);
  if (filia) partes.push(`filho(a) de ${filia}`);
  if (end || cep) partes.push(`residente e domiciliado(a) ${end ? `na ${end}` : ""}${cep ? `, CEP: ${cep}` : ""}`);
  if (email) partes.push(`e-mail: ${email}`);
  if (tel) partes.push(`telefone nº ${tel}`);

  // Renderiza: nome em negrito, restante normal, texto justificado
  ensure(60);
  setBold();
  const nomeW = doc.getTextWidth(nome + " ");
  const restoParagrafo = partes.join(", ");
  const paragrafoCompleto = `${nome}, ${restoParagrafo}`;
  const linhas = doc.splitTextToSize(paragrafoCompleto, contentW);

  // Primeira linha tem o nome em bold, demais em normal
  // Fazemos todas as linhas em normal mas a primeira com nome em bold manualmente
  setBody();
  const firstLine = linhas[0];
  const nomeEndIndex = firstLine.indexOf(", ");
  if (nomeEndIndex > 0) {
    const nomePart = firstLine.substring(0, nomeEndIndex);
    const restPart = firstLine.substring(nomeEndIndex);
    setBold();
    doc.text(nomePart, marginX, y);
    const npW = doc.getTextWidth(nomePart);
    setBody();
    doc.text(restPart, marginX + npW, y);
    y += 15;
    for (let i = 1; i < linhas.length; i++) {
      ensure(15);
      doc.text(linhas[i], marginX, y);
      y += 15;
    }
  } else {
    setBold(); y = writeText(paragrafoCompleto, marginX, y, contentW); setBody();
  }
  y += 22;

  // ── SEÇÃO: IDENTIFICAÇÃO DO(S) RECLAMADO(S) ───────────────────────────────
  ensure(30);
  setTitle(); doc.setFontSize(12);
  const titleRecl = "IDENTIFICAÇÃO DO(S) RECLAMADO(S)";
  const titleRW = doc.getTextWidth(titleRecl);
  doc.text(titleRecl, pageW / 2, y, { align: "center" });
  doc.line((pageW - titleRW) / 2, y + 2, (pageW + titleRW) / 2, y + 2);
  y += 24;

  RECLAMADAS.forEach((r) => {
    const hasData = data[r.nome] || data[r.cnpj];
    if (!hasData) return;
    ensure(80);

    // Label "Nª RECLAMADA: NOME" em negrito e sublinhado
    setBold(); doc.setFontSize(10);
    const labelRecl = `${r.n}:  ${(txt(data[r.nome]) || "").toUpperCase()}`;
    doc.text(labelRecl, marginX, y);
    const lrW = doc.getTextWidth(labelRecl);
    doc.line(marginX, y + 2, marginX + lrW, y + 2);
    y += 20;

    // Campos em bloco estilo formulário
    setBody();
    const campos = [
      ["CNPJ/MF", txt(data[r.cnpj])],
      ["ENDEREÇO", [data[r.log], data[r.compl]].filter(Boolean).join(" - ") || null],
      ["CEP", txt(data[r.cep])],
      ["CARGO", txt(data.FUNCAO)],
      ["TEMPO LABORADO", txt(data[r.tempo])],
      ["ESCALA/HORARIO", txt(data[r.escala])],
    ];
    campos.forEach(([label, val]) => {
      if (!val) return;
      ensure(16);
      const lbl = `${label}:  `;
      setBold();
      doc.text(lbl, marginX, y);
      const lw2 = doc.getTextWidth(lbl);
      setBody();
      const lines2 = doc.splitTextToSize(val, contentW - lw2);
      doc.text(lines2[0], marginX + lw2, y);
      y += 15;
      for (let i = 1; i < lines2.length; i++) {
        ensure(15); doc.text(lines2[i], marginX + lw2, y); y += 15;
      }
    });
    y += 14;
  });

  // ── PÁGINA 2: SEÇÕES CHECKLIST ────────────────────────────────────────────
  newPage();

  // Renderiza seção numerada com bullet list
  let secNum = 0;

  const renderSec = (title, items) => {
    ensure(20);
    setBold(); doc.setFontSize(10);
    doc.text(`${++secNum}. ${title}`, marginX, y);
    y += 14;
    items.forEach(({ text, sub }) => {
      ensure(13);
      setBody();
      if (sub) {
        doc.text(`   • ${text}`, marginX, y);
      } else {
        doc.text(text, marginX, y);
      }
      y += 13;
    });
    y += 6;
  };

  // Layout 2 colunas: col1 e col2 armazenam seções; depois renderizamos intercalado
  // Para fidelidade ao modelo, fazemos layout de 2 colunas lado a lado
  const col1X = marginX;
  const col2X = pageW / 2 + 10;
  const colW = pageW / 2 - marginX - 10;

  // Captura seções em arrays e renderiza em 2 colunas
  const buildSections = (d) => {
    const secs = [];

    // 1. Tipo de dispensa
    const dispOpts = [
      { label: "Justa causa", val: "reversao_justa_causa" },
      { label: "Sem justa causa", val: "sem_justa_causa" },
      { label: "Pedido de demissão", val: "nulidade_pedido_demissao" },
      { label: "Rescisão indireta", val: "rescisao_indireta" },
    ];
    const ultimoDia = fmtDate(d.DATA_RESCISAO) || fmtDate(d.ULTIMO_DIA_TRABALHADO);
    const dispItems = dispOpts.map(o => ({ text: `${d.tipo_dispensa === o.val ? "(x)" : "( )"} ${o.label}` }));
    if (ultimoDia) dispItems.push({ text: `Último dia trabalhado: ${ultimoDia}`, sub: false });
    secs.push({ title: "Tipo de Dispensa", items: dispItems });

    // 2. Benefícios
    const benItems = [];
    if (d.vale_refeicao === true || d.VALOR_VALE_REFEICAO) benItems.push({ text: `Vale-refeição: ${txt(d.VALOR_VALE_REFEICAO) || "Sim"}`, sub: true });
    if (d.vale_alimentacao === true || d.VALOR_AUX_ALIMENTACAO) benItems.push({ text: `Vale-alimentação: ${txt(d.VALOR_AUX_ALIMENTACAO) || "Sim"}`, sub: true });
    if (d.vale_transporte === true || d.VAL_CONDUCAO) benItems.push({ text: `Vale-transporte: ${txt(d.VAL_CONDUCAO) || "Sim"}`, sub: true });
    if (!benItems.length) benItems.push({ text: "Nenhum benefício informado" });
    secs.push({ title: "Benefícios", items: benItems });

    // 3. Jornada de trabalho
    secs.push({ title: "Jornada de Trabalho", items: [
      { text: "Trabalhou em finais de semana e feriados:", sub: true },
      { text: `${check(d.finais_semana)} Sim  ${check(d.finais_semana === false)} Não`, sub: true },
    ]});

    // 4. Férias
    const ferItems = [
      { text: "Possuiu férias:", sub: true },
      { text: `${check(d.ferias)} Sim  ${check(d.ferias === false)} Não`, sub: true },
    ];
    if (d.ferias === true && d.ferias_quantidade) ferItems.push({ text: `Quantidade: ${d.ferias_quantidade}`, sub: true });
    secs.push({ title: "Férias", items: ferItems });

    // 5. Folgas trabalhadas
    const ftItems = [
      { text: `${check(d.folgas_trabalhadas)} Sim  ${check(d.folgas_trabalhadas === false)} Não` },
    ];
    if (d.folgas_trabalhadas === true) {
      if (d.FT_QTD_MEDIA) ftItems.push({ text: `Quantidade: ${d.FT_QTD_MEDIA}`, sub: true });
      if (d.VAL_FT) ftItems.push({ text: `Valor recebido: ${d.VAL_FT}`, sub: true });
      if (d.ft_pagamento) ftItems.push({ text: `Forma de recebimento: ${d.ft_pagamento}`, sub: true });
      ftItems.push({ text: "Possui comprovante de pagamento:", sub: true });
      ftItems.push({ text: `${check(d.ft_comprovante)} Sim  ${check(d.ft_comprovante === false)} Não`, sub: true });
      if (d.SALARIOS_ABERTO) ftItems.push({ text: `Salários em aberto: ${d.SALARIOS_ABERTO}`, sub: true });
      if (d.VALOR_POR_FORA) ftItems.push({ text: `Valor por fora: ${d.VALOR_POR_FORA}`, sub: true });
    }
    secs.push({ title: "Folgas Trabalhadas (FT)", items: ftItems });

    // 6. Intervalo
    const intItems = [
      { text: "Horário de almoço suprimido" },
      { text: `${check(d.intervalo_suprimido)} Sim  ${check(d.intervalo_suprimido === false)} Não` },
    ];
    if (d.intervalo_suprimido === true && d.INTERVALO_USUFRUIDO) intItems.push({ text: `Quanto tempo em media: ${d.INTERVALO_USUFRUIDO}`, sub: true });
    secs.push({ title: "Intervalo Intrajornada", items: intItems });

    // 7. Horas extras
    const heItems = [
      { text: `${check(d.horas_extras)} Sim  ${check(d.horas_extras === false)} Não` },
    ];
    if (d.horas_extras === true) {
      if (d.media_horas_extras) heItems.push({ text: `Média de horas extras: ${d.media_horas_extras}`, sub: true });
      if (d.periodo_antecedente) heItems.push({ text: `Periodo antecedente a jornada: ${d.periodo_antecedente}`, sub: true });
      if (d.periodo_sucedente) heItems.push({ text: `Periodo sucedente: ${d.periodo_sucedente}`, sub: true });
      if (d.controle_ponto !== undefined) heItems.push({ text: `Controle de ponto: ${bool(d.controle_ponto)}${d.formato_ponto ? ` — ${d.formato_ponto}` : ""}`, sub: true });
    }
    secs.push({ title: "Horas Extras", items: heItems });

    // 8. Acúmulo
    const acItems = [
      { text: `${check(d.acumulo_funcao)} Sim  ${check(d.acumulo_funcao === false)} Não`, sub: true },
    ];
    if (d.acumulo_funcao === true && d.funcoes_acumuladas) acItems.push({ text: `Quais funções: ${d.funcoes_acumuladas}`, sub: true });
    secs.push({ title: "Acumulo/Desvio de função:", items: acItems });

    // 9. Condições
    secs.push({ title: "Condições de Trabalho", items: [
      { text: "Utilizava armamento e colete:", sub: true },
      { text: `${check(d.armamento_colete)} Sim  ${check(d.armamento_colete === false)} Não`, sub: true },
    ]});

    // 10. Gratificações
    const gratItems = [
      { text: "Recebe algum tipo de gratificação:", sub: true },
      { text: `${check(d.gratificacao)} Sim  ${check(d.gratificacao === false)} Não`, sub: true },
    ];
    if (d.gratificacao === true && d.gratificacao_qual) gratItems.push({ text: `Qual: ${d.gratificacao_qual}`, sub: true });
    if (d.assiduidade === true) {
      if (d.assiduidade_prometido) gratItems.push({ text: `Assiduidade prometida: ${d.assiduidade_prometido}`, sub: true });
      if (d.assiduidade_pago) gratItems.push({ text: `Assiduidade paga: ${d.assiduidade_pago}`, sub: true });
    }
    secs.push({ title: "Gratificações", items: gratItems });

    // 11. Documentos
    secs.push({ title: "Documentos", items: [
      { text: "Holerites:", sub: true },
      { text: `${check(d.holerites)} Sim  ${check(d.holerites === false)} Não`, sub: true },
      { text: "Rescisão contratual:", sub: true },
      { text: `${check(d.rescisao_contratual)} Sim  ${check(d.rescisao_contratual === false)} Não`, sub: true },
      { text: "Espelho de ponto:", sub: true },
      { text: `${check(d.espelho_ponto)} Sim  ${check(d.espelho_ponto === false)} Não`, sub: true },
    ]});

    // 12. Descontos
    const descItems = [
      { text: "Houve desconto indevido:", sub: true },
      { text: `${check(d.desconto_indevido)} Sim  ${check(d.desconto_indevido === false)} Não`, sub: true },
    ];
    if (d.desconto_indevido === true && d.desconto_qual) descItems.push({ text: `Qual: ${d.desconto_qual}`, sub: true });
    secs.push({ title: "Descontos", items: descItems });

    // 13. Saúde
    const saudeItems = [
      { text: "Doença ou acidente de trabalho:", sub: true },
      { text: `${check(d.tem_doenca)} Sim  ${check(d.tem_doenca === false)} Não`, sub: true },
      { text: "Insalubridade:", sub: true },
      { text: `${check(d.tem_insalubridade)} Sim  ${check(d.tem_insalubridade === false)} Não`, sub: true },
      { text: "Periculosidade:", sub: true },
      { text: `${check(d.tem_periculosidade)} Sim  ${check(d.tem_periculosidade === false)} Não`, sub: true },
    ];
    if (d.produtos) saudeItems.push({ text: `Quais produtos: ${d.produtos}`, sub: true });
    if (d.epi) saudeItems.push({ text: `Utilizava EPI: ${d.epi}`, sub: true });
    secs.push({ title: "Saúde e Segurança", items: saudeItems });

    // 14. Testemunha
    const temVal = txt(d.testemunha);
    secs.push({ title: "Testemunha", items: [
      { text: `${temVal === "Sim" ? "(x)" : "( )"} Sim  ${temVal === "Não" ? "(x)" : "( )"} Não` },
      { text: `${temVal === "Irá verificar" ? "(x)" : "( )"} Irá Verificar` },
    ]});

    return secs;
  };

  const sections = buildSections(data);

  // Divide seções em 2 colunas (col1: 1-7, col2: 8-14)
  const mid = Math.ceil(sections.length / 2);
  const col1Secs = sections.slice(0, mid);
  const col2Secs = sections.slice(mid);

  // Renderiza coluna: retorna altura máxima usada
  const renderColumn = (secs, startX, colWidth, startY) => {
    let cy = startY;
    let localNum = 0;
    secs.forEach((sec, idx) => {
      // Número global baseado no offset
      const globalNum = (startX === col1X ? 0 : mid) + idx + 1;
      cy += 4;
      setBold(); doc.setFontSize(10);
      const titleText = `${globalNum}. ${sec.title}`;
      const titleLines = doc.splitTextToSize(titleText, colWidth);
      titleLines.forEach(l => { doc.text(l, startX, cy); cy += 14; });
      cy += 5;
      sec.items.forEach(item => {
        setBody(); doc.setFontSize(9.5);
        const ix = item.sub ? startX + 8 : startX;
        const iw = item.sub ? colWidth - 8 : colWidth;
        const lines = doc.splitTextToSize(item.text, iw);
        lines.forEach(l => { doc.text(l, ix, cy); cy += 14; });
      });
      cy += 10;
    });
    return cy;
  };

  // Calcula alturas para saber se cabe em 1 página ou precisa de mais
  // Renderiza diretamente em 2 colunas
  const colStartY = y;
  const yAfterCol1 = renderColumn(col1Secs, col1X, colW, colStartY);
  const yAfterCol2 = renderColumn(col2Secs, col2X, colW, colStartY);
  y = Math.max(yAfterCol1, yAfterCol2) + 10;

  // ── PÁGINA 3: FATOS NARRADOS ──────────────────────────────────────────────
  if (txt(data.fatos_narrados)) {
    newPage();
    setTitle(); doc.setFontSize(12);
    const titleFatos = "FATOS NARRADOS PELO RECLAMANTE";
    const tfW = doc.getTextWidth(titleFatos);
    doc.text(titleFatos, pageW / 2, y, { align: "center" });
    doc.setDrawColor(0); doc.setLineWidth(0.5);
    doc.line((pageW - tfW) / 2, y + 2, (pageW + tfW) / 2, y + 2);
    y += 22;

    setBody(); doc.setFontSize(11);
    const fatosLines = doc.splitTextToSize(txt(data.fatos_narrados), contentW);
    fatosLines.forEach(l => { ensure(18); doc.text(l, marginX, y); y += 18; });
  }

  // ── RODAPÉ ────────────────────────────────────────────────────────────────
  const pages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Gerado em ${new Date().toLocaleString("pt-BR")} · Página ${p}/${pages}`,
      pageW / 2, pageH - 18, { align: "center" }
    );
  }

  const safeName = (data.RECL_NOME || "entrevista")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  doc.save(`${safeName}.pdf`);
}