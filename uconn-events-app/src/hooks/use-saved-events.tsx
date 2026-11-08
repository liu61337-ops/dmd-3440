import { createContext, useContext, useState, type ReactNode } from 'react';

import { events, type UConnEvent } from '@/data/events';

type SavedEventsValue = {
  savedIds: string[];
  savedEvents: UConnEvent[];
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;
  removeSaved: (id: string) => void;
  clearSaved: () => void;
};

const SavedEventsContext = createContext<SavedEventsValue | null>(null);

/** Demo state so the Saved Events screen has content on first launch. */
const INITIAL_SAVED_IDS = ['evt-career-fair', 'evt-movie-night', 'evt-hackathon'];

export function SavedEventsProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>(INITIAL_SAVED_IDS);

  const toggleSaved = (id: string) => {
    setSavedIds((current) =>
      current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id],
    );
  };

  const removeSaved = (id: string) => {
    setSavedIds((current) => current.filter((savedId) => savedId !== id));
  };

  const clearSaved = () => {
    setSavedIds([]);
  };

  const value: SavedEventsValue = {
    savedIds,
    savedEvents: events.filter((event) => savedIds.includes(event.id)),
    isSaved: (id: string) => savedIds.includes(id),
    toggleSaved,
    removeSaved,
    clearSaved,
  };

  return <SavedEventsContext.Provider value={value}>{children}</SavedEventsContext.Provider>;
}

export function useSavedEvents(): SavedEventsValue {
  const context = useContext(SavedEventsContext);
  if (!context) {
    throw new Error('useSavedEvents must be used within a SavedEventsProvider');
  }
  return context;
}
