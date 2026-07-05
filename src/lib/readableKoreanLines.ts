const SENTENCE_PATTERN = /[^.!?]+[.!?]+|[^.!?]+$/g;

const semanticLineGroups = new Map<string, readonly string[]>([
  [
    '아직 여러 분야를 고르게 탐색하는 중이에요.',
    ['아직 여러 분야를', '고르게 탐색하는 중이에요.'],
  ],
  [
    '다양한 경험을 해보며 특히 마음이 오래 머무는 활동을 찾아가면 좋아요.',
    ['다양한 경험을 해보며', '특히 마음이 오래 머무는 활동을 찾아가면 좋아요.'],
  ],
]);

const protectedPhrases = ['탐색하는 중이에요', '오래 머무는'] as const;

const keepPhraseTogether = (line: string) =>
  protectedPhrases.reduce(
    (currentLine, phrase) => currentLine.split(phrase).join(phrase.split(' ').join('\u00a0')),
    line,
  );

export function getReadableKoreanLines(text: string): string[] {
  const sentences = text.match(SENTENCE_PATTERN)?.map((line) => line.trim()).filter(Boolean) ?? [text.trim()];

  return sentences.flatMap((sentence) => {
    const semanticLines = semanticLineGroups.get(sentence) ?? [sentence];
    return semanticLines.map(keepPhraseTogether);
  });
}
