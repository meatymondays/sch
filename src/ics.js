const nodemailer = require('nodemailer');
const { createEvent } = require('ics');
const { google } = require('googleapis');

// OAuth2 configuration
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  '1028664541976-r9odvbsc9i6ojbfod4be7okldbh9ik78.apps.googleusercontent.com',
  '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',
  'http://localhost:3000'
);

// Generate a URL for the user to visit
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/gmail.send']
});

console.log('Authorize this app by visiting this url:', authUrl);

// Comment out or remove this part for now
/*
oauth2Client.getToken(code, (err, tokens) => {
  if (err) {
    console.error('Error getting tokens', err);
    return;
  }
  oauth2Client.setCredentials(tokens);
  console.log('Refresh token:', tokens.refresh_token);
  // Store this refresh_token securely for future use
});
*/

// Later, when using the stored refresh token:
oauth2Client.setCredentials({
  refresh_token: 'YOUR_STORED_REFRESH_TOKEN'
});

// Function to create and send the event
const sendCalendarInvite = async (recipientEmail) => {
  // Event details
  const event = {
    start: [2024, 9, 18, 17, 0],  // Start time (year, month, day, hour, minute)
    duration: { hours: 1 },       // Event duration
    title: 'Meeting with Team',
    description: 'Discuss project updates',
    location: 'Office Conference Room',
    organizer: { name: 'John Doe', email: 'organizer@example.com' },  // Organizer details (optional)
  };

  // Create the ICS event
  createEvent(event, (error, value) => {
    if (error) {
      console.log('Error creating ICS event:', error);
      return;
    }

    // Get access token
    oauth2Client.getAccessToken((err, accessToken) => {
      if (err) {
        console.log('Error getting access token:', err);
        return;
      }

      // Set up Nodemailer transporter with OAuth2
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: 'help@vertuecrew.com',
          clientId: oauth2Client._clientId,
          clientSecret: oauth2Client._clientSecret,
          refreshToken: oauth2Client.credentials.refresh_token,
          accessToken: accessToken,
        },
      });

      // Email options
      const mailOptions = {
        from: 'help@vertuecrew.com',
        to: recipientEmail,  // Recipient email
        subject: 'Event Invitation: Meeting with Team',
        text: 'Please find the event details attached.',
        icalEvent: {
          filename: 'invite.ics',
          method: 'REQUEST',
          content: value,  // Attach the ICS content
        },
      };

      // Send the email
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log('Error sending email:', err);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    });
  });
};

// Example usage: send the event to a recipient
sendCalendarInvite('justinst.wong@gmail.com');

console.log("To send an event, uncomment the line above and replace 'recipient@example.com' with the actual email address.");
console.log("Also, make sure to replace 'your-email@gmail.com' and 'your-email-password' with your actual Gmail credentials.");
console.log("Note: Using Gmail may require you to enable 'Less secure app access' or use an 'App Password'.");
