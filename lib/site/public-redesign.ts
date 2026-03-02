export function isPublicRedesignEnabled() {
  return process.env.NEXT_PUBLIC_PUBLIC_REDESIGN === "true";
}
