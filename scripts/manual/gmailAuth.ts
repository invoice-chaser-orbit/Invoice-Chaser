import { google } from "googleapis";
import express from "express";
import open from "open";
import fs from "fs";

const credentials = JSON.parse(fs.readFileSync("credentials.json", "utf-8"));
const { client_id, client_secret, redirect_uris } = credentials.web;

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
];

async function getToken() {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  const app = express();

  return new Promise<void>((resolve, reject) => {
    const server = app.listen(3000, () => {
      open(authUrl);
    });

    app.get("/oauth2callback", async (req, res) => {
      const code = req.query.code as string;
      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        fs.writeFileSync("token.json", JSON.stringify(tokens));
        res.send("Authenticated! You can close this tab.");
        server.close();
        resolve();
      } catch (err) {
        res.send("Auth failed, check terminal.");
        reject(err);
      }
    });
  });
}

getToken().then(() => console.log("Token saved to token.json"));
