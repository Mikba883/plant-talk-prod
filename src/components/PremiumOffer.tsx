
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Check, Sparkles, MessageSquare, BarChart3, Info } from 'lucide-react';

interface PremiumOfferProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PremiumOffer: React.FC<PremiumOfferProps> = ({ isOpen, onClose, onConfirm }) => {
  // Get selected language from sessionStorage
  const getSelectedLanguage = () => {
    return sessionStorage.getItem('selectedLanguage') || 'en';
  };

  const selectedLanguage = getSelectedLanguage();
  const isItalian = selectedLanguage === 'it';

  const features = [
    {
      icon: MessageSquare,
      title: isItalian ? "Chat con la tua pianta" : "Chat with your plant",
      description: isItalian ? "Fai domande e ricevi risposte personalizzate" : "Ask questions and get personalized responses"
    },
    {
      icon: BarChart3,
      title: isItalian ? "Analisi della salute" : "Health analysis",
      description: isItalian ? "Scopri cosa c'è che non va e come risolverlo" : "Discover what's wrong and how to fix it"
    },
    {
      icon: Info,
      title: isItalian ? "Consigli avanzati di cura" : "Advanced care tips",
      description: isItalian ? "Guida dettagliata per mantenere la pianta sana" : "Detailed guide to keep your plant healthy"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-plant-dark-green to-plant-light-green rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <DialogTitle className="text-2xl font-bold">
            {isItalian ? "Sblocca Premium" : "Unlock Premium"}
          </DialogTitle>
          
          <DialogDescription className="text-base">
            {isItalian 
              ? "Accesso completo a tutte le funzionalità premium con un singolo pagamento."
              : "Get full access to all premium features with a one-time payment."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-plant-light-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-4 h-4 text-plant-dark-green" />
              </div>
              <div>
                <h4 className="font-medium text-sm">{feature.title}</h4>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-plant-light-green/10 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl font-bold text-plant-dark-green">$4.99</span>
            <Badge variant="secondary" className="bg-plant-dark-green text-white">
              {isItalian ? "Una volta" : "One-time"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {isItalian 
              ? "Pagamento unico, accesso a vita"
              : "One-time payment, lifetime access"
            }
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {isItalian ? "Forse dopo" : "Maybe later"}
          </Button>
          <Button 
            onClick={onConfirm} 
            className="flex-1 bg-plant-dark-green hover:bg-plant-dark-green/90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isItalian ? "Sblocca ora" : "Unlock now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumOffer;
