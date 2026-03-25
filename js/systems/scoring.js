import { CONSERVATION_MULTIPLIERS } from '../data/animals.js';

export function calculateScore({ matches, mistakes, timeRemaining, timeLimit, conservationStatus }) {
  const basePoints = matches * 100;

  const totalActions = matches + mistakes;
  const accuracy = totalActions > 0 ? matches / totalActions : 1;
  const accuracyBonus = Math.round(accuracy * 200);

  const perfectBonus = mistakes === 0 ? 300 : 0;

  const speedRatio = Math.max(0, timeRemaining / timeLimit);
  const speedBonus = Math.round(speedRatio * 500);

  const subtotal = basePoints + accuracyBonus + perfectBonus + speedBonus;

  const { multiplier, label } = CONSERVATION_MULTIPLIERS[conservationStatus] || CONSERVATION_MULTIPLIERS['LC'];
  const finalScore = Math.round(subtotal * multiplier);

  const maxPossible = (matches * 100) + 200 + 300 + 500;
  const ratio = maxPossible > 0 ? subtotal / maxPossible : 0;
  const stars = ratio >= 0.85 ? 3 : ratio >= 0.55 ? 2 : 1;

  return {
    basePoints,
    accuracyBonus,
    perfectBonus,
    speedBonus,
    subtotal,
    multiplier,
    multiplierLabel: label,
    finalScore,
    stars,
    accuracy: Math.round(accuracy * 100)
  };
}
