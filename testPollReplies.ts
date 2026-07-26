import { pollReplies } from "./lib/gmail.js";

async function main() {
    const since = new Date(Date.now() - 60 * 60 * 1000); // last 1 hour
    const replies = await pollReplies(since);
    console.log("Replies found:", replies.length);
    console.log(JSON.stringify(replies, null, 2));
}

main();