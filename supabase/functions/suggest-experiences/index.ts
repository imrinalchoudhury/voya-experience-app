import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  destination: string;
  request: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Validate API key exists
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    console.error("OPENAI_API_KEY not found");
    return new Response(
      JSON.stringify({ error: "API key not found" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  console.log("API key found, length:", apiKey.length);

  try {
    // Parse request body
    const { destination, request }: RequestBody = await req.json();

    console.log("Received request:", { destination, request });

    if (!destination || !request) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing destination or request" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call OpenAI API
    const openaiBody = {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an elite luxury travel concierge for Voya, the world's most prestigious travel planner. When given a destination and request, suggest exactly 5 ultra-luxury experiences. Return ONLY a valid JSON array, no markdown, no explanation: [{time, title, type, note}]"
        },
        {
          role: "user",
          content: `Destination: ${destination}\nRequest: ${request}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    };

    console.log("Calling OpenAI API with model:", openaiBody.model);

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(openaiBody),
      }
    );

    console.log("OpenAI response status:", openaiResponse.status);

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error response:", {
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        body: errorText
      });
      return new Response(
        JSON.stringify({
          error: "AI service error",
          debug: {
            status: openaiResponse.status,
            message: errorText
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiData = await openaiResponse.json();
    console.log("OpenAI response received");

    // Extract the text content and parse it as JSON
    const experiencesText = openaiData.choices[0].message.content;
    console.log("Experiences text:", experiencesText);

    const experiences = JSON.parse(experiencesText);
    console.log("Parsed experiences count:", experiences.length);

    return new Response(JSON.stringify({ experiences }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in suggest-experiences:", error);
    console.error("Error stack:", error.stack);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        debug: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
