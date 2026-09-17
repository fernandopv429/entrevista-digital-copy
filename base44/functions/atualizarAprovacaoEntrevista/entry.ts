import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';

// API pública para o sistema externo aprovar/reprovar entrevistas.
// O sistema chamador envia a chave APROVACAO_API_KEY no header "x-api-key".
export default async function(req) {
  try {
    // Validação por API key — qualquer sistema pode chamar, mas precisa da chave.
    const apiKey = req.headers.get("x-api-key") || new URL(req.url).searchParams.get("api_key");
    if (!apiKey || apiKey !== secrets.get("APROVACAO_API_KEY")) {
      return Response.json({ error: "Unauthorized — API key inválida" }, { status: 401 });
    }

    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed — use POST" }, { status: 405 });
    }

    const body = await req.json();
    const { entrevista_id, status, motivo } = body;

    if (!entrevista_id) {
      return Response.json({ error: "entrevista_id é obrigatório" }, { status: 400 });
    }

    if (!["aprovado", "reprovado"].includes(status)) {
      return Response.json({ error: "status deve ser 'aprovado' ou 'reprovado'" }, { status: 400 });
    }

    if (status === "reprovado" && !(motivo || "").trim()) {
      return Response.json({ error: "motivo é obrigatório quando status = reprovado" }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const updateData = { aprovacao_status: status };
    if (status === "reprovado") updateData.aprovacao_motivo = motivo.trim();
    else updateData.aprovacao_motivo = "";

    await base44.asServiceRole.entities.Entrevista.update(entrevista_id, updateData);

    return Response.json({ status: "ok", entrevista_id, aprovacao_status: status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}