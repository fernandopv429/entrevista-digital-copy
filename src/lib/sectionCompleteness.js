// "Vazio" para fins do indicador de seção incompleta: string vazia, null ou
// undefined. Importante: um booleano `false` (resposta "Não") NÃO é vazio —
// "Não" é uma resposta válida e preenche o campo.
export const isEmpty = (v) => v === undefined || v === null || v === "";

// true se algum dos campos informados ainda estiver vazio.
export const hasEmpty = (data, fields) => fields.some((f) => isEmpty(data[f]));