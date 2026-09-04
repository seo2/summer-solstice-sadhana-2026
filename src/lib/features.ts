/**
 * Feature switches shared by server and client components. Plain module on
 * purpose (no "use client") so the static export can read them at build time.
 */

/**
 * Sign-in is hidden until further notice (2026-09-04). There is currently no
 * way for attendees to create an account — sign-up was already off for the
 * first store release (see ACCOUNT_CREATION_ENABLED in src/app/account/page.tsx)
 * and account creation on 3ho.org is not available to them either — so a
 * sign-in form would only lead to dead ends. While false:
 *
 * - the header account button renders only for a device that still holds a
 *   session from an earlier build (so it can sync or sign out);
 * - /account shows a short notice instead of the sign-in form;
 * - the Event home has no "Account" tile.
 *
 * The auth code paths stay in place; flip this back on when accounts can be
 * created again.
 */
export const ACCOUNT_SIGN_IN_ENABLED = false;
