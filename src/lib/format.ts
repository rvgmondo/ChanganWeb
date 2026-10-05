/** South African rand with a space as the thousands separator: R 1 234 567. */
export const rand = (value: number): string =>
  `R ${Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;

export const km = (value: number): string =>
  `${Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} km`;
