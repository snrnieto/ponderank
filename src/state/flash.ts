import { useSyncExternalStore } from 'react';

/**
 * Mensaje de confirmación que sobrevive a una navegación: el formulario lo deja al guardar y la
 * pantalla de la lista lo muestra al volver (p. ej. «Guardaste X · quedó #2»).
 */
export type Flash = { listId: string; message: string; itemId?: string; id: number };

let current: Flash | null = null;
let seq = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function setFlash(flash: Omit<Flash, 'id'>) {
  current = { ...flash, id: ++seq };
  emit();
}

export function clearFlash(id: number) {
  if (current?.id !== id) return;
  current = null;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** El mensaje pendiente para esta lista, o null. */
export function useFlash(listId: string): Flash | null {
  const flash = useSyncExternalStore(subscribe, () => current, () => current);
  return flash && flash.listId === listId ? flash : null;
}
