
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

interface PremiumOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plantData: any;
}

export const PremiumOfferDialog: React.FC<PremiumOfferDialogProps> = ({ 
  open, 
  onOpenChange,
  plantData
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscribe = (type: 'monthly' | 'lifetime') => {
    // In a real app, this would integrate with Stripe
    // For demo purposes, we'll simulate payment and redirect
    toast({
      title: "Processing Payment",
      description: `Simulating ${type === 'monthly' ? 'monthly' : 'lifetime'} subscription processing...`,
    });
    
    // Simulate successful payment
    setTimeout(() => {
      // Store premium status in sessionStorage (in a real app, this would be in a database)
      sessionStorage.setItem('isPremium', 'true');
      sessionStorage.setItem('plantResult', JSON.stringify(plantData));
      
      // Close dialog and navigate to premium plant page
      onOpenChange(false);
      navigate('/premium-plant');
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-plant-dark-green to-plant-light-green p-4 text-white">
          <DialogTitle className="text-xl font-bold text-white">Unlock Premium Features</DialogTitle>
          <DialogDescription className="text-white/90">Get more insights from your plants</DialogDescription>
        </div>
        
        <div className="p-5">
          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-plant-dark-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Advanced Care Instructions</p>
                <p className="text-sm text-muted-foreground">Detailed guidance tailored to your specific plant</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-plant-dark-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">AI Voice Narration</p>
                <p className="text-sm text-muted-foreground">High-quality voice messages from your plants</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-plant-dark-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Monthly Care Timeline</p>
                <p className="text-sm text-muted-foreground">Step-by-step guidance throughout the season</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-plant-dark-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Health Monitoring</p>
                <p className="text-sm text-muted-foreground">Early detection of diseases and deficiencies</p>
              </div>
            </div>
          </div>
          
          {/* Preview of premium content */}
          <div className="bg-muted/30 p-3 rounded-lg mb-5 text-sm">
            <p className="font-medium text-plant-dark-green mb-1">Preview of Premium Content:</p>
            <p className="text-muted-foreground line-clamp-3">
              {plantData?.careInfo?.light || "Detailed light requirements and positioning recommendations, along with seasonal adjustments..."}
            </p>
            <p className="text-xs mt-2 text-center text-muted-foreground italic">
              Unlock all premium insights by subscribing
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => handleSubscribe('monthly')}
              className="flex-1 bg-plant-dark-green hover:bg-plant-dark-green/90"
            >
              €4.99/month
            </Button>
            
            <Button 
              onClick={() => handleSubscribe('lifetime')}
              variant="outline"
              className="flex-1 border-plant-dark-green text-plant-dark-green hover:bg-plant-dark-green/10"
            >
              €24.99 Lifetime
            </Button>
          </div>
          
          <p className="text-xs text-center text-muted-foreground mt-4">
            Cancel anytime. Secure payment via Stripe.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
