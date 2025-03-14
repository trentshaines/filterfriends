# FilterFriends

A web application for finding and filtering coffee shops based on various criteria including drinks quality, study environment, and ambiance.

## Features

- Find coffee shops near your location
- View ratings for drinks, study environment, and ambiance
- Sort and filter coffee shops based on your preferences
- View coffee shop details including address, hours, and photos

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and add your API keys
4. Run the development server: `npm run dev`

## Environment Variables

This project requires the following environment variables:

- `GOOGLE_MAPS_API_KEY`: Google Maps API key with Places API enabled
- `OPENAI_API_KEY`: OpenAI API key (if using LLM features)

## Technologies Used

- Next.js
- React
- TypeScript
- Google Places API
- OpenAI API (for review analysis)

## Tech Stack

- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: Google Places API for location data

## Getting Started

### Prerequisites

- Node.js 18.x or later
- A Google Maps API key with Places API enabled

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/filterfriends.git
   cd filterfriends
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your Google Maps API key:
   ```
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

   To get a Google Maps API key:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Places API
   - Create an API key in the Credentials section
   - Make sure to restrict the API key to only the Places API for security

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Click the "Find Nearby Coffee Shops" button to detect your location
2. Allow location access when prompted by your browser
3. View the list of coffee shops near you
4. Adjust the radius dropdown to expand or narrow your search

## Deployment

This application can be easily deployed to Vercel:

```bash
npm install -g vercel
vercel
```

Make sure to add your `GOOGLE_MAPS_API_KEY` to the environment variables in your Vercel project settings.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Google Places API for providing coffee shop data
- Next.js team for the amazing framework
- Tailwind CSS for the styling utilities
