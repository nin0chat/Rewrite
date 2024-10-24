import { prod } from "./constants";

export async function validateCaptcha(response: string): Promise<boolean> {
    if (!prod) return true;

    const { success } = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
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
