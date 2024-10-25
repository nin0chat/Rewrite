import { genSaltSync } from "bcrypt";

export const salt = genSaltSync(10);
export const isDev = process.env.NODE_ENV !== "production";
export const captchaVerifyEndpoint = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
