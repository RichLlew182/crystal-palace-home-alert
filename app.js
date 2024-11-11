import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import twilio from 'twilio';
import axios from 'axios'

dayjs.locale('en');

dotenv.config()

const gmailAppPassword = process.env.PASSWORD
const accountSid = process.env.SID;
const authToken = process.env.TOKEN;


const client = twilio(accountSid, authToken);

let todaysDate = dayjs()
// console.log(todaysDate)



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

const url = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?team=52&next=50';
const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': '0de7666b80mshc15c644e1ec3fe5p19f21bjsn186f44de2c74',
    'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
  }
};

let venue = '';
let awayTeam = '';
let fixtureDate = '';
let daysFromNow = '';
let futureDate = '';

const fetchData = async function () {

  try {
    let res = await axios.get(url, options);
    // console.log(response);

    const data = res.data.response[0];
    // console.log(data);

    venue = data.fixture.venue.name;
    awayTeam = data.teams.away.name;
    fixtureDate = data.fixture.date;
    fixtureDate = dayjs(fixtureDate).format('dddd DD MMMM YYYY')
    futureDate = dayjs(data.fixture.date);
    daysFromNow = futureDate.diff(todaysDate, 'day');
    futureDate = futureDate.format('DD/MM/YY');

    console.log(`Crystal Palace are playing ${awayTeam} at ${venue} on ${fixtureDate}. Sainsburys will be closed!`);

    sendAlerts()

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


}

fetchData()