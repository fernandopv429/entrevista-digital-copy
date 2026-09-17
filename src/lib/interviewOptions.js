export const ESCALA_OPTIONS = ["12x36", "5x2 (8h diárias)", "6x1 (8h diárias)", "4x2 (12h)", "Plantão 24h", "Outra"];
export const TIPO_DISPENSA_OPTIONS = [
  { value: "sem_justa_causa", label: "Sem justa causa" },
  { value: "rescisao_indireta", label: "Rescisão indireta" },
  { value: "nulidade_pedido_demissao", label: "Pedido de demissão (nulidade/coação)" },
  { value: "reversao_justa_causa", label: "Justa causa (a reverter)" },
];
export const GRAU_INSALUBRIDADE_OPTIONS = ["mínimo", "médio", "máximo"];

// Valores em minutos vieram antes das faixas porque as respostas reais chegam
// em minutos ("40 min", "45 min", "1h20") e eram obrigadas a cair na faixa
// larga, o que arredondava o pedido para baixo.
//
// As FAIXAS originais foram mantidas com o MESMO value: o gerador no n8n já as
// reconhece e os registros salvos apontam para elas — trocar o texto faria o
// select abrir vazio na tela de edição. Só o rótulo ganhou a marca "Faixa:",
// para o entrevistador preferir o valor exato quando souber.
export const HORAS_EXTRAS_OPTIONS = [
  "Não realizava",
  "15 minutos",
  "20 minutos",
  "30 minutos",
  "40 minutos",
  "45 minutos",
  "1 hora",
  "1 hora e 20 minutos",
  "1 hora e 30 minutos",
  { value: "Até 1 hora", label: "Faixa: até 1 hora" },
  { value: "1 a 2 horas", label: "Faixa: 1 a 2 horas" },
  { value: "2 a 3 horas", label: "Faixa: 2 a 3 horas" },
  { value: "Mais de 3 horas", label: "Faixa: mais de 3 horas" },
];

// Grade de 5 em 5 minutos. A lista antiga só tinha 0/15/30/45/1h, e "20 min"
// apareceu em duas entrevistas seguidas sem ter onde ser registrado — o
// entrevistador tinha que escolher entre 15 (subdimensiona) e 30 (infla). O
// passo de 5 minutos acompanha a tolerância do art. 58, § 1º, da CLT.
export const MINUTOS_OPTIONS = [
  "0 minutos",
  "5 minutos",
  "10 minutos",
  "15 minutos",
  "20 minutos",
  "25 minutos",
  "30 minutos",
  "35 minutos",
  "40 minutos",
  "45 minutos",
  "50 minutos",
  "55 minutos",
  "1 hora",
  "1 hora e 30 minutos",
  "2 horas",
];

export const FERIAS_OPTIONS = ["Não possuiu", "Proporcional", "1 período integral", "2 períodos integrais", "3 ou mais períodos"];

// "4 a 5" e "5 a 7" existem porque foram respostas reais e não tinham faixa
// correspondente: sem elas o valor fica fora da lista e o select abre vazio ao
// reabrir o registro para edição — e um "salvar" apagaria o dado. "5 a 7" veio
// da peça redigida pela especialista, que apurou faixa maior que a anotada na
// entrevista assinada.
export const FOLGAS_OPTIONS = ["0", "1 a 2", "3 a 4", "4 a 5", "5 a 6", "5 a 7", "Mais de 6"];
// Quando a resposta e "trabalhou folgas = Sim", "0" e contraditorio e fica fora.
export const FOLGAS_OPTIONS_ATIVO = FOLGAS_OPTIONS.filter((o) => o !== "0");
// O gerador liga a tese de integracao do pagamento "por fora" quando a forma de
// recebimento casa /pix|dinheiro/i (mapearWebhook.js). Texto livre aqui fazia a
// tese depender da grafia do entrevistador.
export const FT_PAGAMENTO_OPTIONS = ["Pix", "Dinheiro", "Em folha de pagamento", "Outra"];
export const TESTEMUNHA_OPTIONS = ["Sim", "Não", "Irá verificar"];
