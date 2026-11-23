/** Nome do cookie HttpOnly que guarda o JWT. Não acessível via JavaScript no browser. */
export const SESSION_COOKIE = "prontucar_token";

/** Validade alinhada ao JWT da API (2 horas). */
export const SESSION_MAX_AGE_SECONDS = 7200;
