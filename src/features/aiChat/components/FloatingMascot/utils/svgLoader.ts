export function extractSvgInner(raw: string): string {
    const match = raw.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    return match?.[1]?.trim() ?? raw;
}
