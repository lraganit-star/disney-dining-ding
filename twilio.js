require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

client.messages
  .create({
    from: "+18559195532",
    body: "checking",
    to: "+18178880972",
  })
  .then((message) => console.log(message.body));
