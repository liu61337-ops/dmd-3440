import React, { createContext, useState } from 'react';
import { existingDisputes, transaction } from './data/mockData';

// One shared place for everything the dispute flow needs:
// - the in-progress form fields (reason, notes) as the user fills them in
// - the list of submitted disputes, so the Disputes tab can show them
export const AppContext = createContext(null);

function makeReferenceNumber() {
  return 'DSP-' + Math.floor(10000 + Math.random() * 89999);
}

export function AppProvider({ children }) {
  const [reasonId, setReasonId] = useState(null);
  const [reasonLabel, setReasonLabel] = useState(null);
  const [notes, setNotes] = useState('');
  const [disputes, setDisputes] = useState(existingDisputes);

  function resetForm() {
    setReasonId(null);
    setReasonLabel(null);
    setNotes('');
  }

  function submitDispute() {
    const id = makeReferenceNumber();
    const newDispute = {
      id,
      merchant: transaction.merchant,
      amount: transaction.amount,
      date: transaction.date,
      status: 'submitted',
      reason: reasonLabel,
    };
    setDisputes((prev) => [newDispute, ...prev]);
    return id;
  }

  // Called manually from the Dispute Detail screen to demo the
  // "app tells you when it's resolved" improvement, instead of wiring up
  // a real backend + push notification pipeline.
  function resolveDispute(id) {
    setDisputes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'resolved', outcome: 'Credited' } : d))
    );
  }

  return (
    <AppContext.Provider
      value={{
        reasonId,
        setReasonId,
        reasonLabel,
        setReasonLabel,
        notes,
        setNotes,
        disputes,
        submitDispute,
        resolveDispute,
        resetForm,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
