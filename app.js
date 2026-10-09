import 'dotenv/config';
import axios from 'axios';
import nodemailer from 'nodemailer';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const PALACE_ID = 52;
const TZ = 'Europe/London';
const DAYS_AHEAD = 4;
const SENDER = 'crystalpalace.alerts@gmail.com';

const { RAPIDAPI_KEY, RAPIDAPI_HOST, MY_EMAIL, GMAIL_APP_PASSWORD } = process.env;

for (const [name, value] of Object.entries({ RAPIDAPI_KEY, RAPIDAPI_HOST, MY_EMAIL, GMAIL_APP_PASSWORD })) {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: SENDER, pass: GMAIL_APP_PASSWORD },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
});

async function getUpcomingFixtures() {
  const { data } = await axios.get(`https://${RAPIDAPI_HOST}/v3/fixtures`, {
    params: { team: PALACE_ID, next: 5 },
    headers: { 'X-RapidAPI-Key': RAPIDAPI_KEY, 'X-RapidAPI-Host': RAPIDAPI_HOST },
    timeout: 15000,
  });
  return data.response ?? [];
}

function buildAlert(fixture) {
  const kickoff = dayjs(fixture.fixture.date).tz(TZ);
  const isHome = fixture.teams.home.id === PALACE_ID;
  const opponent = isHome ? fixture.teams.away.name : fixture.teams.home.name;
  const venue = fixture.fixture.venue.name;
  const when = `${kickoff.format('dddd D MMMM')} at ${kickoff.format('HH:mm')}`;

  return isHome
    ? {
        subject: `Palace at home on ${kickoff.format('dddd')}`,
        text: `Crystal Palace are playing ${opponent} at ${venue} on ${when}. Sainsbury's will be closed!`,
      }
    : {
        subject: `Palace away on ${kickoff.format('dddd')}`,
        text: `Crystal Palace are away at ${opponent} (${venue}) on ${when}, so Sainsbury's should be open.`,
      };
}

async function main() {
  const today = dayjs().tz(TZ).startOf('day');

  const fixtures = (await getUpcomingFixtures()).filter((f) => {
    const daysAway = dayjs(f.fixture.date).tz(TZ).startOf('day').diff(today, 'day');
    return daysAway >= 0 && daysAway <= DAYS_AHEAD;
  });

  if (fixtures.length === 0) {
    console.log(`No matches in the next ${DAYS_AHEAD} days.`);
    return;
  }

  for (const fixture of fixtures) {
    const { subject, text } = buildAlert(fixture);
    console.log(text);
    const info = await transporter.sendMail({ from: `CP Alerts <${SENDER}>`, to: MY_EMAIL, subject, text });
    console.log('Email sent:', info.response);
  }
}

main().catch((err) => {
  console.error('Alert run failed:', err.response?.data ?? err);
  process.exitCode = 1;
});
