const url = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?league=39&team=52&next=50&venue=525';
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

    console.log(data.response[0])
  })

