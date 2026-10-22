export const EXPECTATION_LABELS = ["Doesn't meet expectations", "Partially meets expectations", "Meets expectations", "Above expectations", "Exceeds expectations"] as const;
export const expectationLabel = (stars?: number) => EXPECTATION_LABELS[Math.min(5, Math.max(1, Math.round(stars ?? 3))) - 1];
