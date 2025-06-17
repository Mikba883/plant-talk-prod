export const getOrCreateUserId = (): string => {
  let id = localStorage.getItem('plant_user_id');
  
  // Verifica se l'ID esiste e se è valido
  if (!id || !isValidUUID(id)) {
    id = crypto.randomUUID();  // Genera un nuovo UUID se non esiste o è invalido
    localStorage.setItem('plant_user_id', id);
  }

  return id;
};

// Funzione di validazione per un UUID
const isValidUUID = (id: string): boolean => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
};
