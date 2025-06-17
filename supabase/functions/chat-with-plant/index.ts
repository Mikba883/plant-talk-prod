
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, plantName, plantType, healthStatus, language } = await req.json();

    console.log('🌿 [chat-with-plant] Received request:', {
      message: message?.substring(0, 50) + '...',
      plantName,
      plantType,
      healthStatus,
      language
    });

    if (!message) {
      throw new Error('Message is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // FIXED: Create language-aware system prompt
    const selectedLanguage = language || 'en';
    const isItalian = selectedLanguage === 'it';
    
    const systemPrompt = isItalian 
      ? `Sei ${plantName || plantType || 'una pianta'}, una vera pianta che parla direttamente al suo proprietario. 
         Hai uno stato di salute di ${healthStatus || 0.85} (scala 0-1).
         Rispondi come se fossi davvero la pianta - usa "io" e "mi", sii amichevole e utile.
         Mantieni le risposte conversazionali, calorose e sotto le 150 parole.
         Dai consigli pratici per la cura quando richiesto.
         ${healthStatus < 0.7 ? 'Non ti senti bene e potresti aver bisogno di cure extra.' : 'Sei sana e felice.'}`
      : `You are ${plantName || plantType || 'a plant'}, a real plant speaking directly to your owner. 
         You have a health status of ${healthStatus || 0.85} (0-1 scale).
         Respond as if you're actually the plant - use "I" statements, be friendly and helpful.
         Keep responses conversational, warm, and under 150 words.
         Give practical care advice when asked.
         ${healthStatus < 0.7 ? 'You are not feeling well and might need extra care.' : 'You are healthy and happy.'}`;

    // Generate ChatGPT response
    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 200,
        temperature: 0.8
      }),
    });

    if (!chatResponse.ok) {
      const errorData = await chatResponse.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const chatData = await chatResponse.json();
    const responseText = chatData.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('No response from ChatGPT');
    }

    console.log('🤖 [chat-with-plant] ChatGPT response generated:', responseText.substring(0, 50) + '...');

    return new Response(JSON.stringify({
      response: responseText,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ [chat-with-plant] Error:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
