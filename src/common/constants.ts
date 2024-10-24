import { genSaltSync } from "bcrypt";

export const salt = genSaltSync(10);
export const prod = process.env.NODE_ENV !== "development";
