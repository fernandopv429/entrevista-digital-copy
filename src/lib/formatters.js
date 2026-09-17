const onlyDigits = (v) => (v ?? "").toString().replace(/\D/g, "");

export function formatCurrency(input) {
  const digits = onlyDigits(input);
  if (!digits) return "";
  const number = Number(digits) / 100;
  return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatCPF(input) {
  const d = onlyDigits(input).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function formatCNPJ(input) {
  const d = onlyDigits(input).slice(0, 14);
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function formatPhone(input) {
  const d = onlyDigits(input).slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

export function formatCEP(input) {
  const d = onlyDigits(input).slice(0, 8);
  return d.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}

export function applyFormat(format, value) {
  switch (format) {
    case "currency": return formatCurrency(value);
    case "cpf": return formatCPF(value);
    case "cnpj": return formatCNPJ(value);
    case "phone": return formatPhone(value);
    case "cep": return formatCEP(value);
    default: return value;
  }
}