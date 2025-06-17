
/**
 * SISTEMA SESSION ID PER GESTIONE PREMIUM CORRETTA
 * Premium status persiste SOLO per la stessa foto/sessione
 */

export const clearAllPlantData = () => {
  console.log('🔥 [DRASTICO] === CANCELLAZIONE TOTALE ===');
  
  // Salva dati importanti prima della cancellazione
  const premiumStatus = sessionStorage.getItem('isPremium');
  const currentSessionId = sessionStorage.getItem('currentSessionId');
  
  // Cancella localStorage COMPLETAMENTE per plant data
  const localStorageKeys = Object.keys(localStorage);
  localStorageKeys.forEach(key => {
    if (key.includes('plant') || 
        key.includes('lovable') || 
        key.includes('result') || 
        key.includes('health') ||
        key.includes('supabase') ||
        key.includes('chat') ||
        key.includes('audio') ||
        key.includes('tts') ||
        key.includes('timestamp')) {
      localStorage.removeItem(key);
      console.log(`🔥 [DRASTICO] Rimosso localStorage: ${key}`);
    }
  });
  
  // Cancella sessionStorage COMPLETAMENTE (tranne dati critici)
  const sessionStorageKeys = Object.keys(sessionStorage);
  sessionStorageKeys.forEach(key => {
    if (key !== 'isPremium' && key !== 'currentSessionId' && key !== 'lastSessionId') {
      sessionStorage.removeItem(key);
      console.log(`🔥 [DRASTICO] Rimosso sessionStorage: ${key}`);
    }
  });
  
  // Ripristina dati critici
  if (premiumStatus) {
    sessionStorage.setItem('isPremium', premiumStatus);
    console.log(`💎 [DRASTICO] Premium status preservato: ${premiumStatus}`);
  }
  
  if (currentSessionId) {
    sessionStorage.setItem('currentSessionId', currentSessionId);
    console.log(`🆔 [DRASTICO] Session ID preservato: ${currentSessionId}`);
  }
  
  console.log('✅ [DRASTICO] === CANCELLAZIONE TOTALE COMPLETATA ===');
};

export const generateSessionId = () => {
  const sessionId = `plant-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log(`🆔 [SESSION] Nuovo session ID generato: ${sessionId}`);
  return sessionId;
};

export const markNewImageSession = (sessionId: string) => {
  const previousSessionId = sessionStorage.getItem('currentSessionId');
  
  sessionStorage.setItem('currentSessionId', sessionId);
  sessionStorage.setItem('sessionStartTime', Date.now().toString());
  
  console.log(`🆔 [SESSION] Marcata nuova sessione immagine: ${sessionId}`);
  console.log(`🆔 [SESSION] Sessione precedente: ${previousSessionId}`);
  
  // Se è una nuova sessione, resetta premium
  if (previousSessionId && previousSessionId !== sessionId) {
    console.log(`💎 [SESSION] NUOVA SESSIONE RILEVATA - Reset premium necessario`);
    return true; // Indica che è una nuova sessione
  }
  
  return false; // Stessa sessione
};

export const isPremiumValidForCurrentSession = (): boolean => {
  const isPremium = sessionStorage.getItem('isPremium') === 'true';
  const currentSessionId = sessionStorage.getItem('currentSessionId');
  const lastSessionId = sessionStorage.getItem('lastSessionId');
  
  console.log(`💎 [SESSION] Check premium validity:`);
  console.log(`💎 [SESSION] - Premium status: ${isPremium}`);
  console.log(`💎 [SESSION] - Current session: ${currentSessionId}`);
  console.log(`💎 [SESSION] - Last session: ${lastSessionId}`);
  
  // Premium è valido solo se è true E siamo nella stessa sessione
  const isValid = isPremium && currentSessionId === lastSessionId;
  
  console.log(`💎 [SESSION] Premium valid: ${isValid}`);
  return isValid;
};

export const activatePremiumForCurrentSession = () => {
  const currentSessionId = sessionStorage.getItem('currentSessionId');
  
  sessionStorage.setItem('isPremium', 'true');
  sessionStorage.setItem('lastSessionId', currentSessionId || '');
  sessionStorage.setItem('premiumActivatedAt', Date.now().toString());
  
  console.log(`💎 [SESSION] Premium attivato per sessione: ${currentSessionId}`);
};
