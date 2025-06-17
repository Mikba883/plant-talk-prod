
/**
 * Helper functions for plant-related functionality - SEMPLIFICATO
 */

// Get a plant emoji based on plant name
export const getPlantEmoji = (plantName: string): string => {
  const name = plantName.toLowerCase();
  if (name.includes('cactus') || name.includes('succulent')) return '🌵';
  if (name.includes('monstera') || name.includes('philodendron')) return '🌿';
  if (name.includes('pothos') || name.includes('ivy')) return '🪴';
  if (name.includes('fern')) return '🌱';
  if (name.includes('palm')) return '🌴';
  if (name.includes('orchid') || name.includes('rose') || name.includes('lily')) return '🌺';
  return '🌱'; // Default plant emoji
};

// Tabella frequenze d'acqua basata sul tipo di pianta
const getWateringFrequency = (plantData: any) => {
  const plantType = (plantData.name || '').toLowerCase();
  const wateringInfo = (plantData.careInfo?.water || '').toLowerCase();
  
  // Tabella frequenze specifiche per tipo di pianta
  if (plantType.includes('cactus') || plantType.includes('succulent') || plantType.includes('aloe')) {
    return { min: 7, max: 14 }; // Piante grasse
  }
  
  if (plantType.includes('fern') || plantType.includes('calathea') || plantType.includes('peace lily')) {
    return { min: 2, max: 4 }; // Piante che amano umidità
  }
  
  if (plantType.includes('snake plant') || plantType.includes('zz plant') || plantType.includes('pothos')) {
    return { min: 5, max: 10 }; // Piante resistenti alla siccità
  }
  
  if (plantType.includes('monstera') || plantType.includes('philodendron') || plantType.includes('rubber tree')) {
    return { min: 4, max: 7 }; // Piante tropicali
  }
  
  if (plantType.includes('orchid')) {
    return { min: 7, max: 10 }; // Orchidee
  }
  
  if (plantType.includes('basil') || plantType.includes('mint') || plantType.includes('parsley')) {
    return { min: 1, max: 3 }; // Erbe aromatiche
  }
  
  // Frequenze basate su parole chiave nelle istruzioni di cura
  if (wateringInfo.includes('frequent') || wateringInfo.includes('moist') || wateringInfo.includes('wet')) {
    return { min: 2, max: 4 };
  }
  
  if (wateringInfo.includes('dry') || wateringInfo.includes('drought') || wateringInfo.includes('sparse')) {
    return { min: 7, max: 12 };
  }
  
  if (wateringInfo.includes('weekly') || wateringInfo.includes('week')) {
    return { min: 6, max: 8 };
  }
  
  // Default per piante comuni da appartamento
  return { min: 3, max: 7 };
};

// Esporta la funzione per usarla anche in altri componenti
export { getWateringFrequency };

// Generate a full speech content for the plant to "speak" 
// USA IL FORMATO ESATTO RICHIESTO DALL'UTENTE
export const generateFullSpeechContent = (plantData: any, isPremium: boolean) => {
  if (!plantData) {
    return "Hi! I'm your plant companion.";
  }

  // Per utenti NON premium: usa il formato ESATTO richiesto dall'utente
  if (!isPremium) {
    const name = plantData.commonName || plantData.name || 'plant friend';
    
    // Estrai informazioni dinamiche dal careInfo
    const sunlight = plantData.careInfo?.light || "moderate to bright indirect light";
    
    // Calcola frequenza acqua con tabella specifica
    const frequency = getWateringFrequency(plantData);
    const minWater = frequency.min;
    const maxWater = frequency.max;

    // MESSAGGIO ESATTO come richiesto dall'utente
    const message = `Hi, I'm your ${name}! I thrive in ${sunlight} and prefer to be watered every ${minWater} to ${maxWater} days. If you really want to take care of me, unlock premium to access personalized care tips and health tracking!`;

    console.log('🌿 [plantHelpers] Generated FREE user voice message:', message);
    console.log('🌿 [plantHelpers] Watering frequency calculated:', frequency);
    return message;
  }

  // Per utenti PREMIUM: usa il messaggio originale dall'API
  if (plantData.message) {
    console.log('🌿 [plantHelpers] Using PREMIUM plant message:', plantData.message);
    return plantData.message;
  }

  // Fallback per premium
  return `Hi! I'm your ${plantData.commonName || plantData.name || 'plant companion'}.`;
};

// Helper function to determine health label based on probability
export const getHealthLabel = (probability: number): string => {
  if (probability >= 0.95) return 'Elite';
  if (probability >= 0.90) return 'Healthy';
  if (probability >= 0.75) return 'Good, monitor';
  if (probability >= 0.60) return 'Slightly stressed';
  if (probability >= 0.40) return 'Unhealthy';
  return 'Critical';
};

// Helper function to get health category based on probability
export const getHealthCategory = (probability?: number): 'good' | 'fair' | 'needs-attention' => {
  if (probability === undefined) return 'fair';
  if (probability >= 0.85) return 'good';
  if (probability >= 0.65) return 'fair';
  return 'needs-attention';
};
