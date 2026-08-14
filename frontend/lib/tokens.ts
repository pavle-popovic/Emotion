/**
 * The only place raw hex is allowed.
 *
 * Some APIs take a colour string rather than a class: Mux's `accentColor`, the
 * document theme-color. They read from here so the values still have one home.
 * Everything else must use a Tailwind token class.
 */
export const TOKEN_HEX = {
  gold: "#B08D57",
  moss900: "#092E24",
  video: "#061F19",
} as const;
