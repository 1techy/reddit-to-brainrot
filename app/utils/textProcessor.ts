export const splitIntoSegments = (text: string, maxLength: number = 150): string[] => {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const segments: string[] = [];
  let current = '';

  sentences.forEach((sentence) => {
    if ((current + sentence).length > maxLength && current) {
      segments.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  });

  if (current) {
    segments.push(current.trim());
  }

  return segments;
};