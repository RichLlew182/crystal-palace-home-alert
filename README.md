# Crystal Palace at Home Alerts
This is a mini project I created to alert me whenever Crystal Palace F.C. has a home game coming up.

Living close to Selhurst Park has its drawbacks on match days: traveling fans often take local parking spots, and the nearby Sainsbury’s usually closes due to the stadium’s proximity. I’ve had several instances where I’ve driven to do my weekly shop, only to find Sainsbury’s closed, and then struggled to find parking when I got back home.

To avoid these inconveniences, I set up an alert system that checks for any matches in the upcoming week and notifies me if they’re at home. The alerts, which are sent via email and SMS, also indicate whether Sainsbury’s will be open. I used Nodemailer for email notifications and Twilio for SMS alerts, while scheduling is handled by the Cron package, with alerts set for Mondays and Fridays at 9 a.m. to cover both weekday and weekend matches.

## Dependencies

- **Node.js**
- **Express**
- **Axios**
- **Nodemailer**
- **Cron**
- **Twilio**
- **DayJS**

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve the project.

## Acknowledgments

- Thanks to [API FOOTBALL](https://rapidapi.com/api-sports/api/api-football) for the API access.

