const dayjs = require('dayjs');

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

fetch(url, options)
  .then(function (result) {
    return result.json();
  }).then(function (data) {

    
    const crystalPalaceFixtures = data.response
    
    for (let i = 0; i < crystalPalaceFixtures.length; i++) {
      // console.log(data.response[i])
      const venue = crystalPalaceFixtures[i].fixture.venue.name;
      const homeTeam = crystalPalaceFixtures[i].teams.home.name;
      const awayTeam = crystalPalaceFixtures[i].teams.away.name;
      const league = crystalPalaceFixtures[i].league.name;
      let futureDate = dayjs(crystalPalaceFixtures[i].fixture.date);
      let daysFromNow = futureDate.diff(todaysDate, 'day');
      console.log(daysFromNow)
      futureDate = futureDate.format('DD/MM/YY')
      
      
      console.log('------------------------------------------------------------')
      // console.log(`${homeTeam} are playing ${awayTeam} in the ${league} at ${venue} on ${futureDate} which is ${daysFromNow} days away.`)
      
      if (daysFromNow < 7) {
        console.log('Heads up, Crystal Palace are playing this week!')
      }
      
      if (daysFromNow < 7 && venue === 'Selhurst Park ') {
        console.log('FFS, Crystal Palace are playing at home this week. Sainsburys will be closed!');
        sendAlertEmail();
      }
       
      if (daysFromNow < 7 && venue !== 'Selhurst Park') {
        console.log('Crystal Palace are playing away this week, so Sainsburys should be open.')
        sendAlertEmail();
      }
      

    }

    
  })
  .catch(function (error) {
    // Handle errors
    console.error('Error:', error);
  });

