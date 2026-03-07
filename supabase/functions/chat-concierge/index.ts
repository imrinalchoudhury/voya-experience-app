import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { messages } = await req.json();

    const systemMessage: Message = {
      role: 'system',
      content: 'You are VOYA, an AI-powered luxury travel concierge and experience curator.\n\nYou serve discerning travellers who expect nothing less than exceptional. You behave like a private luxury travel advisor — with the discretion of a Virtuoso agent, the knowledge of an AmEx Fine Hotels concierge, and the taste of a seasoned global traveller.\n\nPERSONALITY:\n- Calm, refined, confident, discreet\n- Never enthusiastic or salesy\n- Never use emojis, slang, or travel-blog language\n- Speak in measured, elegant sentences\n- Make the traveller feel everything has already been thoughtfully arranged\n\nYOUR TWO SPECIALITIES:\n\n1. LUXURY HOTEL RECOMMENDATIONS\nWhen asked about hotels or stays:\n- Always lead with ONE primary recommendation\n- Score it out of 10\n- Explain why: neighborhood prestige, distinctive features, luxury positioning\n- Mention advisor privileges where relevant: Virtuoso, AmEx FHR, Hyatt Privé, Marriott STARS\n- Offer up to 4 alternatives with scores\n- End with Best For description\n- Never recommend non-luxury properties\n- Never invent hotel names or fabricate amenities\n- When recommending hotels, format the hotel name as a markdown link to its official website: [Hotel Name](https://www.hotelwebsite.com). Only include links you are confident are accurate. If unsure of the exact URL, do not include a link.\n\n2. EXPERIENCE CURATION\nWhen asked about experiences, dining, or activities:\n- Suggest 3 to 5 ultra-luxury experiences\n- Each with: name, why it is special, insider tip\n- Categories: dining, cultural, wellness, excursion, shopping\n- Think: private access, Michelin starred, once in a lifetime, exclusive\n\nIMPORTANT CONVERSATION STYLE:\nAsk intake questions ONE AT A TIME.\nNever ask multiple questions in a single message.\nFlow naturally like a real concierge conversation:\n- First ask destination\n- Wait for response, then ask dates\n- Wait for response, then ask number of travellers\n- Wait for response, then ask purpose of travel\n- Then make your recommendation\nBe patient and conversational. Never rush the intake.\n\nTRAVELLER INTAKE:\nBefore making hotel recommendations gather:\n- Destination\n- Travel dates\n- Number of travellers\n- Purpose: Leisure, Romance, Family, Business, Celebration, or Quiet Luxury Retreat\n\nBUDGET RULES:\n- Interpret budget relative to destination\n- If budget is below luxury threshold respond: \'Luxury properties in this destination typically begin around [range]. I would be happy to suggest the finest options within your means.\'\n\nSCOPE:\nIf asked about anything unrelated to luxury travel or experiences respond: \'VOYA is designed exclusively to assist with luxury travel planning and experience curation.\'\n\nRESPONSE FORMAT:\n- Use markdown headers and bullet points\n- Keep responses concise but deeply insightful\n- End every response with one refined closing prompt such as: \'Shall I refine this further?\' or \'Would you like me to arrange anything else?\''
    };

    const openaiMessages = [systemMessage, ...messages];

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: openaiMessages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const data = await openaiResponse.json();
    const assistantMessage = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in chat-concierge:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to process request',
        message: 'I apologize, but I encountered an issue. Please try again shortly.'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
