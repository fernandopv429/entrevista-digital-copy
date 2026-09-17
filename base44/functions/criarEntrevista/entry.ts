import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';

// API pública para o sistema externo criar entrevistas.
// O sistema chamador envia a chave APROVACAO_API_KEY no header "x-api-key".
export default async function(req) {
  try {
    const apiKey = req.headers.get("x-api-key") || new URL(req.url).searchParams.get("api_key");
    if (!apiKey || apiKey !== secrets.get("APROVACAO_API_KEY")) {
      return Response.json({ error: "Unauthorized — API key inválida" }, { status: 401 });
    }

    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed — use POST" }, { status: 405 });
    }

    const body = await req.json();

    if (!body.RECL_NOME || !body.RECL_CPF) {
      return Response.json({ error: "RECL_NOME e RECL_CPF são obrigatórios" }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const created = await base44.asServiceRole.entities.Entrevista.create(body);

    return Response.json({ status: "ok", entrevista_id: created.id, data: created }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}