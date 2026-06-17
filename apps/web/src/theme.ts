// Shared design tokens so colors/spacing aren't scattered as magic values.
export const colors = {
  primary: "teal",
  primaryDark: "#00695c",
  accent: "brown",
  lightBg: "#f5fbfd",
  panelBg: "beige",
  text: "#222",
  muted: "#777",
  error: "#d32f2f",
  white: "#ffffff",
} as const;

export type Colors = typeof colors;

export const radius = "8px" as const;
