import crypto from "crypto";

/**
 * Generates a unique QR code or referral code for a user.
 * @param userId - The unique ID of the user.
 * @returns A unique referral code as a string.
 */
export const generateQRCode = (userId: string): string => {
  const hash = crypto.createHash("sha256");
  hash.update(userId + Date.now().toString()); // Combine userId and timestamp for uniqueness
  return hash.digest("hex").slice(0, 10); // Return the first 10 characters of the hash
};
