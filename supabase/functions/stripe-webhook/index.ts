
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    logStep("Stripe initialized");

    // Get the body and signature
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }
    logStep("Signature verified");

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { eventType: event.type });
    } catch (err) {
      logStep("Webhook signature verification failed", err);
      return new Response("Webhook signature verification failed", { status: 400 });
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      logStep("Processing checkout.session.completed", { 
        sessionId: session.id,
        customerId: session.customer,
        metadata: session.metadata 
      });

      const { user_id, grant_permanent_premium } = session.metadata || {};
      
      if (!user_id) {
        logStep("No user_id in metadata, skipping");
        return new Response("No user_id in metadata", { status: 200 });
      }

      // Only proceed if grant_permanent_premium is true (lifetime purchases only)
      if (grant_permanent_premium === 'true') {
        // Initialize Supabase with service role key
        const supabaseUrl = Deno.env.get("SB_URL");
        const supabaseServiceKey = Deno.env.get("SB_SERVICE_ROLE_KEY");
        
        if (!supabaseUrl || !supabaseServiceKey) {
          throw new Error("Missing Supabase configuration");
        }
        
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false }
        });
        logStep("Supabase service client initialized");

        // Update user's premium status
        const { error: updateError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user_id,
            is_premium: true,
            stripe_customer_id: session.customer as string,
            updated_at: new Date().toISOString()
          });

        if (updateError) {
          logStep("Error updating user premium status", updateError);
          throw new Error(`Failed to update premium status: ${updateError.message}`);
        }

        logStep("Successfully granted permanent premium access", { user_id });
      } else {
        logStep("One-time purchase detected, skipping database update", { 
          purchaseType: session.metadata?.purchase_type 
        });
      }
    } else {
      logStep("Unhandled event type", { eventType: event.type });
    }

    return new Response("Webhook processed successfully", { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(`Webhook error: ${errorMessage}`, { status: 500 });
  }
});
