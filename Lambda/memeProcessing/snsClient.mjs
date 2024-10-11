// snsClient.mjs

import { SNSClient } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: "us-east-2" }); // Replace with your AWS region

export { snsClient };
