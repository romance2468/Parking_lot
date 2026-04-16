export type Bubble = { id: number; size: number; left: number; duration: number; delay: number };

export function generateBubbles(): Bubble[] {
  const newBubbles: Bubble[] = [];
  for (let i = 0; i < 40; i++) {
    newBubbles.push({
      id: i,
      size: Math.random() * 50 + 25,
      left: Math.random() * 100,
      duration: Math.random() * 25 + 20,
      delay: Math.random() * 8,
    });
  }
  return newBubbles;
}
