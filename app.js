import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import twilio from 'twilio';
import axios from 'axios';
import express from 'express';
import { CronJob } from 'cron';

const app = express();

dotenv.config();
const port = process.env.PORT || 3000;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const number1 = process.env.TWILIO_NUMBER1;
const number2 = process.env.TWILIO_NUMBER2;
const rapidApiKey = process.env.RAPIDAPI_KEY;
const rapidApiHost = process.env.RAPIDAPI_HOST;
const myEmail = process.env.MY_EMAIL;
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

const client = twilio(accountSid, authToken);

const numbers = [number1, number2];

function sendTextMessage(message) {

  numbers.forEach((number) => {

    client.messages
      .create({
        body: message,
        from: '+447453144896',
        to: number
      })
      .then(message => console.log(`Message sent to ${number} with SID: ${message.sid}`))
      .catch(error => console.error('Error sending message:', error));

  })

}

function sendAlertEmail(message, subject) {

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'crystalpalace.alerts@gmail.com',
      pass: gmailAppPassword
    }
  });

  let mailOptions = {
    from: 'CP Alerts <crystalpalace.alerts@gmail.com>',
    to: myEmail,
    subject: subject,
    text: message
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('Error occurred while sending email:', error);
    }
    console.log('Email sent:', info.response);
  });
}

dayjs.locale('en');
let todaysDate = dayjs().startOf('day');

const url = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?team=52&next=5';
const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': rapidApiKey,
    'X-RapidAPI-Host': rapidApiHost,
  }
};

let venue = '';
let time = ''
let awayTeam = '';
let homeTeam = '';
let fixtureDateFormatted = '';
let daysFromNow = '';
let futureDate = '';

const fetchData = async function () {

  try {

    let res = await axios.get(url, options);

    // console.log('API response:', res.data);

    const data = res.data.response[0];

    venue = data.fixture.venue.name;
    time = dayjs(data.fixture.date).format('HH:mm');
    homeTeam = data.teams.home.name;
    awayTeam = data.teams.away.name;
    fixtureDateFormatted = dayjs(data.fixture.date).format('dddd DD MMMM YYYY')
    futureDate = dayjs(data.fixture.date).startOf('day');
    daysFromNow = futureDate.diff(todaysDate, 'day');
    futureDate = futureDate.format('DD/MM/YY');

    console.log({ daysFromNow, venue, futureDate });
    console.log('Test log: Days from now:', daysFromNow);
    console.log('Test log: Today:', todaysDate.format('DD/MM/YY'));
    console.log('Test log: Future date:', futureDate);

    console.log(`Test log: ${homeTeam} are playing ${awayTeam} at ${venue} on ${fixtureDateFormatted} at ${time}.`)

    sendAlerts()

  } catch (error) {
    console.error('Error fetching data:', error.response?.data || error.message);
  }

}

const sendAlerts = async function () {

  if (daysFromNow >= 0 && daysFromNow <= 4) {

    if (venue === 'Selhurst Park') {
      const message = `${homeTeam} are playing ${awayTeam} at ${venue} on ${fixtureDateFormatted} at ${time}. Sainsbury's will be closed!`;
      console.log('------------------------------------------------------------');
      console.log(message);
      console.log('------------------------------------------------------------');

      sendAlertEmail(message, `${homeTeam} are playing at home this week!`);
      sendTextMessage(message);

    } else if (venue) {

      const message = `${awayTeam} are playing ${homeTeam} at ${venue} on ${fixtureDateFormatted} at ${time}, so Sainsbury's should be open.`;
      console.log('------------------------------------------------------------');
      console.log(message);
      console.log('------------------------------------------------------------');

      sendAlertEmail(message, `${awayTeam} are playing away this week!`);
      sendTextMessage(message);

    } else {

      console.log('------------------------------------------------------------');
      console.log('Venue information is missing or invalid.');
      console.log('------------------------------------------------------------');
    }

  } else {

    console.log('------------------------------------------------------------');
    console.log('No matches are scheduled this week.');
    console.log('------------------------------------------------------------');

  }


}

// fetchData()

const job = new CronJob(
  '0 11 * * 1,5',
  fetchData,
  null,
  true,
);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is listening on port ${port}`);
});
