import confetti from "canvas-confetti";

export const dispararConfetti = () => {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#00C27A", "#009960", "#ffffff", "#F5A623"],
  });
};

export const dispararConfettiFinal = () => {
  confetti({
    particleCount: 300,
    spread: 120,
    origin: { y: 0.6 },
    colors: ["#00C27A", "#00E5A0", "#ffffff", "#FFD700"],
  });
};
