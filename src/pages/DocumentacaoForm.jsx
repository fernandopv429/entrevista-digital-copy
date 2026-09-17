import React, { useRef, useState } from "react";
import { Download, Loader2, ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const SECTIONS = [
  {
    title: "Seção 1 — Identificação do cliente",
    fields: [
      ["titulo", "Título do caso", "texto", "não", "Usado no nome do arquivo PDF gerado. Formato livre.", "Ex.: Fernando x Belfort"],
      ["RECL_NOME", "Nome completo", "texto", "sim", "Nome completo do reclamante. Vai para o cabeçalho e a qualificação da peça.", ""],
      ["RECL_NACIONALIDADE", "Nacionalidade", "texto", "não", "Vai para a qualificação do reclamante no preâmbulo.", ""],
      ["RECL_ESTADOCIVIL", "Estado civil", "texto", "não", "Vai para a qualificação do reclamante no preâmbulo.", ""],
      ["RECL_RG", "RG", "texto", "não", "Documento de identidade. Vai para a qualificação do reclamante.", ""],
      ["RECL_CPF", "CPF", "texto (máscara CPF)", "sim", "Obrigatório. Vai para a qualificação do reclamante.", ""],
      ["RECL_PIS", "PIS", "texto", "não", "Número de PIS/PASEP. Usado para pedidos de FGTS e seguro-desemprego.", ""],
      ["RECL_CTPS", "CTPS (número)", "texto", "não", "Número da Carteira de Trabalho. Vai para a qualificação.", ""],
      ["RECL_SERIE", "CTPS (série)", "texto", "não", "Série da CTPS. Vai para a qualificação.", ""],
      ["RECL_NASC", "Data de nascimento", "data", "não", "Vai para a qualificação do reclamante.", ""],
      ["RECL_FILIACAO", "Filiação", "texto", "não", "Nome dos pais. Vai para a qualificação do reclamante.", ""],
      ["RECL_ENDERECO", "Endereço (logradouro)", "texto", "não", "Endereço residencial do reclamante. Vai para a qualificação.", ""],
      ["RECL_CEP", "CEP", "texto", "não", "CEP residencial do reclamante.", ""],
      ["email", "E-mail", "e-mail", "não", "Contato do cliente para comunicação processual.", ""],
      ["telefone", "Telefone", "texto (máscara telefone)", "não", "Contato do cliente.", ""],
    ],
  },
  {
    title: "Seção 2 — Reclamadas, função e jornada",
    fields: [
      ["FUNCAO", "Função exercida (cargo)", "texto", "não", "Define o enquadramento da categoria (vigilante vs. demais). Determina se a tese de acúmulo vira 'desvio de função' ou 'acúmulo de função'.", ""],
      ["escala", "Escala (geral)", "seleção", "não", "Escala aplicada a todas as reclamadas, salvo se uma escala específica for informada.", "12x36, 5x2, 6x1, 4x2, Plantão 24h, Outra"],
      ["JORNADA_HORARIO", "Horário da jornada (geral)", "texto", "não", "Horário padrão aplicado a todas as reclamadas.", "Ex.: das 19h às 07h"],
      ["RECL1_NOME", "1ª Reclamada — Razão social", "texto", "não", "Razão social da empregadora. Vai para a qualificação da 1ª ré no preâmbulo.", ""],
      ["RECL1_CNPJ", "1ª Reclamada — CNPJ", "texto (máscara CNPJ)", "não", "CNPJ da empregadora. Vai para a qualificação da 1ª ré.", ""],
      ["RECL1_CEP", "1ª Reclamada — CEP", "texto (máscara CEP)", "não", "CEP da empregadora. Vai para o endereço da 1ª ré.", ""],
      ["RECL1_LOGRADOURO", "1ª Reclamada — Endereço", "texto", "não", "Endereço da empregadora. Vai para a qualificação da 1ª ré.", ""],
      ["RECL1_ENDCOMPL", "1ª Reclamada — Complemento (cidade/UF)", "texto", "não", "Cidade/UF da empregadora. Vai para a qualificação e define o foro.", ""],
      ["RECL1_TEMPO_LABORADO", "1ª Reclamada — Tempo laborado", "texto", "não", "Período laborado. Base para o cálculo de todas as verbas proporcionais (aviso, 13º, férias, FGTS).", "Ex.: 02/01/2023 a 30/06/2025"],
      ["RECL1_ESCALA_HORARIO", "1ª Reclamada — Escala / horário", "texto", "não", "Escala específica desta reclamada. Sobrepõe a escala geral se preenchida.", "Ex.: 12x36 — das 19h às 07h"],
      ["RECL2_NOME", "2ª Reclamada — Razão social", "texto", "não", "Razão social da tomadora de serviços. Vai para a qualificação da 2ª ré. Campos da 2ª à 4ª reclamada seguem a mesma estrutura.", ""],
      ["RECL2_CNPJ", "2ª Reclamada — CNPJ", "texto (máscara CNPJ)", "não", "CNPJ da 2ª ré.", ""],
      ["RECL2_CEP", "2ª Reclamada — CEP", "texto (máscara CEP)", "não", "CEP da 2ª ré.", ""],
      ["RECL2_LOGRADOURO", "2ª Reclamada — Endereço", "texto", "não", "Endereço da 2ª ré.", ""],
      ["RECL2_ENDCOMPL", "2ª Reclamada — Complemento", "texto", "não", "Cidade/UF da 2ª ré.", ""],
      ["RECL2_TEMPO_LABORADO", "2ª Reclamada — Tempo laborado", "texto", "não", "Período laborado para a 2ª ré. Base para verbas proporcionais desta reclamada.", ""],
      ["RECL2_ESCALA_HORARIO", "2ª Reclamada — Escala / horário", "texto", "não", "Escala específica da 2ª ré.", ""],
      ["RECL3_NOME", "3ª Reclamada — Razão social", "texto", "não", "Razão social da 3ª ré. Mesma estrutura dos campos anteriores.", ""],
      ["RECL3_CNPJ", "3ª Reclamada — CNPJ", "texto (máscara CNPJ)", "não", "CNPJ da 3ª ré.", ""],
      ["RECL3_CEP", "3ª Reclamada — CEP", "texto (máscara CEP)", "não", "CEP da 3ª ré.", ""],
      ["RECL3_LOGRADOURO", "3ª Reclamada — Endereço", "texto", "não", "Endereço da 3ª ré.", ""],
      ["RECL3_ENDCOMPL", "3ª Reclamada — Complemento", "texto", "não", "Cidade/UF da 3ª ré.", ""],
      ["RECL3_TEMPO_LABORADO", "3ª Reclamada — Tempo laborado", "texto", "não", "Período laborado para a 3ª ré.", ""],
      ["RECL3_ESCALA_HORARIO", "3ª Reclamada — Escala / horário", "texto", "não", "Escala específica da 3ª ré.", ""],
      ["RECL4_NOME", "4ª Reclamada — Razão social", "texto", "não", "Razão social da 4ª ré. Mesma estrutura dos campos anteriores.", ""],
      ["RECL4_CNPJ", "4ª Reclamada — CNPJ", "texto (máscara CNPJ)", "não", "CNPJ da 4ª ré.", ""],
      ["RECL4_CEP", "4ª Reclamada — CEP", "texto (máscara CEP)", "não", "CEP da 4ª ré.", ""],
      ["RECL4_LOGRADOURO", "4ª Reclamada — Endereço", "texto", "não", "Endereço da 4ª ré.", ""],
      ["RECL4_ENDCOMPL", "4ª Reclamada — Complemento", "texto", "não", "Cidade/UF da 4ª ré.", ""],
      ["RECL4_TEMPO_LABORADO", "4ª Reclamada — Tempo laborado", "texto", "não", "Período laborado para a 4ª ré.", ""],
      ["RECL4_ESCALA_HORARIO", "4ª Reclamada — Escala / horário", "texto", "não", "Escala específica da 4ª ré.", ""],
    ],
  },
  {
    title: "Seção 3 — Período do contrato e remuneração",
    fields: [
      ["DATA_ADMISSAO", "Admissão", "data", "não", "Início do vínculo. Base para o cálculo de todas as verbas proporcionais (aviso, 13º, férias, FGTS).", ""],
      ["DATA_RESCISAO", "Rescisão / último dia trabalhado", "data", "não", "Fim do vínculo. Sem ela (contrato em vigor), as verbas rescisórias saem para apuração na data que o juízo fixar. Oculto quando contrato em vigor.", ""],
      ["SALARIO", "Salário-base mensal", "texto (máscara moeda)", "não", "Confira no holerite ou CTPS. Todo o rol de pedidos é calculado sobre ele — aviso prévio, 13º, férias, FGTS, multas 467/477, hora normal e dano moral. Sem ele, a peça sai calculada sobre o piso presumido da CCT e volta marcada para revisão.", "Ex.: R$ 2.148,22"],
      ["(estado) contrato_em_vigor", "Contrato ainda em vigor?", "Sim/Não", "não", "Não é campo da entidade. Quando 'Sim', esconde as datas de saída e o submit acrescenta frase padronizada aos fatos narrados, informando ao gerador que o contrato está ativo (típico de rescisão indireta com continuidade do trabalho). As verbas rescisórias saem para apuração na data que o juízo fixar.", ""],
    ],
  },
  {
    title: "Seção 4 — Tipo de dispensa e responsável",
    fields: [
      ["tipo_dispensa", "Tipo de dispensa", "seleção", "não", "Define o enquadramento jurídico da rescisão. 'sem_justa_causa' → aviso prévio e multa 40% FGTS. 'rescisao_indireta' → mesmo tratamento, com base no art. 483 CLT. 'nulidade_pedido_demissao' → anula o pedido de demissão por coação. 'reversao_justa_causa' → reverte a justa causa para sem justa causa.", "sem_justa_causa, rescisao_indireta, nulidade_pedido_demissao, reversao_justa_causa"],
      ["ULTIMO_DIA_TRABALHADO", "Último dia trabalhado", "data", "não", "Último dia efetivamente trabalhado. Base para o cálculo do aviso prévio. Oculto quando contrato em vigor.", ""],
      ["RESPONSAVEL_HIERARQUICO", "Nome do responsável hierárquico", "texto", "não", "Nome do superior direto do reclamante. Vai para os FATOS da peça.", "Ex.: Sr. João (supervisor de turno)"],
    ],
  },
  {
    title: "Seção 5 — Jornada de trabalho",
    fields: [
      ["finais_semana", "Trabalhou em finais de semana e feriados?", "Sim/Não", "não", "Se 'Sim', gera pedido de indenização por trabalho em finais de semana e feriados, com reflexos.", ""],
      ["tem_adic_noturno", "Trabalhava entre 22h e 5h (adicional noturno)?", "Sim/Não", "não", "Trabalhava no intervalo das 22h às 5h (adicional noturno, art. 73 da CLT). Se 'Sim', gera pedido de adicional noturno.", ""],
    ],
  },
  {
    title: "Seção 6 — Benefícios",
    fields: [
      ["vale_refeicao", "Vale-refeição", "Sim/Não", "não", "Se 'Sim', gera pedido de vale-refeição.", ""],
      ["vale_alimentacao", "Vale-alimentação", "Sim/Não", "não", "Se 'Sim', gera pedido de auxílio-alimentação.", ""],
      ["vale_transporte", "Vale-transporte", "Sim/Não", "não", "Se 'Sim', gera pedido de vale-transporte.", ""],
      ["VALOR_VALE_REFEICAO", "Valor diário do vale-refeição (opcional)", "texto (máscara moeda)", "não", "Preencha só se souber o valor da convenção. Em branco, o sistema busca a cláusula na CCT vigente e aplica o padrão da categoria com aviso de revisão. Se houver folgas trabalhadas (Seção 8), este valor entra no cálculo do vale-refeição devido nas folgas.", "Ex.: R$ 25,00"],
      ["VALOR_AUX_ALIMENTACAO", "Valor diário do auxílio-alimentação (opcional)", "texto (máscara moeda)", "não", "Sem ele, o gerador usa o padrão da CCT; se a convenção não trouxer o número, a peça sai com [A PREENCHER]. Se houver folgas trabalhadas, este valor entra no cálculo do auxílio nas folgas.", "Ex.: R$ 37,00"],
      ["VAL_CONDUCAO", "Valor diário da condução (opcional)", "texto (máscara moeda)", "não", "Valor diário da condução/vale-transporte em reais. Se houver folgas trabalhadas, este valor entra no cálculo do vale-transporte devido nas folgas.", "Ex.: R$ 10,00"],
    ],
  },
  {
    title: "Seção 7 — Férias",
    fields: [
      ["ferias", "Possuiu férias?", "Sim/Não", "não", "Se 'Sim', gera pedido de férias + 1/3 (simples ou em dobro conforme o período).", ""],
      ["ferias_quantidade", "Quantidade", "seleção", "não", "Define o número de períodos aquisitivos. Determina se pede férias simples, em dobro, ou proporcionais.", "Não possuiu, Proporcional, 1 período integral, 2 períodos, 3 ou mais"],
    ],
  },
  {
    title: "Seção 8 — Folgas trabalhadas (FT)",
    fields: [
      ["folgas_trabalhadas", "Trabalhou folgas?", "Sim/Não", "não", "Se 'Sim', habilita o cálculo de folgas trabalhadas e todos os pedidos derivados. Se 'Não', nenhum dos campos abaixo é enviado no payload.", ""],
      ["FT_QTD_MEDIA", "Média de folgas por mês", "seleção", "não", "Obrigatório quando trabalhou folgas. Sem ele, a verba de folga trabalhada não é calculada e não entra na minuta.", "1 a 2, 3 a 4, 4 a 5, 5 a 6, 5 a 7, Mais de 6"],
      ["VAL_FT", "Valor recebido por FT / diária", "texto (máscara moeda)", "não", "Obrigatório quando trabalhou folgas. Valor da diária de folga trabalhada. Sem ele, a verba não é calculada e não entra na minuta.", "Ex.: R$ 180,00"],
      ["ft_pagamento", "Forma de recebimento", "seleção", "não", "A forma de recebimento importa por si: Pix ou dinheiro caracterizam pagamento por fora e acionam o pedido de integração ao salário, com reflexos em DSR, aviso prévio, 13º, férias + 1/3 e FGTS + 40%.", "Pix, Dinheiro, Em folha de pagamento, Outra"],
      ["ft_comprovante", "Possui comprovante de pagamento?", "Sim/Não", "não", "Indica se há prova documental do pagamento das folgas.", ""],
      ["folgas_conciliava", "Conciliava jornada?", "Sim/Não", "não", "Se 'Sim', habilita pedido de diferenças de jornada conciliada.", ""],
      ["folgas_periodo_conciliou", "Período que conciliou", "texto", "não", "Período em que houve conciliação de jornada. Visível se folgas_conciliava = Sim.", "Ex.: jan/2024 a mar/2025"],
      ["SALARIOS_ABERTO", "Salários em aberto — quais meses", "texto", "não", "Quais meses de salário permaneceram em aberto. Gera pedido de salários atrasados.", "Ex.: outubro e novembro/2025"],
      ["SALARIOS_ABERTO_QTD", "Salários em aberto — qtd. de meses", "número", "não", "Quantidade de meses em aberto. Usado no cálculo do valor devido.", "Ex.: 2"],
      ["VALOR_POR_FORA", "Valor 'por fora' por mês", "texto (máscara moeda)", "não", "Valor mensal recebido 'por fora' (à parte da folha de pagamento). Gera pedido de integração ao salário com reflexos.", "Ex.: R$ 500,00"],
    ],
  },
  {
    title: "Seção 9 — Intervalo intrajornada",
    fields: [
      ["intervalo_suprimido", "Horário de almoço suprimido?", "Sim/Não", "não", "Se 'Sim', gera pedido de concessão parcial do intervalo intrajornada (art. 71, §4º, CLT).", ""],
      ["INTERVALO_USUFRUIDO", "Quanto tempo era usufruído, em média", "texto", "não", "Informe uma DURAÇÃO (ex.: '10 a 15 minutos'). Entra na frase 'concessão parcial do intervalo de...'. Qualquer outra anotação (ex.: rádio ligado) é desviada para observação e NÃO aparece na peça. Visível se intervalo_suprimido = Sim.", "Ex.: 10 a 15 minutos"],
    ],
  },
  {
    title: "Seção 10 — Horas extras",
    fields: [
      ["horas_extras", "Realizava horas extras?", "Sim/Não", "não", "Se 'Sim', habilita todos os pedidos de horas extras. Campos abaixo visíveis se Sim.", ""],
      ["media_horas_extras", "Média de horas extras", "seleção", "não", "Média diária de horas extras. Base para o cálculo do pedido de horas extras.", "15 min a Mais de 3h"],
      ["controle_ponto", "Havia controle de ponto?", "Sim/Não", "não", "Indica se havia controle de ponto. Influencia no ônus da prova.", ""],
      ["formato_ponto", "Qual formato do ponto", "texto", "não", "Descreve o formato (eletrônico, manual, app). Vai para os FATOS da peça. Visível se controle_ponto = Sim.", "Ex.: Catraca eletrônica / manual / app"],
      ["periodo_antecedente", "Período antecedente à jornada", "seleção", "não", "Minutos trabalhados antes do início da jornada. Soma às horas extras pedidas.", "0 a 2 horas, passo de 5 min"],
      ["periodo_sucedente", "Período sucedente", "seleção", "não", "Minutos trabalhados após o fim da jornada. Soma às horas extras pedidas.", "Mesmas opções do antecedente"],
    ],
  },
  {
    title: "Seção 11 — Acúmulo/desvio de função",
    fields: [
      ["acumulo_funcao", "Houve acúmulo ou desvio de função?", "Sim/Não", "não", "Se 'Sim', gera capítulo de enquadramento (desvio ou acúmulo, conforme a função/categoria).", ""],
      ["funcoes_acumuladas", "Quais atividades passou a exercer", "texto longo", "não", "Descreva as TAREFAS CONCRETAS, não o nome do cargo. O enquadramento entre desvio e acúmulo é decidido pelo sistema conforme a função e a convenção da categoria — os dois são alternativos e nunca cumulados sobre os mesmos fatos. É desta descrição que a IA escreve os FATOS do capítulo de enquadramento. Visível se acumulo_funcao = Sim.", "Ex.: conferência de mercadorias, controle de validade..."],
    ],
  },
  {
    title: "Seção 12 — Condições de trabalho",
    fields: [
      ["armamento_colete", "Utilizava armamento e colete?", "Sim/Não", "não", "Se 'Sim', gera pedido de adicional de periculosidade por uso de armamento (aplicável a vigilantes).", ""],
    ],
  },
  {
    title: "Seção 13 — Gratificações e prêmios",
    fields: [
      ["gratificacao", "Recebe algum tipo de gratificação?", "Sim/Não", "não", "Se 'Sim', habilita pedido de gratificação/integração ao salário.", ""],
      ["gratificacao_qual", "Qual", "texto", "não", "Descreve o tipo de gratificação recebida. Vai para os FATOS da peça. Visível se gratificacao = Sim.", ""],
      ["assiduidade", "Havia prêmio de assiduidade?", "Sim/Não", "não", "Se 'Sim', habilita pedido de prêmio de assiduidade.", ""],
      ["assiduidade_prometido", "Valor prometido (mensal)", "texto (máscara moeda)", "não", "Valor mensal prometido a título de prêmio de assiduidade. Obrigatório quando há prêmio de assiduidade. Visível se assiduidade = Sim.", ""],
      ["assiduidade_pago", "Valor efetivamente pago", "texto (máscara moeda)", "não", "Valor mensal efetivamente pago. O pedido é a DIFERENÇA entre o prometido e o pago (art. 457, §1º, CLT). Sem os dois valores, a tese não chega a ser calculada. Visível se assiduidade = Sim.", ""],
    ],
  },
  {
    title: "Seção 14 — Documentos",
    fields: [
      ["holerites", "Holerites", "Sim/Não", "não", "Indica se o cliente possui holerites. Sustenta a prova do salário real e base dos cálculos.", ""],
      ["rescisao_contratual", "Rescisão contratual", "Sim/Não", "não", "Indica se possui TRCT (termo de rescisão). Sustenta a prova da rescisão e das verbas pagas.", ""],
      ["espelho_ponto", "Espelho de ponto", "Sim/Não", "não", "Indica se possui espelho de ponto. Sustenta a prova de horas extras e jornadas.", ""],
    ],
  },
  {
    title: "Seção 15 — Descontos",
    fields: [
      ["desconto_indevido", "Houve desconto indevido?", "Sim/Não", "não", "Se 'Sim', gera pedido de devolução de descontos indevidos (art. 462, §1º, CLT).", ""],
      ["desconto_qual", "Qual", "texto", "não", "Descreve o tipo de desconto indevido. Vai para os FATOS da peça.", ""],
    ],
  },
  {
    title: "Seção 16 — Saúde e segurança",
    fields: [
      ["tem_doenca", "Doença ou acidente de trabalho?", "Sim/Não", "não", "Se 'Sim', gera pedido de indenização por doença ou acidente de trabalho (art. 20 da Lei 8.213/91).", ""],
      ["tem_insalubridade", "Insalubridade?", "Sim/Não", "não", "Se 'Sim', gera pedido de adicional de insalubridade.", ""],
      ["insalubridade_porcentagem", "Porcentagem (insalubridade)", "texto", "não", "Porcentagem do adicional (mínimo 10%, médio 20%, máximo 40% sobre o salário mínimo). Visível se tem_insalubridade = Sim.", "Ex.: 20%"],
      ["tem_periculosidade", "Periculosidade?", "Sim/Não", "não", "Se 'Sim', gera pedido de adicional de periculosidade (30% sobre o salário base).", ""],
      ["periculosidade_porcentagem", "Porcentagem (periculosidade)", "texto", "não", "Porcentagem do adicional (30% sobre o salário base). Visível se tem_periculosidade = Sim.", "Ex.: 30%"],
      ["produtos", "Quais produtos", "texto", "não", "Quais produtos/manuseava no trabalho. Vai para os FATOS (sustenta a tese de insalubridade).", ""],
      ["epi", "Utilizava EPI", "texto", "não", "Se 'Não', reforça o pedido de insalubridade. Descreva quais EPIs usava ou se nenhum foi fornecido.", ""],
    ],
  },
  {
    title: "Seção 17 — Testemunha",
    fields: [
      ["testemunha", "Testemunha", "seleção", "não", "Indica se há testemunha disponível. Vai para a instrução processual.", "Sim, Não, Irá verificar"],
    ],
  },
  {
    title: "Seção 18 — Fatos narrados pelo reclamante",
    fields: [
      ["fatos_narrados", "Relato completo", "texto longo", "não", "É o campo por onde o gerador lê a narrativa para escrever o capítulo de FATOS da peça. Quando contrato em vigor, o submit acrescenta automaticamente uma frase padronizada informando que o vínculo está ativo. Toda a narrativa livre do cliente deve vir aqui.", ""],
    ],
  },
  {
    title: "APIs de integração — Endpoints externos",
    isApiSection: true,
    apis: [
      {
        nome: "1. Criar entrevista",
        metodo: "POST",
        url: "https://formulariofav.base44.app/functions/criarEntrevista",
        auth: "Header: x-api-key: <APROVACAO_API_KEY>",
        descricao: "Cria uma nova entrevista na base de dados. Sistema externo envia os dados do formulário e recebe o ID do registro criado.",
        payload: `{
  "RECL_NOME": "João da Silva",      // obrigatório
  "RECL_CPF": "123.456.789-00",      // obrigatório
  "RECL_NASC": "1990-01-15",
  "SALARIO": "R$ 2.148,22",
  "FUNCAO": "Vigilante",
  "tipo_dispensa": "sem_justa_causa",
  "DATA_ADMISSAO": "2023-01-02",
  "DATA_RESCISAO": "2025-06-30",
  ...todos os campos da entidade Entrevista
}`,
        resposta: `// 201 Created
{ "status": "ok", "entrevista_id": "abc123", "data": { ...registro } }

// 400 Bad Request
{ "error": "RECL_NOME e RECL_CPF são obrigatórios" }

// 401 Unauthorized
{ "error": "Unauthorized — API key inválida" }`,
        regras: [
          "Apenas RECL_NOME e RECL_CPF são obrigatórios no payload.",
          "Os campos devem seguir os tipos definidos na entidade (datas em ISO yyyy-mm-dd, SALARIOS_ABERTO_QTD como número).",
          "A chave APROVACAO_API_KEY é a mesma usada no endpoint de aprovação.",
        ],
      },
      {
        nome: "2. Aprovar / Reprovar entrevista",
        metodo: "POST",
        url: "https://formulariofav.base44.app/functions/atualizarAprovacaoEntrevista",
        auth: "Header: x-api-key: <APROVACAO_API_KEY>",
        descricao: "Atualiza o status de aprovação de uma entrevista. Define se a entrevista foi aprovada ou reprovada pelo sistema externo.",
        payload: `{
  "entrevista_id": "abc123",       // obrigatório
  "status": "aprovado",            // "aprovado" ou "reprovado"
  "motivo": "Falta de documentos"  // obrigatório apenas se status = "reprovado"
}`,
        resposta: `// 200 OK
{ "status": "ok", "entrevista_id": "abc123", "aprovacao_status": "aprovado" }

// 400 Bad Request
{ "error": "motivo é obrigatório quando status = reprovado" }

// 401 Unauthorized
{ "error": "Unauthorized — API key inválida" }`,
        regras: [
          "status deve ser exatamente 'aprovado' ou 'reprovado'.",
          "Quando status = 'reprovado', o campo 'motivo' é obrigatório e é salvo em aprovacao_motivo.",
          "Quando status = 'aprovado', o campo aprovacao_motivo é limpo (vazio).",
          "A API key pode ser enviada no header (x-api-key) ou na query string (?api_key=).",
        ],
      },
      {
        nome: "3. Consultar CNPJ / Razão Social (interno)",
        metodo: "POST",
        url: "https://formulariofav.base44.app/functions/localizarCnpj",
        auth: "Sem autenticação — chamado pelo frontend via SDK (base44.functions.invoke)",
        descricao: "Consulta a base da Casa dos Dados para encontrar CNPJs por razão social ou endereço. Retorna candidatos ranqueados por similaridade. Usado pelo painel lateral do formulário para pré-preencher dados das reclamadas.",
        payload: `{
  "razao_social": "GEAR SEGURANCA",  // opcional (mín. 4 caracteres)
  "endereco": "Rua das Flores, 123", // opcional
  "municipio": "São Paulo",           // opcional
  "uf": "SP",                         // opcional
  "cep": "01000-000"                  // opcional
}`,
        resposta: `// Sucesso
{
  "status": "success",
  "total": 3,
  "ambiguo": false,
  "candidatos": [{
    "cnpj": "12345678000190",
    "cnpj_formatado": "12.345.678/0001-90",
    "razao_social": "GEAR SEGURANCA PRIVADA LTDA",
    "nome_fantasia": "GEAR",
    "matriz_filial": "Matriz",
    "situacao": "ATIVO",
    "cnae_principal": { "codigo": "8011-1/01", "descricao": "..." },
    "cnaes_secundarios": [...],
    "endereco_completo": "Rua das Flores, 123 - São Paulo/SP",
    "score_endereco": 0.92
  }]
}

// Vazio
{ "status": "empty", "total": 0, "candidatos": [], "ambiguo": false }

// Erro
{ "status": "error", "mensagem": "Falha ao consultar API externa" }`,
        regras: [
          "Busca por razão social OU por endereço (CEP + cidade/UF). Pelo menos um critério é necessário.",
          "Sistema faz até 3 tentativas com retry de 1.5s entre cada.",
          "Candidatos são ordenados: razão social idêntica primeiro, depois por score de similaridade de endereço.",
          "ambiguo = true quando 2+ candidatos têm score_endereco > 0.85 (mais de uma empresa compatível).",
          "Resultados são informativos — o preenchimento dos campos da reclamada é manual pelo consultor.",
        ],
      },
      {
        nome: "4. Webhook — Entrevista salva (saída)",
        metodo: "POST",
        url: "Configurado nos secrets WEBHOOK_URL e WEBHOOK_URL_2",
        auth: "Header: X-Webhook-Secret: <WEBHOOK_SECRET> (se configurado)",
        descricao: "Disparado automaticamente quando uma entrevista é salva ou reenviada. Envia o payload completo da entrevista para os webhooks configurados (até 2 destinos). O sistema externo (n8n) consome estes dados para gerar a peça jurídica.",
        payload: `{
  "event": "entrevista.salva",
  "id": "abc123",
  "created_by": "usuario@email.com",  // ou "anonimo" se sem login
  "timestamp": "2026-09-16T11:24:00-03:00",  // horário de Brasília
  "data": {
    ...todos os campos da entidade Entrevista,
    "aprovacao_status": "pendente",
    "fatos_narrados": "Relato + frase EM VIGOR (se contrato ativo)"
  }
}`,
        resposta: `// O webhook não retorna resposta para o cliente — é fire-and-forget.
// Falha no webhook NÃO impede o salvamento da entrevista.
// O sistema tenta 2 destinos em paralelo (WEBHOOK_URL e WEBHOOK_URL_2).`,
        regras: [
          "Disparado após cada salvamento ou reenvio de entrevista (EditarEntrevista).",
          "timestamp sempre em horário de Brasília (America/Sao_Paulo, UTC-3).",
          "created_by = email do usuário logado ou 'anonimo' (formulário público).",
          "Se o contrato está em vigor, o campo fatos_narrados recebe a frase 'Contrato de trabalho EM VIGOR...' automaticamente antes do envio.",
          "Falha no webhook não bloqueia o salvamento — o erro é capturado silenciosamente.",
          "O segundo webhook (WEBHOOK_URL_2) usa WEBHOOK_SECRET_2 se definido, senão cai para WEBHOOK_SECRET.",
        ],
      },
    ],
  },
  {
    title: "Campos do sistema (não editáveis no formulário)",
    fields: [
      ["aprovacao_status", "Status de aprovação", "enum", "—", "Status de aprovação da entrevista. Inicia como 'pendente'. Atualizado via API externa para 'aprovado' ou 'reprovado'.", "pendente, aprovado, reprovado"],
      ["aprovacao_motivo", "Motivo da reprovação", "texto", "—", "Preenchido quando aprovacao_status = 'reprovado'. Texto livre explicando o motivo da reprovação.", ""],
    ],
  },
  {
    title: "Campos automáticos (gerados pela plataforma)",
    fields: [
      ["id", "Identificador único do registro", "—", "—", "Gerado automaticamente. Usado como chave primária em todas as operações.", ""],
      ["created_date", "Data de criação", "—", "—", "Gerado automaticamente no momento da criação do registro.", ""],
      ["updated_date", "Data da última atualização", "—", "—", "Atualizado automaticamente a cada modificação.", ""],
      ["created_by_id", "ID do usuário que criou", "—", "—", "Referência ao usuário autenticado que criou o registro. 'anonimo' quando criado via formulário público.", ""],
    ],
  },
];

const NOTES = [
  "Máscaras automáticas: CPF, CNPJ, CEP, telefone e moeda são formatados conforme o usuário digita.",
  "Campos dependentes: ao responder 'Não' em um campo Sim/Não com subcampos (ex.: folgas_trabalhadas, horas_extras, intervalo_suprimido), os subcampos são automaticamente apagados do payload.",
  "Campos obrigatórios na entidade: apenas RECL_NOME e RECL_CPF são obrigatórios para criar um registro.",
  "Contrato em vigor: não é um campo persistido — é inferido na edição pela ausência de DATA_RESCISAO combinada com a marca 'EM VIGOR' nos fatos narrados.",
  "O payload enviado ao webhook inclui TODOS os campos preenchidos, mesmo os vazios. Campos ocultos (dependentes de 'Não') são removidos do estado antes do envio.",
  "SALARIOS_ABERTO_QTD é o único campo numérico do schema. Valores vazios ou inválidos são removidos antes do envio para evitar erro de validação (400).",
];

export default function DocumentacaoForm() {
  const docRef = useRef(null);
  const [generating, setGenerating] = useState(false);

  const baixarPdf = async () => {
    if (!docRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(docRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save("documentacao-formulario-entrevista.pdf");
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-app-bg pb-20 text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <button
            onClick={baixarPdf}
            disabled={generating}
            className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 font-bold text-white transition hover:brightness-95 disabled:opacity-60"
          >
            {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
            {generating ? "Gerando PDF..." : "Baixar PDF"}
          </button>
        </div>
      </header>

      <div ref={docRef} className="mx-auto max-w-6xl bg-white px-4 py-8 sm:px-8">
        <div className="mb-8 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-brand" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Documentação do Formulário</h1>
              <p className="mt-1 text-sm text-slate-500">Entrevista Trabalhista — campos, instruções de preenchimento e regras de geração da peça</p>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-700">Regras gerais e observações</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            {NOTES.map((n, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                {n}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-8">
          {SECTIONS.map((section, si) =>
            section.isApiSection ? (
              <section key={si}>
                <h2 className="mb-3 text-lg font-bold text-slate-900">{section.title}</h2>
                <div className="space-y-4">
                  {section.apis.map((api, ai) => (
                    <div key={ai} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-brand px-2 py-1 text-[10px] font-bold uppercase text-white">{api.metodo}</span>
                        <h3 className="text-sm font-bold text-slate-900">{api.nome}</h3>
                      </div>
                      <dl className="space-y-2 text-xs">
                        <div className="flex gap-2">
                          <dt className="font-bold text-slate-500">URL:</dt>
                          <dd className="font-mono text-[10px] break-all text-slate-700">{api.url}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="font-bold text-slate-500">Auth:</dt>
                          <dd className="font-mono text-[10px] text-slate-700">{api.auth}</dd>
                        </div>
                        <div>
                          <dt className="mb-1 font-bold text-slate-500">Descrição:</dt>
                          <dd className="leading-relaxed text-slate-700">{api.descricao}</dd>
                        </div>
                        <div>
                          <dt className="mb-1 font-bold text-slate-500">Payload (request):</dt>
                          <dd><pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-[10px] leading-relaxed text-slate-100">{api.payload}</pre></dd>
                        </div>
                        <div>
                          <dt className="mb-1 font-bold text-slate-500">Resposta (response):</dt>
                          <dd><pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-[10px] leading-relaxed text-slate-100">{api.resposta}</pre></dd>
                        </div>
                        <div>
                          <dt className="mb-1 font-bold text-slate-500">Regras:</dt>
                          <dd>
                            <ul className="space-y-1">
                              {api.regras.map((r, ri) => (
                                <li key={ri} className="flex items-start gap-2 leading-relaxed text-slate-700">
                                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand" />
                                  {r}
                                </li>
                              ))}
                            </ul>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section key={si}>
                <h2 className="mb-3 text-lg font-bold text-slate-900">{section.title}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-left">
                        <th className="border border-slate-200 px-2 py-2 font-bold text-slate-700">Campo (key)</th>
                        <th className="border border-slate-200 px-2 py-2 font-bold text-slate-700">Rótulo</th>
                        <th className="border border-slate-200 px-2 py-2 font-bold text-slate-700">Tipo</th>
                        <th className="border border-slate-200 px-2 py-2 font-bold text-slate-700">Obrig.</th>
                        <th className="border border-slate-200 px-2 py-2 font-bold text-slate-700">Instruções de preenchimento e destino na peça</th>
                        <th className="border border-slate-200 px-2 py-2 font-bold text-slate-700">Opções / Exemplos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.fields.map((f, fi) => (
                        <tr key={fi} className={fi % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                          <td className="border border-slate-200 px-2 py-2 align-top font-mono text-[10px] text-brand">{f[0]}</td>
                          <td className="border border-slate-200 px-2 py-2 align-top font-medium text-slate-800">{f[1]}</td>
                          <td className="border border-slate-200 px-2 py-2 align-top text-slate-600">{f[2]}</td>
                          <td className="border border-slate-200 px-2 py-2 text-center align-top">
                            {f[3] === "sim" ? (
                              <span className="font-bold text-brand">Sim</span>
                            ) : f[3] === "não" ? (
                              <span className="text-slate-400">Não</span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="border border-slate-200 px-2 py-2 align-top leading-relaxed text-slate-700">{f[4]}</td>
                          <td className="border border-slate-200 px-2 py-2 align-top text-[10px] text-slate-500">{f[5]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )
          )}
        </div>
      </div>
    </main>
  );
}