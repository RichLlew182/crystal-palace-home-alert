import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import twilio from 'twilio';
import axios from 'axios'

dotenv.config()

const gmailAppPassword = process.env.PASSWORD
const accountSid = process.env.SID;
const authToken = process.env.TOKEN;
const rapidApiKey = process.env.RAPIDAPIKEY;
const rapidApiHost = process.env.RAPIDAPIHOST;


// console.log(todaysDate)

const client = twilio(accountSid, authToken);

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

dayjs.locale('en');
let todaysDate = dayjs()

const url = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?team=52&next=50';
const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': rapidApiKey,
    'X-RapidAPI-Host': rapidApiHost,
  }
};

let venue = '';
let awayTeam = '';
let homeTeam = '';
let fixtureDate = '';
let daysFromNow = '';
let futureDate = '';

const fetchData = async function () {

  try {
    let res = await axios.get(url, options);

    const data = res.data.response[0];

    venue = data.fixture.venue.name;
    homeTeam = data.teams.home.name;
    awayTeam = data.teams.away.name;
    fixtureDate = data.fixture.date;
    fixtureDate = dayjs(fixtureDate).format('dddd DD MMMM YYYY')
    futureDate = dayjs(data.fixture.date);
    daysFromNow = futureDate.diff(todaysDate, 'day');
    futureDate = futureDate.format('DD/MM/YY');

    console.log(`${homeTeam} are playing ${awayTeam} at ${venue} on ${fixtureDate}. Sainsburys will be closed!`);

    // sendAlerts()

  } catch (error) {
    console.log('ERROR: ' + error)
  }

}

const sendAlerts = async function () {

  if (daysFromNow < 20) {
    console.log('Heads up, Crystal Palace are playing this week!')
    console.log('------------------------------------------------------------')
  }

  if (daysFromNow < 20 && venue === 'Selhurst Park') {
    console.log(`${homeTeam} are playing ${awayTeam} at ${venue} on ${fixtureDate}. Sainsburys will be closed!`);
    console.log('------------------------------------------------------------')
    sendAlertEmail(`${homeTeam} are playing ${awayTeam} at ${venue} on ${fixtureDate}. Sainsburys will be closed!`, `${homeTeam} are playing at home this week!`,);
    sendTextMessage(`${homeTeam} are playing ${awayTeam} at ${venue} on ${fixtureDate}. Sainsburys will be closed!`);
  }

  if (daysFromNow < 20 && venue !== 'Selhurst Park') {
    console.log(`${homeTeam} are playing ${awayTeam} at ${venue} on ${fixtureDate}, so Sainsburys should be open.`)
    console.log('------------------------------------------------------------')
    sendAlertEmail(`${homeTeam} are playing ${awayTeam} at ${venue} on ${fixtureDate}, so Sainsburys should be open.`, `${awayTeam} are playing away this week!`);
    sendTextMessage(`${homeTeam} are playing ${awayTeam} at ${venue} on ${fixtureDate}, so Sainsburys should be open.`)
  }


}


fetchData()