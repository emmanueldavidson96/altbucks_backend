
export interface WebhookData {
    status: string;
    [key: string]: any; // Allow additional fields
}

export const verifySignature = (signature: string | undefined, secretHash: string): boolean => {
    return signature === secretHash;
};

export const processWebhookEvent = (event: string, data: WebhookData): void => {
    switch (event) {
        case "charge.completed":
            if (data.status === "successful") {
                console.log("Payment successful:", data);
                // Update database or notify user
            } else {
                console.log("Payment not successful:", data);
                // Handle payment failure
            }
            break;

        case "transfer.completed":
            if (data.status === "SUCCESSFUL") {
                console.log("Transfer successful:", data);
                // Update database or notify user
            } else {
                console.log("Transfer failed:", data);
                // Handle transfer failure
            }
            break;

        default:
            console.log(`Unhandled event type: ${event}`);
    }
};
