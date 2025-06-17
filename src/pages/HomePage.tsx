import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, ChevronDown, ArrowRight, Leaf, Camera, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CameraCapture from '@/components/CameraCapture';
import AnimatedLogo from '@/components/AnimatedLogo';
import { SimplePlantData } from '@/hooks/useSimplePlantAPI';
import { getOrCreateUserId } from '@/utils/getOrCreateUserId';
import { usePaymentVerification } from '@/hooks/usePaymentVerification';

const HomePage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isPremium, loading: premiumLoading } = usePaymentVerification();

  console.log('🏠 [HomePage] Premium status:', isPremium);

  // Auto-redirect premium users to result page SOLO se arrivano da un pagamento
  useEffect(() => {
    const checkForAutoRedirect = async () => {
      if (!premiumLoading && isPremium) {
        // Controlla se c'è un session_id nel URL (pagamento appena completato)
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        
        // Controlla se è presente un flag di redirect manuale bloccato
        const manualBackToHome = sessionStorage.getItem('manualBackToHome');
        
        // AUTO-REDIRECT solo se:
        // 1. C'è un session_id (pagamento appena completato) O
        // 2. Non c'è il flag di ritorno manuale E ci sono dati pianta
        if (sessionId) {
          console.log('🏠 [HomePage] Payment session detected, checking for plant data...');
          const storedPlantData = sessionStorage.getItem('plantData');
          if (storedPlantData) {
            console.log('🏠 [HomePage] Premium user with payment session and plant data, redirecting to result...');
            navigate('/result');
            return;
          }
        } else if (!manualBackToHome) {
          // Solo se non è un ritorno manuale, controlla i dati pianta
          const storedPlantData = sessionStorage.getItem('plantData');
          if (storedPlantData) {
            console.log('🏠 [HomePage] Premium user with plant data (not manual return), redirecting to result...');
            navigate('/result');
            return;
          }
        } else {
          // Se è un ritorno manuale, rimuovi il flag dopo 1 secondo per permettere futuri auto-redirect
          console.log('🏠 [HomePage] Manual back to home detected, skipping auto-redirect');
          setTimeout(() => {
            sessionStorage.removeItem('manualBackToHome');
            console.log('🏠 [HomePage] Manual back to home flag cleared');
          }, 1000);
        }
      }
    };

    checkForAutoRedirect();
  }, [isPremium, premiumLoading, navigate]);

  // Reset completo dei dati precedenti incluso premium status
  const resetPreviousData = () => {
    console.log('🔥 [HomePage] Resetting all previous plant data...');
    
    // Cancella tutti i dati di analisi precedenti dal sessionStorage
    const keysToReset = [
      'capturedImage',
      'lovable_plant_result',
      'lovable_health_result', 
      'plant_result_timestamp',
      'plantResult',
      'chatHistory',
      'lastChatMessage',
      'audioState'
    ];
    
    keysToReset.forEach(key => {
      sessionStorage.removeItem(key);
    });
    
    // NON resettare isPremium se è già true per mantenere lo stato premium
    if (!isPremium) {
      sessionStorage.setItem('isPremium', 'false');
    }
    
    console.log('✅ [HomePage] Previous data reset completed');
  };

  // CORRETTO: Funzione per analizzare la pianta con Plant.ID API - ora usa dati processati
  const analyzePlantWithAPI = async (imageData: string): Promise<SimplePlantData | null> => {
    console.log('🌱 [HomePage] Starting Plant.ID API analysis...');
    
    try {
      // Verifica formato immagine
      if (!imageData.startsWith('data:image/')) {
        throw new Error('Invalid image format - must start with data:image/');
      }

      console.log('🌱 [HomePage] Calling plant-identify edge function...');
      
      // Chiama la funzione Edge per Plant.ID
      const { data, error } = await supabase.functions.invoke('plant-identify', {
        body: {
          images: [imageData]
        }
      });

      console.log('🌱 [HomePage] Plant.ID response:', { data, error });

      if (error) {
        console.error('🌱 [HomePage] Edge function error:', error);
        throw new Error(`API Error: ${error.message}`);
      }

      // CORRETTO: Usa i dati processati dall'edge function invece di rigenerarli
      if (data?.processed) {
        console.log('🌱 [HomePage] Using processed data from edge function');
        console.log('🌱 [HomePage] Confidence from API:', data.processed.confidence);
        
        const processed = data.processed;
        
        // ✅ CONTROLLO CONFIDENZA MINIMA (10%)
        if (processed.confidence < 0.10) {
          console.log('❌ [HomePage] Low confidence detected:', processed.confidence);
          throw new Error('LOW_CONFIDENCE');
        }
        
        // Crea il SimplePlantData direttamente dai dati processati
        const plantData: SimplePlantData = {
          id: `plant-${Date.now()}`,
          name: processed.commonName || 'Unknown Plant',
          commonName: processed.commonName || 'Unknown Plant',
          scientificName: processed.scientificName || 'Unknown Species',
          confidence: processed.confidence || 0.5,
          description: processed.description || 'A beautiful plant identified from your photo.',
          message: processed.message || 'Hello! I\'m your new plant friend.',
          health: processed.health || 'good',
          healthProbability: processed.healthProbability || 0.85,
          careInfo: processed.careInfo || {
            light: "Bright indirect light",
            water: "Water when top 2 inches of soil are dry",
            temperature: "18-27°C (64-80°F)"
          },
          diseases: processed.diseases || [],
          wikipediaUrl: processed.wikipediaUrl || '',
          wikiDescription: processed.wikiDescription || '',
          synonyms: processed.synonyms || [],
          taxonomy: processed.taxonomy || {}
        };

        console.log('🌱 [HomePage] ✅ Using dynamic data from edge function:', plantData.commonName);
        console.log('🌱 [HomePage] Care info from API:', plantData.careInfo);
        return plantData;
      }

      // Fallback: usa i dati raw se processed non è disponibile
      console.log('🌱 [HomePage] No processed data, using fallback logic');
      
      let suggestions = [];
      
      if (data?.result?.classification?.suggestions) {
        suggestions = data.result.classification.suggestions;
      } else if (data?.classification?.suggestions) {
        suggestions = data.classification.suggestions;
      } else if (data?.suggestions) {
        suggestions = data.suggestions;
      } else if (Array.isArray(data)) {
        suggestions = data;
      }

      if (!suggestions || suggestions.length === 0) {
        console.error('🌱 [HomePage] No plant suggestions found');
        throw new Error('No plant identified in response');
      }

      const suggestion = suggestions[0];
      console.log('🌱 [HomePage] Fallback suggestion confidence:', suggestion.probability || suggestion.confidence || 'unknown');
      
      // ✅ CONTROLLO CONFIDENZA ANCHE NEL FALLBACK
      const confidence = suggestion.probability || suggestion.confidence || 0;
      if (confidence < 0.10) {
        console.log('❌ [HomePage] Low confidence in fallback:', confidence);
        throw new Error('LOW_CONFIDENCE');
      }
      
      const details = suggestion.plant_details || suggestion.details || {};
      
      // Fallback con dati limitati
      const plantData: SimplePlantData = {
        id: `plant-${Date.now()}`,
        name: details.common_names?.[0] || suggestion.plant_name || suggestion.name || 'Unknown Plant',
        commonName: details.common_names?.[0] || suggestion.plant_name || suggestion.name || 'Unknown Plant',
        scientificName: details.scientific_name || suggestion.scientific_name || 'Unknown Species',
        confidence: confidence,
        description: details.wiki_description?.value || details.description || 'A beautiful plant identified from your photo.',
        message: 'Hello! I\'m your plant. Upgrade to Premium to unlock my personality!',
        health: 'good',
        healthProbability: 0.85,
        careInfo: {
          light: "Bright indirect light",
          water: "Water when top 2 inches of soil are dry", 
          temperature: "18-27°C (64-80°F)"
        },
        diseases: [],
        wikipediaUrl: details.url || '',
        wikiDescription: details.wiki_description?.value || '',
        synonyms: details.synonyms || [],
        taxonomy: details.taxonomy || {}
      };

      console.log('🌱 [HomePage] ✅ Fallback data created:', plantData.commonName);
      return plantData;

    } catch (error) {
      console.error('🌱 [HomePage] ❌ Plant.ID API failed:', error);
      throw error;
    }
  };

  // Process image - ora gestisce tutto in Home
  const processImage = async (imageData: string) => {
    console.log('🌿 [HomePage] Starting image processing...');
    setIsProcessing(true);
    
    try {
      // STEP 1: Reset dati precedenti
      resetPreviousData();
      
      // STEP 2: Salva nuova immagine
      sessionStorage.setItem('capturedImage', imageData);
      console.log('🌿 [HomePage] New image stored in sessionStorage');
      
      // STEP 3: Analizza con Plant.ID API (ora usa dati processati)
      const plantData = await analyzePlantWithAPI(imageData);
      
      if (!plantData) {
        throw new Error('Failed to analyze plant');
      }
      
      // STEP 4: Salva risultati e naviga
      sessionStorage.setItem('plantData', JSON.stringify(plantData));
      console.log('🌿 [HomePage] Plant data stored, navigating to result...');
      
      toast({
        title: "Plant Identified!",
        description: `Meet your ${plantData.name}!`,
      });
      
      // Navigazione immediata con dati pronti
      navigate('/result');
      
    } catch (error) {
      console.error('❌ [HomePage] Processing error:', error);
      
      // ✅ GESTIONE SPECIALE PER BASSA CONFIDENZA
      if (error.message === 'LOW_CONFIDENCE') {
        toast({
          title: "Plant Recognition Failed", 
          description: "I'm not confident enough about this plant identification. Please try taking a clearer photo with better lighting.",
          variant: "destructive",
        });
      } else {
        // Altri errori generici
        toast({
          title: "Analysis Failed", 
          description: "Unable to identify your plant. Please try taking another photo.",
          variant: "destructive",
        });
      }
      
      setIsProcessing(false);
      setShowCamera(false);
    }
  };

  const handleLanguageClick = () => {
    toast({
      title: "Language Selection",
      description: "Currently only English is available. More languages coming soon!",
    });
  };

  const handleCameraButtonClick = () => {
    setShowCamera(true);
  };

  const handleUploadButtonClick = () => {
    setShowCamera(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-plant-light-green/10">
      {/* Language selector */}
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs flex items-center gap-1 backdrop-blur-sm bg-white/80 hover:bg-white/90 rounded-full px-4 py-2 shadow-sm"
          onClick={handleLanguageClick}
        >
          <Globe className="h-3 w-3" />
          EN
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="container px-4 py-4 flex flex-col items-center relative">
        {/* Header Section */}
        <div className="w-full max-w-2xl text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-3 pr-12">
            <AnimatedLogo className="w-16 h-16" />
            <h1 className="text-3xl md:text-4xl font-bold text-plant-dark-green tracking-tight">PlantTalk</h1>
          </div>
          <p className="text-lg md:text-xl font-light text-muted-foreground mb-3 leading-relaxed px-2">
            The first <span className="font-bold">smart AI plant care assistant</span> where your plants talk to you
          </p>
          {isPremium && (
            <div className="bg-gradient-to-r from-plant-dark-green to-plant-light-green text-white px-4 py-2 rounded-lg mb-3">
              <span className="text-sm font-medium">✨ Premium Access Active</span>
            </div>
          )}
        </div>
        
        {/* Camera Section */}
        <div className="w-full max-w-lg mb-4">
          {!showCamera ? (
            <Card className="w-full max-w-lg mx-auto plant-card-shadow bg-gradient-to-br from-white to-plant-light-green/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <p className="text-plant-dark-green/80 font-medium text-center">
                    Let Your Plants Speak
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="relative rounded-2xl overflow-hidden bg-gray-100 w-full aspect-[4/5] mb-4 shadow-xl">
                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                      <div className="text-center p-4">
                        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Ready to capture your plant</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full">
                    <Button 
                      onClick={handleCameraButtonClick}
                      className="w-full bg-plant-dark-green hover:bg-plant-dark-green/90 text-white rounded-xl h-11 font-medium shadow-lg"
                      disabled={isProcessing}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Take Photo
                    </Button>
                    
                    <Button 
                      onClick={handleUploadButtonClick}
                      variant="outline"
                      className="w-full border-2 border-plant-light-green text-plant-dark-green hover:bg-plant-light-green/10 rounded-xl h-11 font-medium"
                      disabled={isProcessing}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload from Gallery
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <CameraCapture 
              onImageCapture={processImage}
              isLoading={isProcessing}
              showPreview={showCamera}
            />
          )}
        </div>

        {/* How It Works Section */}
        <Card className="w-full max-w-5xl mb-6 bg-white/60 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-plant-dark-green mb-3">
                How PlantTalk Works
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                Our AI-powered assistant helps you understand and care for your plants like never before.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-plant-light-green/20 to-plant-light-green/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200 shadow-lg">
                  <Camera className="h-6 w-6 md:h-8 md:w-8 text-plant-dark-green" />
                </div>
                <h3 className="font-semibold text-plant-dark-green mb-3 text-base md:text-lg">1. Capture</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Snap a picture of your plant using your camera or upload from your gallery
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-plant-light-green/20 to-plant-light-green/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200 shadow-lg">
                  <Leaf className="h-6 w-6 md:h-8 md:w-8 text-plant-dark-green" />
                </div>
                <h3 className="font-semibold text-plant-dark-green mb-3 text-base md:text-lg">2. Analyze</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Our AI identifies your plant species and assesses its health condition
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-plant-light-green/20 to-plant-light-green/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200 shadow-lg">
                  <Camera className="h-6 w-6 md:h-8 md:w-8 text-plant-dark-green" />
                </div>
                <h3 className="font-semibold text-plant-dark-green mb-3 text-base md:text-lg">3. Talk to Your Plant</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  Talk to your plant – hear what it needs, ask it questions, and get personalized answers
                </p>
              </div>
            </div>
            
            <div className="flex justify-center mt-6 md:mt-8">
              <Button 
                variant="ghost" 
                className="text-plant-dark-green hover:bg-plant-light-green/10 rounded-full px-4 py-2 font-medium transition-all duration-200 hover:scale-105 text-sm md:text-base"
              >
                Learn more about PlantTalk
                <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs md:text-sm text-muted-foreground/80 max-w-md">
          <p className="flex items-center justify-center gap-1">
            Made with <Leaf className="h-3 w-3 text-plant-dark-green" /> for plant lovers everywhere
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
