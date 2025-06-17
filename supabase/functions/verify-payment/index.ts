
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
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

    // Parse request body
    const { session_id } = await req.json();
    if (!session_id) throw new Error("session_id is required");
    logStep("Request parsed", { session_id });

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    logStep("Session retrieved", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status,
      metadata: session.metadata 
    });

    const isPaid = session.payment_status === 'paid';
    const purchaseType = session.metadata?.purchase_type || 'unknown';
    const plantUserId = session.metadata?.plant_user_id;
    const shouldGrantPermanentPremium = session.metadata?.grant_permanent_premium === 'true';

    logStep("Payment verification", { 
      isPaid, 
      purchaseType, 
      plantUserId,
      shouldGrantPermanentPremium 
    });

    // If it's a lifetime purchase and payment is successful, update the database
    if (isPaid && shouldGrantPermanentPremium && plantUserId) {
      const supabaseUrl = Deno.env.get("SB_URL");
      const supabaseServiceKey = Deno.env.get("SB_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false }
        });

        const { error: updateError } = await supabase
          .from('user_profiles')
          .upsert({
            plant_user_id: plantUserId,
            is_premium: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'plant_user_id'
          });

        if (updateError) {
          logStep("Error updating premium status", updateError);
        } else {
          logStep("Successfully granted permanent premium access", { plantUserId });
        }
      }
    }

    return new Response(JSON.stringify({ 
      paid: isPaid,
      purchase_type: purchaseType,
      session_id: session_id,
      permanent_premium: shouldGrantPermanentPremium && isPaid
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: errorMessage,
      paid: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
