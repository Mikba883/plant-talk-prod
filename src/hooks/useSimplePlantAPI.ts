
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface SimplePlantData {
  id: string;
  name: string;
  commonName: string;
  scientificName: string;
  confidence: number;
  description: string;
  message: string;
  health: 'good' | 'fair' | 'needs-attention';
  healthProbability: number;
  careInfo: {
    light: string;
    water: string;
    temperature: string;
  };
  diseases: Array<{
    name: string;
    probability: number;
    description: string;
    treatment: string;
  }>;
  wikipediaUrl?: string;
  wikiDescription?: string;
  synonyms?: string[];
  taxonomy?: {
    family?: string;
    genus?: string;
    class?: string;
    order?: string;
  };
}

export const useSimplePlantAPI = () => {
  const [plantData, setPlantData] = useState<SimplePlantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for payment success from URL params
  const checkPaymentSuccess = async (): Promise<void> => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      console.log('💎 [PlantAPI] Payment success detected, checking premium status');

      // Clean the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);

      try {
        // Check if payment was successful
        const hasOneTimeAccess = sessionStorage.getItem('hasOneTimeAccess') === 'true';
        
        if (hasOneTimeAccess) {
          toast({
            title: "Payment Successful!",
            description: "You now have access to premium features for this plant.",
          });
        }
      } catch (error) {
        console.error('❌ Error in checkPaymentSuccess:', error);
      }

      // Wait for DB to update
      console.log('⌛ Waiting 2.5s for DB to update...');
      await new Promise(resolve => setTimeout(resolve, 2500));
    }
  };

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        setLoading(true);
        console.log('🌿 [SimplePlantAPI] Hook initialized');

        // 1️⃣ Check payment (and wait)
        await checkPaymentSuccess();

        // 2️⃣ Load image
        const storedImage = sessionStorage.getItem('capturedImage');
        if (!storedImage) {
          toast({ title: "No Image Found", description: "Please take a photo first.", variant: "destructive" });
          navigate('/');
          return;
        }
        setCapturedImage(storedImage);

        // 3️⃣ Load plant data
        const storedPlantData = sessionStorage.getItem('plantData');
        if (!storedPlantData) {
          toast({ title: "No Plant Data", description: "Please analyze your plant first.", variant: "destructive" });
          navigate('/');
          return;
        }

        const parsedPlantData = JSON.parse(storedPlantData);
        setPlantData(parsedPlantData);
        console.log('🌿 Plant data loaded:', parsedPlantData.commonName || parsedPlantData.name);

        // 4️⃣ Check premium status
        const sessionPremium = sessionStorage.getItem('isPremium') === 'true';
        const hasOneTimeAccess = sessionStorage.getItem('hasOneTimeAccess') === 'true';
        const effectivePremium = sessionPremium || hasOneTimeAccess;

        setIsPremium(effectivePremium);
        console.log('💎 Premium status:', effectivePremium);

      } catch (error) {
        console.error('❌ [SimplePlantAPI] Error loading data:', error);
        toast({
          title: "Data Loading Error",
          description: "Unable to load plant data. Please try again.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, toast]);

  return {
    plantData,
    loading,
    capturedImage,
    isPremium,
    usingMockData: false
  };
};
