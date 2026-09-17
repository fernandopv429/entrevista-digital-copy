import { secrets } from 'base44:runtime';

const SUFIXOS = ["SOCIEDADE SIMPLES", "LIMITADA", "LTDA", "EIRELI", "EPP", "MEI", "ME", "SS", "SA"];

function normalizarTexto(s) {
  if (!s) return "";
  return String(s)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function termoBusca(razao) {
  let n = normalizarTexto(razao);
  // "S.A" / "S/A" viram "S A" após a normalização (pontuação vira espaço).
  // Reagrupa para "SA" antes de remover os sufixos, senão a busca exata
  // por "... S A" não encontra a empresa correta.
  n = n.replace(/\bS\s+A\b/g, "SA");
  for (const sufixo of SUFIXOS) {
    n = n.replace(new RegExp("\\b" + sufixo + "\\b", "g"), " ");
  }
  // Descarta tokens isolados de 1 letra (ruído de abreviações tipo "S.A").
  return n.split(" ").filter(w => w.length > 1).join(" ").replace(/\s+/g, " ").trim();
}

function normalizarCep(cep) {
  if (!cep) return null;
  const d = String(cep).replace(/\D/g, "");
  if (!d) return null;
  if (d.length > 8) return null;
  return d.padStart(8, "0");
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function similaridade(a, b) {
  const na = normalizarTexto(a);
  const nb = normalizarTexto(b);
  if (!na && !nb) return 1;
  if (!na || !nb) return 0;
  const d = levenshtein(na, nb);
  return 1 - d / Math.max(na.length, nb.length);
}

function proporcaoPalavras(input, target) {
  const wi = normalizarTexto(input).split(" ").filter(w => w.length > 2);
  const wt = new Set(normalizarTexto(target).split(" ").filter(w => w.length > 2));
  if (!wi.length) return 0;
  const presentes = wi.filter(w => wt.has(w)).length;
  return presentes / wi.length;
}

function scoreEndereco(inputEnd, end) {
  const endItem = [end?.logradouro, end?.numero, end?.complemento, end?.bairro].filter(Boolean).join(" ");
  const sim = similaridade(inputEnd || "", endItem);
  const prop = proporcaoPalavras(inputEnd || "", endItem);
  return 0.4 * sim + 0.6 * prop;
}

function formatCnpj(c) {
  const d = String(c || "").replace(/\D/g, "").padStart(14, "0");
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

function matrizFilialTexto(mf) {
  if (!mf) return "—";
  if (typeof mf === "string") return mf;
  return mf.descricao || mf.tipo || "—";
}

async function executarPesquisa(body) {
  body.situacao_cadastral = ["ATIVA"];
  if (!body.limite) body.limite = 20;
  const res = await fetch("https://api.casadosdados.com.br/v5/cnpj/pesquisa?tipo_resultado=completo", {
    method: "POST",
    headers: {
      "api-key": secrets.get("CASA_DOS_DADOS_API_KEY"),
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": "localizador-cnpj/1.0"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const t = await res.text();
      if (t) msg += ` — ${t.slice(0, 200)}`;
    } catch (_) {}
    return { erro: true, status: res.status, msg };
  }
  const json = await res.json();
  return { erro: false, json };
}

// Busca por razão social / nome fantasia (texto), usando endereço como filtro.
function corpoTextual(termo, municipio, uf, cep) {
  const body = {
    busca_textual: [{
      texto: [termo],
      tipo_busca: "exata",
      razao_social: true,
      nome_fantasia: true
    }]
  };
  if (municipio) body.municipio = [municipio];
  if (uf) body.uf = [uf];
  if (cep) body.cep = [cep];
  return body;
}

// Busca somente por endereço (CEP, município/UF, bairro, número), sem texto.
// Não há busca textual por logradouro na API, então usamos os filtros de campo.
function corpoEndereco(municipio, uf, cep, numero) {
  const body = {};
  if (cep) body.cep = [cep];
  if (municipio) body.municipio = [municipio];
  if (uf) body.uf = [uf];
  if (numero) body.endereco_numero = [numero];
  return body;
}

function extrairNumero(logradouro) {
  if (!logradouro) return null;
  const m = String(logradouro).match(/(\d+[A-Za-z]?)\s*$/);
  return m ? m[1] : null;
}

function consultar(termo, municipio, uf, cep) {
  return executarPesquisa(corpoTextual(termo, municipio, uf, cep));
}

function consultarPorEndereco(municipio, uf, cep, numero) {
  return executarPesquisa(corpoEndereco(municipio, uf, cep, numero));
}

export default async function(req) {
  try {
    const payload = await req.json();
    const razao = (payload.razao_social || "").trim();
    const endereco = payload.endereco || "";
    const municipio = normalizarTexto(payload.municipio);
    const uf = normalizarTexto(payload.uf).substring(0, 2);
    const cep = normalizarCep(payload.cep);

    const numero = extrairNumero(endereco);

    let json = null;
    let erroInfo = null;

    if (razao) {
      const termo = termoBusca(razao);
      if (!termo) return Response.json({ status: "empty", total: 0, candidatos: [], ambiguo: false });
      for (let tentativa = 1; tentativa <= 3; tentativa++) {
        const r = await consultar(termo, municipio, uf, cep);
        if (r.erro) { erroInfo = r; break; }
        if (r.json.total > 0 || tentativa === 3) { json = r.json; break; }
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } else if (cep || (municipio && uf)) {
      // Busca por endereço quando não há razão social.
      for (let tentativa = 1; tentativa <= 3; tentativa++) {
        const r = await consultarPorEndereco(municipio, uf, cep, numero);
        if (r.erro) { erroInfo = r; break; }
        if (r.json.total > 0 || tentativa === 3) { json = r.json; break; }
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } else {
      return Response.json({ status: "error", mensagem: "Informe a razão social ou o endereço (CEP ou cidade/UF)." }, { status: 400 });
    }

    if (erroInfo) {
      return Response.json({ status: "error", mensagem: erroInfo.msg, codigo: erroInfo.status }, { status: 502 });
    }

    const cnpjs = json.cnpjs || [];
    const termoNorm = normalizarTexto(razao);

    const candidatos = cnpjs.map(item => {
      const razaoItemNorm = normalizarTexto(item.razao_social);
      const razaoIdentica = razaoItemNorm === termoNorm;
      const score = scoreEndereco(endereco, item.endereco);
      const end = item.endereco || {};
      const enderecoCompleto = [end.logradouro, end.numero && `, ${end.numero}`, end.complemento, end.bairro, end.municipio && `- ${end.municipio}`, end.uf].filter(Boolean).join(" ");
      const logradouro = [end.logradouro, end.numero].filter(Boolean).join(", ");
      const complemento = [end.municipio, end.uf].filter(Boolean).join("/");
      const cnaeSec = Array.isArray(item.atividade_secundaria) ? item.atividade_secundaria : [];
      return {
        cnpj: item.cnpj,
        cnpj_formatado: formatCnpj(item.cnpj),
        razao_social: item.razao_social,
        nome_fantasia: item.nome_fantasia,
        matriz_filial: matrizFilialTexto(item.matriz_filial),
        situacao: item.situacao_cadastral?.situacao_cadastral || item.situacao_cadastral?.situacao_atual || "—",
        cnae_principal: item.atividade_principal || { codigo: "", descricao: "" },
        cnaes_secundarios: cnaeSec,
        qtd_cnae_secundario: cnaeSec.length,
        endereco_completo: enderecoCompleto,
        cep: end.cep ? String(end.cep).replace(/\D/g, "").padStart(8, "0") : "",
        logradouro,
        complemento,
        score_endereco: Math.round(score * 100) / 100,
        razao_identica: razaoIdentica
      };
    });

    candidatos.sort((a, b) => {
      if (a.razao_identica !== b.razao_identica) return a.razao_identica ? -1 : 1;
      return b.score_endereco - a.score_endereco;
    });

    const ambiguo = candidatos.filter(c => c.score_endereco > 0.85).length >= 2;

    return Response.json({
      status: candidatos.length ? "success" : "empty",
      total: candidatos.length,
      candidatos,
      ambiguo
    });
  } catch (error) {
    return Response.json({ status: "error", mensagem: error.message }, { status: 500 });
  }
}