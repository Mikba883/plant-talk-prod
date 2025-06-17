
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStripeCheckout, PRICE_ID_LIFETIME, PRICE_ID_ONE_USE } from '@/hooks/useStripeCheckout';
import { getOrCreateUserId } from '@/utils/getOrCreateUserId';

const PricingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createCheckoutSession, loading } = useStripeCheckout();

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = getOrCreateUserId();
      console.log('💎 [PricingPage] User ID:', id);
      setUserId(id);
    };
    fetchUserId();
  }, []);

  const handleSubscribe = async (type: 'oneTime' | 'lifetime') => {
    if (!userId) {
      console.error('❌ [PricingPage] No user ID available');
      toast({
        title: "Error",
        description: "User ID not available. Please try again.",
        variant: "destructive",
      });
      return;
    }

    console.log('💎 [PricingPage] Starting Stripe checkout:', type);

    try {
      const priceId = type === 'oneTime' ? PRICE_ID_ONE_USE : PRICE_ID_LIFETIME;
      const grantPremium = type === 'lifetime';

      console.log('💎 [PricingPage] Price ID:', priceId);
      console.log('💎 [PricingPage] Grant Premium:', grantPremium);

      await createCheckoutSession({
        plant_user_id: userId,
        price_id: priceId,
        grant_premium: grantPremium,
      });

    } catch (error) {
      console.error('❌ [PricingPage] Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 flex flex-col items-center">
        <div className="w-full max-w-md mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-plant-dark-green flex items-center mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>

          <Card className="w-full overflow-hidden">
            <div className="bg-gradient-to-r from-plant-dark-green to-plant-light-green p-4 text-white">
              <h3 className="font-bold text-xl">Unlock Premium Features</h3>
              <p className="text-sm opacity-90">Give Your Plants a Better Life</p>
            </div>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-plant-dark-green mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Your plant speaks – A warm AI-generated voice tells you exactly what it needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-plant-dark-green mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Better care, less stress – Smart, customized care instructions based on plant type and condition</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-plant-dark-green mt-0.5 flex-shrink-0" />
                  <span className="text-sm">No more overwatering or neglect – Get the right timing for watering and light</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-plant-dark-green mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Longer life, stronger growth – Keep your plant in perfect shape, season after season</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex gap-2 pt-2 flex-col">
              <div className="flex gap-2 w-full">
                <Button
                  onClick={() => handleSubscribe('oneTime')}
                  variant="outline"
                  className="flex-1 border-plant-dark-green text-plant-dark-green hover:bg-plant-dark-green/10"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : '$4.99 One use'}
                </Button>
                <Button
                  onClick={() => handleSubscribe('lifetime')}
                  className="flex-1 bg-plant-dark-green hover:bg-plant-dark-green/90"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : '$24.99 Lifetime'}
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Secure payment powered by Stripe. No subscription.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
