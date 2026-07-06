export const LOCATION_SELECT_MENU_HEIGHT = 220

export const locationSelectStyles = {
  control: (base: Record<string, unknown>, state?: { isDisabled?: boolean }) => ({
    ...base,
    minHeight: "40px",
    borderRadius: "calc(var(--radius) - 2px)",
    borderColor: "var(--border)",
    backgroundColor: state?.isDisabled ? "rgba(var(--muted), 0.1)" : "var(--background)",
    color: "var(--foreground)",
    opacity: state?.isDisabled ? 0.65 : 1,
    boxShadow: "none",
    "&:hover": { borderColor: "var(--border)" },
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    backgroundColor: "var(--background)",
    border: "1px solid var(--border)",
    borderRadius: "calc(var(--radius) - 2px)",
    color: "var(--foreground)",
    zIndex: 9999,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
  }),
  menuList: (base: Record<string, unknown>) => ({
    ...base,
    maxHeight: `${LOCATION_SELECT_MENU_HEIGHT}px`,
    padding: "4px",
  }),
  menuPortal: (base: Record<string, unknown>) => ({
    ...base,
    zIndex: 9999,
    pointerEvents: "auto" as const,
  }),
  option: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    borderRadius: "calc(var(--radius) - 4px)",
    fontSize: "14px",
    padding: "8px 12px",
    backgroundColor: state.isFocused ? "var(--accent)" : "transparent",
    color: state.isFocused ? "var(--accent-foreground)" : "var(--foreground)",
    "&:active": {
      backgroundColor: "var(--accent)",
    },
  }),
  singleValue: (base: Record<string, unknown>) => ({
    ...base,
    color: "var(--foreground)",
    fontSize: "14px",
  }),
  input: (base: Record<string, unknown>) => ({
    ...base,
    color: "var(--foreground)",
  }),
  placeholder: (base: Record<string, unknown>) => ({
    ...base,
    color: "var(--muted-foreground)",
    fontSize: "14px",
  }),
  valueContainer: (base: Record<string, unknown>) => ({
    ...base,
    padding: "2px 8px",
  }),
  indicatorsContainer: (base: Record<string, unknown>) => ({
    ...base,
    height: "40px",
  }),
}
