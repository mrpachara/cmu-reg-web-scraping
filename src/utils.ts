export function getFirstLine(text: string): string {
  return text.match(/^.*$/m)![0];
}

export function normailizeText(text: string): string[] {
  return text
    .trim()
    .match(/^.*$/gm)!
    .map((value) => value.trim());
  // TODO: replace white-space
}
