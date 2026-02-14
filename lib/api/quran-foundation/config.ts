/**
 * Quran.Foundation server-only config.
 * Do not import from client code; secrets must stay on server.
 */

export type QFEnv = "prelive" | "production";

export interface QFConfig {
  clientId: string;
  clientSecret: string;
  authBaseUrl: string;
  apiBaseUrl: string;
  env: QFEnv;
}

const PRELIVE = {
  authBaseUrl: "https://prelive-oauth2.quran.foundation",
  apiBaseUrl: "https://apis-prelive.quran.foundation",
};

const PRODUCTION = {
  authBaseUrl: "https://oauth2.quran.foundation",
  apiBaseUrl: "https://apis.quran.foundation",
};

export function getQFConfig(): QFConfig {
  const env = (process.env.QF_ENV || "production").toLowerCase() as QFEnv;
  const base = env === "prelive" ? PRELIVE : PRODUCTION;

  const clientId =
    process.env.QF_CLIENT_ID ||
    (env === "prelive"
      ? "76361c7b-7e27-4986-8552-8669c06151de"
      : "8d6bf59b-534a-4972-a2a4-17a96dc666b9");
  const clientSecret =
    process.env.QF_CLIENT_SECRET ||
    (env === "prelive"
      ? "Su~uy80lwf1PmRRrMdLg_aJ0Nt"
      : "gedZZFl~cNTLQitjLyf1ywPaHv");

  return {
    clientId,
    clientSecret,
    authBaseUrl: base.authBaseUrl,
    apiBaseUrl: base.apiBaseUrl,
    env,
  };
}
