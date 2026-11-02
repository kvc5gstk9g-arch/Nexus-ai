export default {
  async fetch(request, env) {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (request.method !== "POST") {
      return Response.json(
        { error: "Méthode non autorisée" },
        { status: 405, headers }
      );
    }

    try {
      const { message } = await request.json();

      if (!message || typeof message !== "string") {
        return Response.json(
          { error: "Écris un message." },
          { status: 400, headers }
        );
      }

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: message.slice(0, 4000) }]
            }]
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return Response.json(
          { error: data.error?.message || "Erreur Gemini" },
          { status: response.status, headers }
        );
      }

      const answer = data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "").join("") || "";

      return Response.json({ answer }, { headers });

    } catch (error) {
      return Response.json(
        { error: "Erreur serveur." },
        { status: 500, headers }
      );
    }
  }
};
