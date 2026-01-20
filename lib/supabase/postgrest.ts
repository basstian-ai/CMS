export function escapePostgrestText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}
