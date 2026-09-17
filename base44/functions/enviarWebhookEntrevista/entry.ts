import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    // O formulário de entrevista é público (sem login) — boa parte das
    // entrevistas chega anônima. Exigir usuário autenticado aqui fazia o
    // envio falhar com 401 antes de tentar, e o Home.jsx engole esse erro
    // silenciosamente ("webhook failure não impede o salvamento"), então o
    // caso nunca saía daqui. auth.me() é só pra enriquecer o payload agora.
    const user = await base44.auth.me().catch(() => null);

    const secret1 = secrets.get("WEBHOOK_SECRET");
    const secret2 = secrets.get("WEBHOOK_SECRET_2");
    const webhookTargets = [
      { url: secrets.get("WEBHOOK_URL"), secret: secret1 },
      { url: secrets.get("WEBHOOK_URL_2"), secret: secret2 || secret1 }
    ].filter(w => w.url);

    if (webhookTargets.length === 0) return Response.json({ error: 'Nenhum webhook URL configurado' }, { status: 500 });

    const entrevista = await req.json();

    const brasiliaTimestamp = new Date().toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo", hour12: false }).replace(" ", "T") + "-03:00";

    const payload = JSON.stringify({
      event: "entrevista.salva",
      id: entrevista.id,
      created_by: user?.email || "anonimo",
      timestamp: brasiliaTimestamp,
      data: entrevista
    });

    const results = await Promise.all(webhookTargets.map(async (w) => {
      try {
        const headers = { "Content-Type": "application/json" };
        if (w.secret) headers["X-Webhook-Secret"] = w.secret;
        const res = await fetch(w.url, { method: "POST", headers, body: payload });
        return { url: w.url, status: res.status, ok: res.ok };
      } catch (err) {
        return { url: w.url, status: 0, ok: false, error: err.message };
      }
    }));

    const anyOk = results.some(r => r.ok);
    return Response.json({ success: anyOk, webhooks: results }, { status: anyOk ? 200 : 502 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}