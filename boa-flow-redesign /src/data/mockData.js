export const transaction = {
  id: 'txn_8823',
  merchant: 'Riverside Hardware Co.',
  amount: 214.67,
  date: 'Sep 17, 2026',
  account: 'Checking ...4821',
};

export const disputeReasons = [
  { id: 'unrecognized', label: "I don't recognize this charge" },
  { id: 'duplicate', label: 'I was charged twice' },
  { id: 'wrong_amount', label: 'Amount is incorrect' },
  { id: 'canceled', label: 'I canceled this order' },
  { id: 'other', label: 'Other' },
];

// Pre-existing disputes shown in the Disputes tab, so the list screen
// doesn't look empty on first load. The new dispute created during the
// flow gets appended to this list at runtime.
export const existingDisputes = [
  {
    id: 'DSP-90441',
    merchant: 'Cinema Nine Downtown',
    amount: 32.0,
    date: 'Sep 2, 2026',
    status: 'resolved',
    outcome: 'Credited',
    reason: "I don't recognize this charge",
  },
  {
    id: 'DSP-90112',
    merchant: 'Greenline Grocery',
    amount: 58.4,
    date: 'Aug 21, 2026',
    status: 'under_review',
    reason: 'I was charged twice',
  },
];
