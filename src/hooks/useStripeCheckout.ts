
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getOrCreateUserId } from '@/utils/getOrCreateUserId';

// ✅ Esportiamo i tipi per chiarezza e uso in PricingPage
export const PRICE_TYPE_LIFETIME = 'lifetime';
export const PRICE_TYPE_ONE_USE = 'one_time';

// ✅ Price ID reali di Stripe
export const PRICE_ID_LIFETIME = 'price_1RZHtyIOXShi2C98kbrhT8cH';
export const PRICE_ID_ONE_USE = 'price_1RZHutIOXShi2C98hODrHqEm';

type PriceType = typeof PRICE_TYPE_LIFETIME | typeof PRICE_TYPE_ONE_USE;

interface CheckoutParams {
  plant_user_id: string;
  price_id: string;
  grant_premium: boolean;
}

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createCheckoutSession = async ({ plant_user_id, price_id, grant_premium }: CheckoutParams) => {
    setLoading(true);
    console.log('💎 [StripeCheckout] Starting checkout process for price_id:', price_id);
    console.log('💎 [StripeCheckout] User ID:', plant_user_id);
    console.log('💎 [StripeCheckout] Grant premium:', grant_premium);

    try {
      // Uso del client Supabase invece di fetch diretto
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          plant_user_id,
          price_id,
          grant_premium,
        },
      });

      if (error) {
        console.error('❌ [StripeCheckout] Error:', error.message);
        toast({
          title: 'Payment Error',
          description: error.message || 'Unable to start checkout session.',
          variant: 'destructive',
        });
        throw new Error(error.message || 'Checkout session failed');
      }

      if (!data?.url) {
        console.error('❌ [StripeCheckout] No URL returned');
        toast({
          title: 'Payment Error',
          description: 'No checkout URL received.',
          variant: 'destructive',
        });
        throw new Error('No checkout URL received');
      }

      console.log('✅ [StripeCheckout] Redirecting to Stripe checkout:', data.url);
      window.location.href = data.url;
    } catch (error: any) {
      console.error('❌ [StripeCheckout] Exception:', error.message);
      toast({
        title: 'Payment Error',
        description: error.message || 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckoutSession,
    loading,
  };
};
