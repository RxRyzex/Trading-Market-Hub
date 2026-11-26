
export default async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const webhook = process.env.DISCORD_WEBHOOK_URL;

  if (!webhook) {
    return new Response("Webhook not configured", { status: 500 });
  }

  try {
    const data = await request.json();

    const required = [
      "name", "discord", "specialty", "experience",
      "teaching", "motivation", "contribution", "availability"
    ];

    for (const key of required) {
      if (typeof data[key] !== "string" || !data[key].trim()) {
        return new Response("Missing required fields", { status: 400 });
      }
    }

    const fields = [
      ["Nom", data.name],
      ["Discord", data.discord],
      ["Spécialité", data.specialty],
      ["Expérience", data.experience],
      ["Enseignement", data.teaching],
      ["Motivation", data.motivation],
      ["Contribution", data.contribution],
      ["Disponibilité", data.availability]
    ];

    const embed = {
      title: "📩 Nouvelle candidature — MARKET HUB",
      color: 3534490,
      fields: fields.map(([name, value]) => ({
        name,
        value: String(value).trim().slice(0, 1000),
        inline: false
      })),
      footer: { text: "MARKET HUB" },
      timestamp: new Date().toISOString()
    };

    const result = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [embed],
        allowed_mentions: { parse: [] }
      })
    });

    if (!result.ok) {
      return new Response("Discord delivery failed", { status: 502 });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch {
    return new Response("Server error", { status: 500 });
  }
};
