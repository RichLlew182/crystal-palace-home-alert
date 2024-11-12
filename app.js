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
const gmailAppPassword = process.env.PASSWORD;
const accountSid = process.env.SID;
const authToken = process.env.TOKEN;
const rapidApiKey = process.env.RAPIDAPIKEY;
const rapidApiHost = process.env.RAPIDAPIHOST;
const number1 = process.env.NUMBER1;
const number2 = process.env.NUMBER2;
const myEmail = process.env.MYEMAIL;

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

const url = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?team=52&next=50';
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

    const data = res.data.response[0];

    venue = data.fixture.venue.name;
    time = dayjs(data.fixture.date).format('HH:mm');
    homeTeam = data.teams.home.name;
    awayTeam = data.teams.away.name;
    fixtureDateFormatted = dayjs(data.fixture.date).format('dddd DD MMMM YYYY')
    futureDate = dayjs(data.fixture.date).startOf('day');
    daysFromNow = futureDate.diff(todaysDate, 'day');
    futureDate = futureDate.format('DD/MM/YY');

    sendAlerts()

  } catch (error) {
    console.log('ERROR: ' + error)
  }

}

const sendAlerts = async function () {

  if (daysFromNow >= 0 && daysFromNow <= 20 && venue === 'Selhurst Park') {
    console.log('------------------------------------------------------------')
    console.log(`${homeTeam} are playing ${awayTeam} at ${venue} on ${fixtureDateFormatted} at ${time}. Sainsburys will be closed!`);
    console.log('------------------------------------------------------------')
    sendAlertEmail(`${homeTeam} are playing ${awayTeam} at ${venue} on ${fixtureDateFormatted} at ${time}. Sainsburys will be closed!`, `${homeTeam} are playing at home this week!`,);
    sendTextMessage(`${homeTeam} are playing ${awayTeam} at ${venue} on ${fixtureDateFormatted}at ${time}. Sainsburys will be closed!`);
  }

  if (daysFromNow >= 0 && daysFromNow <= 20 && venue !== 'Selhurst Park') {
    console.log('------------------------------------------------------------')
    console.log(`${awayTeam} are playing ${homeTeam} at ${venue} on ${fixtureDateFormatted} at ${time}, so Sainsburys should be open.`)
    console.log('------------------------------------------------------------')
    sendAlertEmail(`${awayTeam} are playing ${homeTeam} at ${venue} on ${fixtureDateFormatted} at ${time}, so Sainsburys should be open.`, `${awayTeam} are playing away this week!`);
    sendTextMessage(`${awayTeam} are playing ${homeTeam} at ${venue} on ${fixtureDateFormatted} at ${time}, so Sainsburys should be open.`)
  }

  else {
    console.log('------------------------------------------------------------')
    console.log('No matches are scheduled this week.');
    console.log('------------------------------------------------------------')
  }

}

// fetchData()

const job = new CronJob(
  '0 9 * * 1,5',
  fetchData,
  null,
  true,
);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is listening on port ${port}`);
});