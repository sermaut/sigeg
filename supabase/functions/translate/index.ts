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
    const { text, source, target } = await req.json();
    
    // Validar idiomas (apenas pt e fr)
    const allowedLanguages = ['pt', 'fr'];
    if (!allowedLanguages.includes(source) || !allowedLanguages.includes(target)) {
      throw new Error('Apenas traduções entre Português (pt) e Francês (fr) são suportadas');
    }

    console.log(`Translating from ${source} to ${target}: "${text.substring(0, 50)}..."`);

    // Chamar API pública LibreTranslate
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: source,
        target: target,
        format: 'text'
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('LibreTranslate API error:', data.error);
      throw new Error(data.error);
    }

    console.log(`Translation successful: "${data.translatedText?.substring(0, 50)}..."`);

    return new Response(
      JSON.stringify({ translatedText: data.translatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro ao traduzir' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
