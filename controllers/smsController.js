const moment = require('moment');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = require('twilio')(accountSid, authToken);

// Function to send SMS
async function sendSMS(to, washHistory) {
  try {
    let message = 'Dear Customer, your remaining washes and interiors are now 0. Please update your plan.';
    if (washHistory.length > 0) {
      message += '\n\nPrevious Wash History:\n';
      washHistory.forEach(wash => {
        if (wash.washDate) {
          const formattedDate = moment(wash.washDate).format('DD-MM-YYYY'); // Adjust the date format as needed
          message += `Date: ${formattedDate}, Type: ${wash.washType}\n`;
        }

      });
    }
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });
    console.log('SMS notification sent successfully. SID:', result.sid);
    return result;
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    throw error;
  }
}

module.exports = {
  sendSMS: sendSMS
};
