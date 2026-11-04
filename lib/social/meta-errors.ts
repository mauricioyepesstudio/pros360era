/** Meta's OAuthException code 190: the access token is expired, revoked or invalidated (e.g. password change). */
export const isTokenInvalid = (code: unknown) => code === 190;
