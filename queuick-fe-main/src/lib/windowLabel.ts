export interface WindowLabelInput {
  name?: string | null;
  window_name?: string | null;
  number?: number | null;
  window_number?: number | null;
}

export const formatWindowLabel = (
  input?: WindowLabelInput | null,
  fallback = "-",
): string => {
  if (!input) return fallback;

  const name = (input.window_name ?? input.name ?? "").trim();
  const number = input.window_number ?? input.number;
  const hasNumber = typeof number === "number";

  // if (name && hasNumber) {
  //   return `${name} ${number}`;
  // }

  if (name) {
    return name;
  }

  if (hasNumber) {
    return `Window ${number}`;
  }

  return fallback;
};
