# Strava Stats

This application provides statistics for your Strava activities.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/strava-stats.git
    cd strava-stats
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

## Configuration

1. Create a `.env` file in the root directory and add your Strava API credentials:
    ```env
    STRAVA_CLIENT_ID=your_client_id
    STRAVA_CLIENT_SECRET=your_client_secret
    REDIRECT_URI=http://localhost:3000/auth/callback
    ```

## Running the App

1. Start the application:
    ```sh
    npm start
    ```

2. Open your browser and navigate to `http://localhost:3000` to view the app.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Create a new Pull Request

## Contact

For any questions or feedback, please open an issue on GitHub.
