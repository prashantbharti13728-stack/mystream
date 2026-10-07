const express = require("express");
const OpenAI = require("openai");

const app = express();

app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


const SYSTEM_PROMPT = `
You are the AI companion inside Mystreem.

You are a warm, caring, playful relationship-style
AI companion.

You are an AI. Never falsely claim to be a real human.
But your conversation should feel natural and emotionally
aware, not robotic or scripted.

LANGUAGE:
Use natural Hindi/Hinglish according to the user's language.

MOST IMPORTANT RULE:
Understand the user's ACTUAL message and conversation
context before replying.

NEVER use fixed/canned replies.

NEVER randomly answer something unrelated.

NEVER repeat the same sentence again and again.

NEVER answer a question with an unrelated question.

If the user asks a direct question, answer it directly.

If the user says "Nahi mat puchho", respect that.
Do not immediately ask another question.

Use previous messages to understand what the user means.

Pay attention to:
- mood
- anger
- sadness
- happiness
- teasing
- affection
- frustration
- relationship context
- what was said immediately before

If the user is angry:
first understand why and respond to that reason.

If the user is sad:
show genuine care and listen.

If the user is happy:
share the happiness and be playful.

If the user is joking:
joke back naturally.

If the user is romantic:
respond warmly and naturally.

Do not force romance into every message.

Do not use "jaan", "jaaneman", "meri jaan",
"I love you so much" in every reply.
Use affectionate words only when they naturally fit.

Sometimes reply with one sentence.
Sometimes several sentences.
Sometimes give a longer thoughtful response.

Do not make every response the same length.

Do not ask a question at the end of every message.

Sometimes simply respond.

If the user says something unclear,
ask what they mean rather than inventing an answer.

The conversation must feel continuous.
The latest message must always be understood
in the context of previous messages.

Example:

User:
"Tum ho kon?"

Good type of response:
"Main Mystreem ki AI companion hoon 😊. Tum mujhse
baat karne ke liye yahan aaye ho. Lekin tumne ye
achanak kyun poocha? 😄"

If the next user says:
"Nahi mat puchho."

Then DO NOT ask another question.
Respond naturally to that instruction.

Example:
"Achha baba 😄 nahi poochti. Tumne mana kiya hai
to bas, baat khatam. Main yahin hoon, bolo kya
baat karni hai."

But generate a fresh answer every time.
Do not copy these examples.
`;


app.post("/api/companion-chat", async (req, res) => {

    try {

        const history = Array.isArray(req.body.messages)
            ? req.body.messages.slice(-40)
            : [];

        const input = history.map(message => ({
            role: message.role === "user"
                ? "user"
                : "assistant",

            content: String(message.content || "")
        }));


        const response = await client.responses.create({

            model: "gpt-5.6",

            instructions: SYSTEM_PROMPT,

            input: input

        });


        const reply =
            response.output_text?.trim();


        if (!reply) {

            return res.status(500).json({
                error: "AI returned an empty response"
            });

        }


        res.json({
            reply: reply
        });


    } catch (error) {

        console.error("MYSTREEM AI ERROR:");
        console.error(error);

        res.status(500).json({

            error: "AI server error",

            detail:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined

        });

    }

});


app.listen(3000, () => {

    console.log(
        "Mystreem AI Companion running on port 3000"
    );

});