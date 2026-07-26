import { google } from "googleapis";
import fs from "fs";

const credentials = JSON.parse(fs.readFileSync("credentials.json", "utf-8"));
const { client_id, client_secret, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const token = JSON.parse(fs.readFileSync("token.json", "utf-8"));
oAuth2Client.setCredentials(token);

async function sendEmail(to: string, subject: string, body: string) {
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        "Content-Type: text/plain; charset=utf-8",
        "",
        body,
    ].join("\n");

    const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw: encodedMessage },
    });

    console.log("Sent! Message ID:", res.data.id);
}

sendEmail(
    "taluni278tp@gmail.com",  // <-- replace with your actual debtor test address
    "Test from InvoiceChaser",
    "Hello, this is a test reminder from the InvoiceChaser agent."
);