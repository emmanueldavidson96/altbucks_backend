import axios from "axios";
import { PaypalConfig } from "../config/PayPalConfig";

let currentToken: string | null = null; 
let tokenExpirationTime: number | null = null; 
let isTokenRefreshing = false;
let tokenQueue: Array<() => void> = []; // Queue to handle other requests while waiting for a new token


export const getCurrentToken = async (): Promise<string> => {
    if (currentToken && tokenExpirationTime && Date.now() < tokenExpirationTime) {
        return currentToken;
    }

    // If token is expired or unavailable, refresh it
    return await refreshToken();
};


const refreshToken = async (): Promise<string> => {
    // If a refresh is already in progress, wait until it's completed
    if (isTokenRefreshing) {
        return new Promise((resolve) => {
            tokenQueue.push(() => resolve(currentToken as string));
        });
    }

    isTokenRefreshing = true;

    try {
        // Make the request to PayPal to get a new token
        const token = await requestNewToken();
        return token;
    } finally {
        isTokenRefreshing = false;
        // Process the queued requests
        tokenQueue.forEach((callback) => callback());
        tokenQueue = []; // Reset the queue
    }
};


const requestNewToken = async (): Promise<string> => {
    const auth = Buffer.from(`${PaypalConfig.clientId}:${PaypalConfig.clientSecret}`).toString("base64");

    try {
        const response = await axios.post(
            `${PaypalConfig.baseURL}/v1/oauth2/token`,
            "grant_type=client_credentials",
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        const token = response.data.access_token;
        const expiresIn = response.data.expires_in * 1000;
        
        // Store the new token and expiration time
        currentToken = token;
        tokenExpirationTime = Date.now() + expiresIn;

        return token;
    } catch (error) {
        console.error("Error requesting PayPal token:", error);
        throw new Error("Unable to retrieve the token at this moment. Please try again later.");
    }
};
