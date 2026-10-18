/**
 * Shared route types for BOTH navigation patterns.
 *
 * The tab and drawer navigators intentionally expose the same core screens
 * (Menu / Cart / Orders / Profile) so the app concept is identical and only
 * the navigation STRUCTURE changes. `About` lives in the param list too, but
 * is only registered in the drawer to demonstrate that drawers can tuck away
 * secondary destinations.
 */

export type RootParamList = {
  Menu: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
  About: undefined;
};

/** Which navigation pattern is currently mounted (temporary demo toggle). */
export type NavigationPattern = 'tabs' | 'drawer';
