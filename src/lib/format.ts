export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

export function euro(value: number) {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(value);
}

export function num(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function pct(value: number) {
  return `${value.toFixed(1)}%`;
}
