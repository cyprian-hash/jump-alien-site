// Single source of truth for site-wide constants. Update these in one place
// after creating the App Store Connect record and the support inbox.

// Live App Store URL for Jump Alien (bundle: com.jumpalien.lite, Apple ID 964680187).
// The 2.0 update will surface at this same URL when Apple approves the build.
export const APP_STORE_URL = "https://apps.apple.com/us/app/jump-alien/id964680187";

// Support inbox surfaced in privacy + support pages.
export const SUPPORT_EMAIL = "support@jumpalien.com";

// Canonical absolute origin — used for OG/Twitter image URLs and any
// place a link needs to be absolute. Update if the domain ever changes.
export const SITE_URL = "https://jumpalien.com";

// Used in <title>, OpenGraph, and footer.
export const SITE_NAME = "Jump Alien";
export const SITE_TAGLINE = "The cult-classic alien runner, rebuilt for modern iOS.";
