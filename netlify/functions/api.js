import ServerlessHttp from "serverless-http";

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    preflightContinue: false,
  })
);
app.use(express.json());

const client = new OAuth2Client(
  process.env.REACT_APP_GOOGLE_CLIENT_ID,
  process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
  process.env.REACT_APP_GOOGLE_CLIENT_CALLBACK_URL
);

// Add a new endpoint to initiate the OAuth flow
app.post("/api/auth/google", (req, res) => {
  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    redirect_uri: process.env.REACT_APP_GOOGLE_CLIENT_CALLBACK_URL,
  });
  res.json({ authUrl });
});
// Add a callback endpoint for Google to redirect to after authentication
app.get("/api/auth/google/callback", async (req, res) => {
  console.log("Inside callback");
  try {
    // console.log(process.env);
    // const { tokens } = await client.getToken(code);
    // client.setCredentials(tokens);

    // Here, you'd typically save the tokens to your database
    // associated with the user's session

    res.redirect("/");
  } catch (error) {
    console.error("Error getting tokens:", error);
    res.redirect("/");
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export const handler = ServerlessHttp(app);
