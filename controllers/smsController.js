const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = require('twilio')(accountSid, authToken);

// Function to send SMS
function sendSMS(to, message) {
  return client.messages.create({
    body: message,
    from: twilioPhoneNumber,
    to: 'whatsapp:'+to
  });
}

module.exports = {
  sendSMS: sendSMS
};
