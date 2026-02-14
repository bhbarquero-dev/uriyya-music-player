export const SIDEBAR_ITEMS = {
  PLAYLIST: "playlist",
  LIBRARY: "library"
} as const;

export type SidebarItemId = typeof SIDEBAR_ITEMS[keyof typeof SIDEBAR_ITEMS];
