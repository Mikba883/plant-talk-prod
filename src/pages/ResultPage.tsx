
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlantIdentificationHeader from '@/components/result/PlantIdentificationHeader';
import PlantImageSection from '@/components/PlantImageSection';
import { Card, CardContent } from '@/components/ui/card';
import PlantInfoHeader from '@/components/PlantInfoHeader';
import PlantHappinessIndicator from '@/components/PlantHappinessIndicator';
import PlantChatSection from '@/components/result/PlantChatSection';
import PlantCareSection from '@/components/result/PlantCareSection';
import PlantCareInstructions from '@/components/PlantCareInstructions';
import PremiumOverlay from '@/components/PremiumOverlay';
import { generateFullSpeechContent } from '@/utils/plantHelpers';
import { useToast } from '@/hooks/use-toast';
import { usePaymentVerification } from '@/hooks/usePaymentVerification';

const ResultPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plantData, setPlantData] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [audioLoadingTime, setAudioLoadingTime] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const { isPremium, loading, verifyPaymentSession } = usePaymentVerification();

  console.log('🌿 [ResultPage] Premium status:', isPremium);
  console.log('🌿 [ResultPage] Loading state:', loading);
  console.log('🌿 [ResultPage] Initializing state:', isInitializing);

  useEffect(() => {
    const loadData = async () => {
      const startTime = performance.now();
      
      try {
        console.log('🌿 [ResultPage] Starting data load...');
        
        // Check for payment success from URL params FIRST
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        
        let showSuccessToast = false;
        if (sessionId) {
          console.log('🌿 [ResultPage] Payment session detected, verifying...');
          const isPaid = await verifyPaymentSession(sessionId);
          
          if (isPaid) {
            console.log('✅ [ResultPage] Payment verified successfully');
            sessionStorage.setItem('isPremium', 'true');
            showSuccessToast = true;
          }

          // Clean URL immediately after processing
          console.log('🌿 [ResultPage] Cleaning URL...');
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        }

        // Load plant data from sessionStorage
        const storedPlantData = sessionStorage.getItem('plantData');
        const storedImage = sessionStorage.getItem('capturedImage');
        
        if (!storedPlantData) {
          console.log('🌿 [ResultPage] No plant data, redirecting to home');
          navigate('/');
          return;
        }

        const parsedPlantData = JSON.parse(storedPlantData);
        setPlantData(parsedPlantData);
        setCapturedImage(storedImage);

        // Show success toast after everything is loaded
        if (showSuccessToast) {
          toast({
            title: "Payment Successful!",
            description: "You now have access to premium features!",
          });
        }

        const totalLoadTime = performance.now() - startTime;
        console.log('🌿 [ResultPage] Total data load time:', totalLoadTime.toFixed(2), 'ms');

      } catch (error) {
        console.error('🌿 [ResultPage] Error loading data:', error);
        toast({
          title: "Error",
          description: "Something went wrong loading your plant data.",
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
        console.log('🌿 [ResultPage] Initialization complete');
      }
    };

    loadData();
  }, [navigate, toast, verifyPaymentSession]);

  // Audio performance tracking
  useEffect(() => {
    if (plantData && !isPremium && !loading && !isInitializing) {
      console.log('🔊 [ResultPage] AUDIO PERFORMANCE: Starting audio load tracking');
      const audioStartTime = performance.now();
      
      // Track quando l'audio inizia effettivamente
      const trackAudioLoad = () => {
        const audioEndTime = performance.now();
        const loadTime = audioEndTime - audioStartTime;
        setAudioLoadingTime(loadTime);
        console.log('🔊 [ResultPage] AUDIO PERFORMANCE: Total audio load time:', loadTime.toFixed(2), 'ms');
      };

      // Simula il tracking dell'audio - questo dovrebbe essere collegato agli eventi audio reali
      setTimeout(trackAudioLoad, 1000);
    }
  }, [plantData, isPremium, loading, isInitializing]);

  // Handle premium badge click
  const handlePremiumBadgeClick = () => {
    console.log('🌿 [ResultPage] Premium badge clicked, navigating to pricing');
    navigate('/pricing');
  };

  // Combined loading state
  const isLoading = loading || isInitializing;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-plant-dark-green border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-plant-dark-green">Loading your plant data...</p>
        </div>
      </div>
    );
  }

  // No data state - redirect to home
  if (!plantData) {
    console.log('🌿 [ResultPage] No plant data, redirecting to home');
    navigate('/');
    return null;
  }

  console.log('🌿 [ResultPage] Rendering with plantData:', plantData);
  console.log('🌿 [ResultPage] isPremium:', isPremium);
  if (audioLoadingTime > 0) {
    console.log('🔊 [ResultPage] Audio loading took:', audioLoadingTime.toFixed(2), 'ms');
  }

  // Get formatted description for "Who I Am" section
  const getFormattedDescription = () => {
    const description = plantData.wikiDescription || 
                       plantData.description || 
                       `Hi! I'm your ${plantData.commonName || plantData.name}. I'm doing my best to stay healthy. 🌿`;
    return description.length > 250 ? description.substring(0, 247) + '...' : description;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 flex flex-col items-center">
        {/* Header with back button and premium badge */}
        <PlantIdentificationHeader 
          isPremium={isPremium} 
          onPremiumBadgeClick={handlePremiumBadgeClick}
          isLoading={isLoading}
        />
        
        <div className="w-full max-w-md">
          {/* Premium-style Card Layout */}
          <Card className="border-plant-dark-green/20 shadow-md overflow-hidden mb-6">
            <PlantInfoHeader 
              name={plantData.name}
              commonName={plantData.commonName}
              scientificName={plantData.scientificName} 
            />
            
            <CardContent className="p-5">
              {/* PREMIUM LAYOUT */}
              {isPremium ? (
                <>
                  {/* Happiness Index SOPRA Chat con effetto trasparenza */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg text-plant-dark-green mb-2 bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2">
                      Happiness Index
                    </h3>
                    <div className="bg-plant-light-green/10 p-3 rounded-lg border border-plant-light-green/30">
                      <PlantHappinessIndicator 
                        healthProbability={plantData.healthProbability}
                        isPremium={isPremium}
                      />
                    </div>
                  </div>

                  {/* Chat Section */}
                  <PlantChatSection 
                    isPremium={isPremium}
                    plantData={plantData}
                    onNavigateToPricing={handlePremiumBadgeClick}
                    capturedImage={capturedImage}
                  />
                </>
              ) : (
                <>
                  {/* NON-PREMIUM LAYOUT: Immagine con audio controls OTTIMIZZATI per velocità con AUTOPLAY ABILITATO */}
                  <PlantImageSection 
                    capturedImage={capturedImage} 
                    plantData={plantData}
                    generateFullSpeechContent={generateFullSpeechContent}
                    isPremium={isPremium}
                    isScanning={false}
                    autoPlay={true} // RIPRISTINO AUTOPLAY
                  />
                  
                  {/* Happiness Index - contenuto DINAMICO visibile ma non funzionale */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg text-plant-dark-green mb-2 bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2">
                      Happiness Index
                    </h3>
                    <div className="bg-plant-light-green/10 p-3 rounded-lg border border-plant-light-green/30">
                      <PlantHappinessIndicator 
                        healthProbability={plantData.healthProbability}
                        isPremium={isPremium}
                      />
                    </div>
                  </div>

                  {/* What I Need section - DINAMICO sempre visibile con plantData per indice min-max */}
                  <PlantCareInstructions 
                    careInfo={plantData.careInfo} 
                    plantData={plantData}
                  />
                  
                  {/* Who I Am section - DINAMICO sempre visibile con descrizione migliorata SENZA link Wikipedia */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg text-plant-dark-green mb-2">
                      Who I Am
                    </h3>
                    <div className="py-3 px-4 bg-plant-light-green/10 rounded-lg border border-plant-light-green/30">
                      <p className="text-sm">{getFormattedDescription()}</p>
                    </div>
                  </div>

                  {/* Chat Section SPOSTATA DOPO "Who I Am" */}
                  <div className="mb-6">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                      <PlantChatSection 
                        isPremium={isPremium}
                        plantData={plantData}
                        onNavigateToPricing={handlePremiumBadgeClick}
                        capturedImage={capturedImage}
                      />
                    </div>
                  </div>
                </>
              )}
              
              {/* What I Need section - sempre visibile per utenti premium con plantData */}
              {isPremium && (
                <PlantCareInstructions 
                  careInfo={plantData.careInfo}
                  plantData={plantData}
                />
              )}
              
              {/* Who I Am section - sempre visibile con descrizione migliorata per utenti premium CON link Wikipedia */}
              {isPremium && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg text-plant-dark-green mb-2">
                    Who I Am
                  </h3>
                  <div className="py-3 px-4 bg-plant-light-green/10 rounded-lg border border-plant-light-green/30">
                    <p className="text-sm">{getFormattedDescription()}</p>
                    {plantData.wikipediaUrl && (
                      <a 
                        href={plantData.wikipediaUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-plant-dark-green hover:underline mt-2 block"
                      >
                        Learn more on Wikipedia →
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              {/* Advanced Care section - premium overlay solo per utenti non premium */}
              {!isPremium ? (
                <PremiumOverlay
                  title="Advanced Care"
                  description="Discover how to keep me happy and what's wrong"
                  className="mb-6"
                >
                  <div>
                    <h3 className="font-semibold text-lg text-plant-dark-green mb-3">
                      How to Keep Me Happy 🌿
                    </h3>
                    <PlantCareSection 
                      plantData={plantData}
                      isPremium={false}
                    />
                  </div>
                </PremiumOverlay>
              ) : (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg text-plant-dark-green mb-3">
                    How to Keep Me Happy 🌿
                  </h3>
                  <PlantCareSection 
                    plantData={plantData}
                    isPremium={isPremium}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
