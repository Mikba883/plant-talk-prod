
/**
 * Detect if text is primarily in Italian or English
 * Returns 'it' for Italian, 'en' for English
 */
export const detectTextLanguage = (text: string): 'it' | 'en' => {
  if (!text || text.trim().length === 0) {
    // Fallback to session language
    const sessionLanguage = sessionStorage.getItem('selectedLanguage') || 'en';
    return sessionLanguage === 'it' ? 'it' : 'en';
  }

  const cleanText = text.toLowerCase().trim();
  
  // Italian indicators - expanded with more plant-specific terms
  const italianWords = [
    'ciao', 'sono', 'della', 'nella', 'alla', 'con', 'per', 'una', 'uno', 
    'che', 'non', 'più', 'può', 'anche', 'molto', 'bene', 'tutto', 'come',
    'dove', 'quando', 'perché', 'così', 'ancora', 'senza', 'dopo', 'prima',
    'cosa', 'fare', 'dire', 'andare', 'vedere', 'sapere', 'stare', 'dare',
    'ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno', 'sto', 'stai', 'sta',
    'pianta', 'acqua', 'luce', 'foglie', 'radici', 'fiori', 'terra', 'vaso',
    'oggi', 'bene', 'grazie', 'cura', 'innaffiare', 'sole', 'ombra', 'crescere',
    'felice', 'triste', 'bisogno', 'aiuto', 'salute', 'verde', 'bella'
  ];
  
  // English indicators - expanded with plant-specific terms
  const englishWords = [
    'hello', 'the', 'and', 'you', 'that', 'was', 'for', 'are', 'with', 'his',
    'they', 'have', 'this', 'from', 'one', 'had', 'word', 'but', 'what', 'some',
    'we', 'can', 'out', 'other', 'were', 'all', 'your', 'when', 'up', 'use',
    'how', 'said', 'each', 'she', 'which', 'their', 'time', 'will', 'about', 'if',
    'plant', 'water', 'light', 'leaves', 'roots', 'flowers', 'soil', 'pot', 'care',
    'today', 'good', 'thank', 'watering', 'sun', 'shade', 'grow', 'growing',
    'happy', 'sad', 'need', 'help', 'health', 'green', 'beautiful'
  ];

  let italianScore = 0;
  let englishScore = 0;

  // Count Italian words with better scoring
  italianWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = cleanText.match(regex);
    if (matches) {
      // Give more weight to longer, more distinctive words
      const weight = word.length > 4 ? 2 : 1;
      italianScore += matches.length * weight;
    }
  });

  // Count English words with better scoring
  englishWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = cleanText.match(regex);
    if (matches) {
      // Give more weight to longer, more distinctive words
      const weight = word.length > 4 ? 2 : 1;
      englishScore += matches.length * weight;
    }
  });

  // Italian-specific patterns that are very distinctive
  const italianPatterns = [
    /\bè\s/, /\bperché\b/, /\bpiù\s/, /\bcoì\s/, /\bperò\s/, /\bgiàs/,
    /\bmi\s/, /\bti\s/, /\bsi\s/, /\bci\s/, /\bvi\s/, /\bgli\b/, /\ble\b/
  ];
  
  // English-specific patterns
  const englishPatterns = [
    /\sthe\s/, /\sand\s/, /\syou\s/, /\sare\s/, /\shave\s/, /\sthis\s/,
    /\swith\s/, /\sthat\s/, /\swill\s/, /\scan\s/, /\swere\s/
  ];

  // Check for language patterns
  italianPatterns.forEach(pattern => {
    if (pattern.test(cleanText)) {
      italianScore += 3; // High weight for distinctive patterns
    }
  });

  englishPatterns.forEach(pattern => {
    if (pattern.test(cleanText)) {
      englishScore += 3; // High weight for distinctive patterns
    }
  });

  console.log(`🌍 [Language Detection] Text: "${text.substring(0, 50)}..."`);
  console.log(`🌍 [Language Detection] Italian score: ${italianScore}, English score: ${englishScore}`);

  // If scores are equal or both zero, use additional heuristics
  if (italianScore === englishScore) {
    // Check for Italian verb endings
    if (/\w(are|ere|ire)\b/.test(cleanText)) {
      italianScore += 2;
    }
    
    // Check for English common endings
    if (/\w(ing|ed|ly)\b/.test(cleanText)) {
      englishScore += 2;
    }
    
    // Fallback to session language if still tied
    if (italianScore === englishScore) {
      const sessionLanguage = sessionStorage.getItem('selectedLanguage') || 'en';
      console.log(`🌍 [Language Detection] Tie - using session language: ${sessionLanguage}`);
      return sessionLanguage === 'it' ? 'it' : 'en';
    }
  }

  const detectedLanguage = italianScore > englishScore ? 'it' : 'en';
  console.log(`🌍 [Language Detection] Final result: ${detectedLanguage}`);
  
  return detectedLanguage;
};

/**
 * Get the correct voice configuration for Google TTS based on detected language
 */
export const getVoiceForLanguage = (language: 'it' | 'en') => {
  if (language === 'it') {
    return {
      languageCode: 'it-IT',
      name: 'it-IT-Wavenet-A', // Female Italian voice
      ssmlGender: 'FEMALE'
    };
  } else {
    return {
      languageCode: 'en-US',
      name: 'en-US-Wavenet-F', // Female English voice  
      ssmlGender: 'FEMALE'
    };
  }
};
