
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    logStep("Stripe initialized");

    // Initialize Supabase with service role key for database operations
    const supabaseUrl = Deno.env.get("SB_URL");
    const supabaseServiceKey = Deno.env.get("SB_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    logStep("Supabase service client initialized");

    // Parse request body
    const { plant_user_id, price_id, grant_premium } = await req.json();
    if (!plant_user_id || !price_id) {
      throw new Error("plant_user_id and price_id are required");
    }
    logStep("Request parsed", { plant_user_id, price_id, grant_premium });

    // Ensure user profile exists in database
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('plant_user_id')
      .eq('plant_user_id', plant_user_id)
      .maybeSingle();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      logStep("Error checking user profile", profileCheckError);
      throw new Error(`Profile check error: ${profileCheckError.message}`);
    }

    if (!existingProfile) {
      logStep("Creating new user profile", { plant_user_id });
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          plant_user_id: plant_user_id,
          is_premium: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        logStep("Error creating user profile", insertError);
        throw new Error(`Failed to create user profile: ${insertError.message}`);
      }
      logStep("User profile created successfully");
    } else {
      logStep("User profile already exists");
    }

    // Create Stripe checkout session
    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/result?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        plant_user_id: plant_user_id,
        grant_permanent_premium: grant_premium ? 'true' : 'false',
        purchase_type: grant_premium ? 'lifetime' : 'one_time'
      },
    });

    logStep("Stripe session created", { 
      sessionId: session.id, 
      url: session.url,
      metadata: session.metadata 
    });

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
