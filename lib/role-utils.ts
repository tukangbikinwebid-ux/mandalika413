export type ApiRole =
  | string
  | {
      id?: number | string;
      name?: string;
      [k: string]: unknown;
    };

export function extractRoleNames(input: unknown): string[] {
  if (!input) return [];
  const raw = Array.isArray(input) ? input : [input];
  return raw
    .map((r) => {
      if (typeof r === "string") return r;
      if (r && typeof r === "object" && "name" in r) {
        const name = (r as { name?: string }).name;
        return name ?? "";
      }
      return "";
    })
    .filter(Boolean);
}