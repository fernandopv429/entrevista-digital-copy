import React from "react";
import { Info } from "lucide-react";

// Aviso único sobre a hierarquia de valores padrão. Existe porque o gerador,
// sem valor informado, calcula sobre o piso da convenção e devolve a minuta
// marcada para revisão — o entrevistador precisa saber disso no momento em que
// decide deixar um campo em branco, não depois.
export default function AvisoEstimativa() {
  return (
    <div className="flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
      <div className="space-y-1 text-sm text-blue-900">
        <p className="font-semibold">Valores em branco viram estimativa provisória</p>
        <p>
          Caso não saiba o valor exato diário ou salarial, o sistema utilizará como estimativa
          provisória o piso da Convenção Coletiva (CCT) ou o piso estadual da categoria, conforme o
          art. 840, § 1º, da CLT. O valor estimado entra na minuta como provisório, a apurar em
          liquidação, e a peça volta marcada para revisão — informar o valor real sempre produz um
          pedido melhor.
        </p>
      </div>
    </div>
  );
}
