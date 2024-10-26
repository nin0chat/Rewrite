import { genSaltSync } from "bcrypt";

// is this supposed to be generated each time a password is hashed?
export const SALT = genSaltSync(10);

export const __DEV__ = process.env.NODE_ENV === "development";
export const CAPTCHA_VERIFY_ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
