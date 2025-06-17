
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PremiumBadge from '@/components/PremiumBadge';

interface PlantIdentificationHeaderProps {
  isPremium: boolean;
  onPremiumBadgeClick: () => void;
  isLoading?: boolean;
}

const PlantIdentificationHeader: React.FC<PlantIdentificationHeaderProps> = ({
  isPremium,
  onPremiumBadgeClick,
  isLoading = false
}) => {
  const navigate = useNavigate();
  
  const handleBackToHome = () => {
    console.log('🏠 [Header] Back to Home button clicked');
    
    try {
      // Imposta flag per evitare auto-redirect quando si torna alla home
      sessionStorage.setItem('manualBackToHome', 'true');
      console.log('🏠 [Header] Manual back to home flag set');
      
      // Clear any payment-related data from sessionStorage
      sessionStorage.removeItem('plantData');
      sessionStorage.removeItem('capturedImage');
      
      console.log('🏠 [Header] Plant data cleared, attempting navigation...');
      navigate('/');
      
      // Fallback in case navigate doesn't work
      setTimeout(() => {
        if (window.location.pathname !== '/') {
          console.log('🏠 [Header] Using fallback navigation');
          sessionStorage.setItem('manualBackToHome', 'true');
          window.location.href = '/';
        }
      }, 100);
      
    } catch (error) {
      console.error('🏠 [Header] Navigation error:', error);
      // Ultimate fallback
      sessionStorage.setItem('manualBackToHome', 'true');
      window.location.href = '/';
    }
  };
  
  return (
    <div className="w-full max-w-md flex justify-between items-center mb-4">
      <Button 
        variant="ghost" 
        onClick={handleBackToHome}
        disabled={isLoading}
        className="p-0 h-9 text-plant-dark-green flex items-center hover:bg-plant-light-green/20 disabled:opacity-50"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Home
      </Button>
      
      <PremiumBadge 
        isPremium={isPremium} 
        onClick={onPremiumBadgeClick} 
      />
    </div>
  );
};

export default PlantIdentificationHeader;
