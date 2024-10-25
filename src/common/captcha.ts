import { captchaVerifyEndpoint, isDev } from "./constants";

export async function validateCaptcha(response: string): Promise<boolean> {
    if (isDev) return true;

    const { success } = await fetch(captchaVerifyEndpoint, {
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
