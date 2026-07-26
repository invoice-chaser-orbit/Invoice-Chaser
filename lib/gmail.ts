import { google } from "googleapis";
import fs from "fs";

const credentials = JSON.parse(fs.readFileSync("credentials.json", "utf-8"));
const { client_id, client_secret, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const token = JSON.parse(fs.readFileSync("token.json", "utf-8"));
oAuth2Client.setCredentials(token);

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

export async function sendEmail(
    to: string,
    subject: string,
    body: string
): Promise<{ messageId: string }> {
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

    return { messageId: res.data.id ?? "" };
}

export async function pollReplies(
    since: Date
): Promise<Array<{ from: string; subject: string; body: string; date: string }>> {
    const afterTimestamp = Math.floor(since.getTime() / 1000);
    const listRes = await gmail.users.messages.list({
        userId: "me",
        q: `after:${afterTimestamp} in:inbox`,
    });

    const messages = listRes.data.messages ?? [];
    const results = [];

    for (const msg of messages) {
        const full = await gmail.users.messages.get({ userId: "me", id: msg.id! });
        const headers = full.data.payload?.headers ?? [];
        const from = headers.find((h) => h.name === "From")?.value ?? "";
        const subject = headers.find((h) => h.name === "Subject")?.value ?? "";
        const date = headers.find((h) => h.name === "Date")?.value ?? "";

        let body = "";
        const part =
            full.data.payload?.parts?.find((p) => p.mimeType === "text/plain") ??
            full.data.payload;
        if (part?.body?.data) {
            body = Buffer.from(part.body.data, "base64").toString("utf-8");
        }

        results.push({ from, subject, body, date });
    }

    return results;
}