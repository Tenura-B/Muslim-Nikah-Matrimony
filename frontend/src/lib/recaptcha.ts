/** Must match the action passed to `grecaptcha.execute` on the client. */
export const RECAPTCHA_V3_ACTION = "contact";

const DEFAULT_MIN_SCORE = 0.5;

type SiteVerifyJson = {
  success: boolean;
  score?: number;
  action?: string;
  "error-codes"?: string[];
};

export async function verifyRecaptchaV3(params: {
  secret: string;
  token: string;
  /** Defaults to RECAPTCHA_V3_ACTION when omitted. */
  expectedAction?: string;
  /** Override with env RECAPTCHA_MIN_SCORE (0–1). */
  minScore?: number;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const expectedAction = params.expectedAction ?? RECAPTCHA_V3_ACTION;
  const rawMin = process.env.RECAPTCHA_MIN_SCORE;
  const envMin =
    rawMin !== undefined && rawMin !== "" ? Number.parseFloat(rawMin) : NaN;
  const minScore = Number.isFinite(envMin)
    ? Math.min(1, Math.max(0, envMin))
    : (params.minScore ?? DEFAULT_MIN_SCORE);

  const body = new URLSearchParams({
    secret: params.secret,
    response: params.token,
  });

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  let data: SiteVerifyJson;
  try {
    data = (await res.json()) as SiteVerifyJson;
  } catch {
    return { ok: false, reason: "reCAPTCHA verification failed." };
  }

  if (!data.success) {
    return { ok: false, reason: "reCAPTCHA verification failed." };
  }

  if (typeof data.score === "number" && data.score < minScore) {
    return {
      ok: false,
      reason: "Request could not be verified. Please try again.",
    };
  }

  if (data.action && data.action !== expectedAction) {
    return { ok: false, reason: "reCAPTCHA verification failed." };
  }

  return { ok: true };
}
