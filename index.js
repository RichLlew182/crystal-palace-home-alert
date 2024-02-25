const dayjs = require('dayjs');
var relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

var timeFromNow = dayjs().to(dayjs('2024-02-29'))
console.log(timeFromNow);

const url = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?team=52&next=50';
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': '0de7666b80mshc15c644e1ec3fe5p19f21bjsn186f44de2c74',
		'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
	}
};

// fetch(url, options)
//   .then(function (result) {
//     return result.json();
//   }).then(function (data) {

    
//     const crystalPalaceFixtures = data.response
    
//     for (let i = 0; i < crystalPalaceFixtures.length; i++) {
//       console.log(data.response[i])
//       const venue = crystalPalaceFixtures[i].fixture.venue.name;
//       const homeTeam = crystalPalaceFixtures[i].teams.home.name;
//       const awayTeam = crystalPalaceFixtures[i].teams.away.name;
//       const league = crystalPalaceFixtures[i].league.name;
//       let date = crystalPalaceFixtures[i].fixture.date
//       date = dayjs(date).format('DD/MM/YY')
      
//       console.log('------------------------------------------------------------')
//       console.log(`${homeTeam} are playing ${awayTeam} in the ${league} at ${venue} on ${date}`)

//       if (date)


//     }

    
//   })
//   .catch(function (error) {
//     // Handle errors
//     console.error('Error:', error);
//   });

