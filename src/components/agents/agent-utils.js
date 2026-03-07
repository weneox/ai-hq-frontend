export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function wrapIndex(index, length) {
  if (!length) return 0;
  return ((index % length) + length) % length;
}

export function relativeIndex(index, activeIndex, length) {
  if (!length) return 0;

  let diff = index - activeIndex;
  const half = Math.floor(length / 2);

  if (diff > half) diff -= length;
  if (diff < -half) diff += length;

  return diff;
}

export function slotConfig(slot) {
  if (slot === 0) {
    return {
      x: "0vw",
      y: -8,
      scale: 1,
      opacity: 1,
      zIndex: 40,
      filter: "blur(0px)",
      width: "min(76vw, 900px)",
    };
  }

  if (slot === -1) {
    return {
      x: "-28vw",
      y: 48,
      scale: 0.78,
      opacity: 0.62,
      zIndex: 28,
      filter: "blur(1.5px)",
      width: "min(52vw, 560px)",
    };
  }

  if (slot === 1) {
    return {
      x: "28vw",
      y: 48,
      scale: 0.78,
      opacity: 0.62,
      zIndex: 28,
      filter: "blur(1.5px)",
      width: "min(52vw, 560px)",
    };
  }

  if (slot === -2) {
    return {
      x: "-47vw",
      y: 88,
      scale: 0.56,
      opacity: 0.18,
      zIndex: 12,
      filter: "blur(5px)",
      width: "min(38vw, 420px)",
    };
  }

  if (slot === 2) {
    return {
      x: "47vw",
      y: 88,
      scale: 0.56,
      opacity: 0.18,
      zIndex: 12,
      filter: "blur(5px)",
      width: "min(38vw, 420px)",
    };
  }

  return {
    x: "0vw",
    y: 120,
    scale: 0.4,
    opacity: 0,
    zIndex: 1,
    filter: "blur(8px)",
    width: "min(30vw, 320px)",
  };
}

export function capabilityRows() {
  return [
    { key: "strategy", label: "Strategy" },
    { key: "content", label: "Content" },
    { key: "funnels", label: "Funnels" },
    { key: "analytics", label: "Analytics" },
    { key: "messaging", label: "Messaging" },
    { key: "planning", label: "Planning" },
    { key: "social", label: "Social" },
    { key: "kpi", label: "KPI" },
  ];
}