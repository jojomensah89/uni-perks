export const API_MESSAGES = {
  tooManyRequests: "Too many requests. Please try again shortly.",
  tooManyAuthAttempts: "Too many auth attempts. Please try again shortly.",
  turnstileFailed: "Turnstile verification failed",
  accountLocked: "Account temporarily locked due to failed sign-in attempts.",
  healthOk: "Uni-Perks API Running",
} as const;

export const RATE_LIMITS = {
  auth: {
    limit: 20,
    windowSeconds: 300,
  },
  public: {
    limit: 120,
    windowSeconds: 60,
  },
  go: {
    limit: 20,
    windowSeconds: 60,
  },
  signInLockout: {
    maxAttempts: 5,
    windowSeconds: 15 * 60,
  },
} as const;
