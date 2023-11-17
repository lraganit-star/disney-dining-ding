require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

client.messages
  .create({
    from: process.env.TWILIO_PHONE_NUMBER,
    body: "checking",
    to: process.env.PERSONAL_PHONE_NUMBER,
  })
  .then((message) => console.log(message.body));
