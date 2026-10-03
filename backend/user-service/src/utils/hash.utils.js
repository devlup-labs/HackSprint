import crypto from "crypto";

export const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
