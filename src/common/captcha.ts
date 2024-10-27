import { __DEV__, CAPTCHA_VERIFY_ENDPOINT } from "./constants";

export async function validateCaptcha(response: string): Promise<boolean> {
    if (__DEV__) return true;

    const { success } = await fetch(CAPTCHA_VERIFY_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            response: response,
            secret: process.env.TURNSTILE_SECRET
        })
    }).then((res) => res.json());

    return success;
}
