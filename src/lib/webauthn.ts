// WebAuthn configuration
export const rpName = "Threemail";
export const rpID = process.env.NEXT_PUBLIC_RP_ID || "localhost";
export const origin = process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000";

// Challenge expiration time (5 minutes)
export const CHALLENGE_TIMEOUT = 5 * 60 * 1000;
