import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import twilio from 'twilio'

dayjs.locale('en');

dotenv.config()

const gmailAppPassword = process.env.PASSWORD
const accountSid = process.env.SID;
const authToken = process.env.TOKEN;


const client = twilio(accountSid, authToken);

let todaysDate = dayjs()
// console.log(todaysDate)

const url = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?team=52&next=50';
const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': '0de7666b80mshc15c644e1ec3fe5p19f21bjsn186f44de2c74',
    'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
  }
};

function sendTextMessage(message) {

  client.messages
    .create({
      body: message,
      from: '+447453144896',
      to: '+44 7538 820382'
    })
    .then(message => console.log(`Message sent with SID: ${message.sid}`))
    .catch(error => console.error('Error sending message:', error));
}

// Function to send alert email
function sendAlertEmail(message, subject) {
  // Create a SMTP transporter
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'crystalpalace.alerts@gmail.com', // Your email address
      pass: gmailAppPassword// Your password
    }
  });

  // Setup email data
  let mailOptions = {
    from: 'CP Alerts <crystalpalace.alerts@gmail.com>',
    to: 'richard.lee.llewellyn@gmail.com',
    subject: subject,
    text: message
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('Error occurred while sending email:', error);
    }
    console.log('Email sent:', info.response);
    console.log('------------------------------------------------------------')
  });
}

fetch(url, options)
  .then(function (result) {
    return result.json();
  }).then(function (data) {


    const crystalPalaceFixtures = data.response[0]

    console.log(crystalPalaceFixtures)

    const venue = crystalPalaceFixtures.fixture.venue.name;
    const awayTeam = crystalPalaceFixtures.teams.away.name;
    let fixtureDate = crystalPalaceFixtures.fixture.date;
    fixtureDate = dayjs(fixtureDate).format('dddd DD MMMM YYYY')
    let futureDate = dayjs(crystalPalaceFixtures.fixture.date);
    let daysFromNow = futureDate.diff(todaysDate, 'day');
    futureDate = futureDate.format('DD/MM/YY')


    if (daysFromNow < 20) {
      console.log('Heads up, Crystal Palace are playing this week!')
      console.log('------------------------------------------------------------')
    }

    if (daysFromNow < 20 && venue === 'Selhurst Park') {
      console.log(`Crystal Palace are playing ${awayTeam} at ${venue} on ${fixtureDate}. Sainsburys will be closed!`);
      console.log('------------------------------------------------------------')
      sendAlertEmail(`Crystal Palace are playing ${awayTeam} at ${venue} on ${fixtureDate}. Sainsburys will be closed!`, 'Crystal Palace are playing at home this week!',);
      sendTextMessage(`Crystal Palace are playing ${awayTeam} at ${venue} on ${fixtureDate}. Sainsburys will be closed!`);
    }

    if (daysFromNow < 20 && venue !== 'Selhurst Park') {
      console.log(`Crystal Palace are playing ${awayTeam} at ${venue} on ${fixtureDate}, so Sainsburys should be open.`)
      console.log('------------------------------------------------------------')
      sendAlertEmail(`Crystal Palace are playing ${awayTeam} at ${venue} on ${fixtureDate}, so Sainsburys should be open.`, 'Crystal Palace are playing away this week!');
      sendTextMessage(`Crystal Palace are playing ${awayTeam} at ${venue} on ${fixtureDate}, so Sainsburys should be open.`)
    }

  })
  .catch(function (error) {
    // Handle errors
    console.error('Error:', error);
  });

