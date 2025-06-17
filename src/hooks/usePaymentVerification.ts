
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getOrCreateUserId } from '@/utils/getOrCreateUserId';

const verifyPaymentSession = async (sessionId: string): Promise<boolean> => {
  try {
    console.log('🔍 [PaymentVerification] Verifying payment session:', sessionId);

    const { data, error } = await supabase.functions.invoke('verify-payment', {
      body: { session_id: sessionId }
    });

    if (error) {
      console.error('❌ [PaymentVerification] Error verifying payment:', error);
      return false;
    }

    const isPaid = data?.paid === true;
    const isLifetime = data?.permanent_premium === true;

    console.log('✅ [PaymentVerification] Payment verification result:', data);

    if (isPaid && isLifetime) {
      const plant_user_id = getOrCreateUserId();

      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ 
          is_premium: true,
          updated_at: new Date().toISOString()
        })
        .eq("plant_user_id", plant_user_id);

      if (updateError) {
        console.error("❌ Failed to update is_premium:", updateError.message);
      } else {
        console.log("✅ is_premium updated for plant_user_id:", plant_user_id);
      }

      sessionStorage.setItem('isPremium', 'true');
    } else if (isPaid) {
      // One-time access
      sessionStorage.setItem('hasOneTimeAccess', 'true');
      sessionStorage.setItem('isPremium', 'true');
    }

    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);

    return isPaid;
  } catch (error) {
    console.error('❌ Exception during verification:', error);
    return false;
  }
};

export const usePaymentVerification = () => {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      setLoading(true);
      
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        const plant_user_id = getOrCreateUserId();

        if (sessionId) {
          console.log('🔍 Found session_id in URL, verifying payment...');
          const verified = await verifyPaymentSession(sessionId);
          setIsPremium(verified);
        } else {
          const storedPremium = sessionStorage.getItem('isPremium');
          const hasOneTimeAccess = sessionStorage.getItem('hasOneTimeAccess');
          
          if (storedPremium === 'true' || hasOneTimeAccess === 'true') {
            setIsPremium(true);
          } else {
            const { data } = await supabase
              .from('user_profiles')
              .select('is_premium')
              .eq('plant_user_id', plant_user_id)
              .maybeSingle();

            if (data?.is_premium) {
              setIsPremium(true);
              sessionStorage.setItem('isPremium', 'true');
            }
          }
        }
      } catch (error) {
        console.error('❌ Error checking payment status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, []);

  return { isPremium, loading, verifyPaymentSession };
};
