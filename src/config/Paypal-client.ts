import {Client, Environment, LogLevel} from "@paypal/paypal-server-sdk";
import { PaypalConfig } from "../config/PayPalConfig";

const paypalClient = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: PaypalConfig.clientId!,
        oAuthClientSecret: PaypalConfig.clientSecret!,
    },
    timeout: 0,
    environment: Environment.Sandbox, // Use 'Environment.Live' in production
    logging: {
        logLevel: LogLevel.Info,
        logRequest: { logBody: true },
        logResponse: { logHeaders: true },
    },
});

export default paypalClient;
