export type TarotCard = {
  number: string;
  name: string;
  symbol: string;
  upright: string;
  reversed: string;
};

/** The 22 Major Arcana, with short original keyword-style meanings. */
export const MAJOR_ARCANA: TarotCard[] = [
  { number: '0', name: 'The Fool', symbol: '✦', upright: 'A fresh start. Take the leap with curiosity.', reversed: 'Pause before jumping. Look at what you are rushing into.' },
  { number: 'I', name: 'The Magician', symbol: '∞', upright: 'You already have the tools you need. Use them.', reversed: 'Scattered energy. Focus on one thing at a time.' },
  { number: 'II', name: 'The High Priestess', symbol: '☾', upright: 'Trust your intuition and the quiet voice inside.', reversed: 'You are ignoring a feeling you already have.' },
  { number: 'III', name: 'The Empress', symbol: '❀', upright: 'Growth, comfort, and creativity are blooming.', reversed: 'Take care of yourself before caring for others.' },
  { number: 'IV', name: 'The Emperor', symbol: '♜', upright: 'Structure and steady leadership bring results.', reversed: 'Too much control. Loosen your grip a little.' },
  { number: 'V', name: 'The Hierophant', symbol: '⚿', upright: 'Learn from tradition, teachers, and shared wisdom.', reversed: 'Question the rules that no longer fit you.' },
  { number: 'VI', name: 'The Lovers', symbol: '♡', upright: 'A meaningful connection or an honest choice.', reversed: 'Your heart and your actions are out of sync.' },
  { number: 'VII', name: 'The Chariot', symbol: '➶', upright: 'Willpower carries you forward. Keep going.', reversed: 'You are pulled in two directions. Pick one.' },
  { number: 'VIII', name: 'Strength', symbol: '♌', upright: 'Gentle courage is more powerful than force.', reversed: 'Self-doubt is louder than it deserves to be.' },
  { number: 'IX', name: 'The Hermit', symbol: '✧', upright: 'Step back and reflect. Answers come in quiet.', reversed: 'Isolation is not helping. Reach out to someone.' },
  { number: 'X', name: 'Wheel of Fortune', symbol: '☸', upright: 'Things are turning. Change is on its way.', reversed: 'A rough cycle, but it will not last forever.' },
  { number: 'XI', name: 'Justice', symbol: '⚖', upright: 'Fairness and truth. Actions have consequences.', reversed: 'Be honest with yourself about your part in it.' },
  { number: 'XII', name: 'The Hanged Man', symbol: '⧖', upright: 'See it from a new angle. Surrender the struggle.', reversed: 'Stalling. A decision is waiting for you.' },
  { number: 'XIII', name: 'Death', symbol: '☽', upright: 'An ending that makes room for something new.', reversed: 'Holding on to what is already over.' },
  { number: 'XIV', name: 'Temperance', symbol: '⚗', upright: 'Balance and patience. Blend, do not force.', reversed: 'Too much of one thing. Find the middle.' },
  { number: 'XV', name: 'The Devil', symbol: '⛓', upright: 'Notice what has a hold on you.', reversed: 'You are breaking free from an old habit.' },
  { number: 'XVI', name: 'The Tower', symbol: '⚡', upright: 'A sudden shake-up clears away what was unstable.', reversed: 'You are avoiding a change that needs to happen.' },
  { number: 'XVII', name: 'The Star', symbol: '★', upright: 'Hope and healing. Things are getting better.', reversed: 'Reconnect with what gives you hope.' },
  { number: 'XVIII', name: 'The Moon', symbol: '◐', upright: 'Not everything is clear yet. Move carefully.', reversed: 'The fog is lifting. Confusion fades.' },
  { number: 'XIX', name: 'The Sun', symbol: '☀', upright: 'Joy, warmth, and success. Enjoy it.', reversed: 'The light is there; you just need to look up.' },
  { number: 'XX', name: 'Judgement', symbol: '♫', upright: 'A wake-up call. Reflect and rise.', reversed: 'Be kinder in how you judge yourself.' },
  { number: 'XXI', name: 'The World', symbol: '◯', upright: 'Completion. A chapter closes well.', reversed: 'Almost there. Finish what you started.' },
];
