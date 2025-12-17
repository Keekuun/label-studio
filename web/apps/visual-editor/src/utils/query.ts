export function getQueryParams(): URLSearchParams {
  return new URLSearchParams(window.location.search);
}

export function getInterfacesFromParams(params: URLSearchParams): string[] {
  const interfacesParam = params.get("interfaces");
  if (!interfacesParam) return ["side-column"];
  return interfacesParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function replaceBrTagsWithNewlines(str: string): string {
  return str.replace(/<br\s*\/?>/g, "\n");
}

export function throwUnlessXmlLike(str: string): void {
  if (!str.trim().startsWith("<") || !str.trim().endsWith(">")) {
    throw new Error("Invalid XML");
  }
}


