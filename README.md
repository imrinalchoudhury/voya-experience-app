# Voya - Journey Planning App

A beautiful, modern journey planning application that helps you organize and plan your travel experiences. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Journey Management**: Create and organize multiple journeys with destinations and dates
- **Experience Tracking**: Add experiences to your journeys with details like:
  - Activity name and description
  - Type (dining, lodging, activities, transportation, shopping)
  - Date, time, and duration
  - Location and cost tracking
  - Booking status and confirmation details
  - Personal notes
- **AI-Powered Suggestions**: Get intelligent experience suggestions using Claude AI (requires Anthropic API credits)
- **Real-time Data**: All data synced with Supabase in real-time
- **Beautiful UI**: Clean, modern interface with smooth animations and responsive design

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL database)
- **Edge Functions**: Supabase Edge Functions with Deno
- **AI**: Anthropic Claude API
- **Build Tool**: Vite

## Database Schema

The app uses three main tables:

1. **journeys**: Stores journey information (destination, dates, notes)
2. **experiences**: Stores individual experiences linked to journeys
3. **journey_stats**: View that provides statistics for each journey

All tables have Row Level Security (RLS) enabled for future authentication support.

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- (Optional) Anthropic API key for AI suggestions

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

The database migration is already included in `supabase/migrations/`. If you need to apply it manually:

- The migration creates the necessary tables, indexes, and RLS policies
- It includes a view for journey statistics
- All data is set up with proper foreign key relationships

### 4. (Optional) Set Up AI Suggestions

To enable AI-powered suggestions:

1. Get an Anthropic API key from [console.anthropic.com](https://console.anthropic.com/)
2. Add credits to your Anthropic account
3. Configure the secret in Supabase:
   - Go to your Supabase project dashboard
   - Navigate to Edge Functions
   - Add a secret named `ANTHROPIC_API_KEY` with your API key

The Edge Function is already deployed at `supabase/functions/suggest-experiences/`.

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

### Creating a Journey

1. Click "New Journey" on the homepage
2. Enter destination, travel dates, and optional notes
3. Click "Create Journey"

### Adding Experiences

1. Open a journey by clicking on it
2. Click "Add Experience"
3. Fill in the experience details:
   - Name and description
   - Type (dining, lodging, activities, etc.)
   - Date, time, and duration
   - Location and cost
   - Booking status and notes
4. Click "Add Experience"

### Using AI Suggestions

1. Open a journey
2. Click "Suggest With AI"
3. Enter what you're looking for (e.g., "Michelin starred dinner" or "romantic sunset activities")
4. The AI will suggest relevant experiences based on your destination
5. Click "Add to Journey" to save suggested experiences

Note: AI suggestions require an Anthropic API key with available credits.

## Project Structure

```
voya/
├── src/
│   ├── components/          # React components
│   │   ├── Homepage.tsx     # Main landing page
│   │   ├── JourneyView.tsx  # Journey detail view
│   │   ├── NewJourneyModal.tsx
│   │   ├── AddExperienceModal.tsx
│   │   ├── AISuggestModal.tsx
│   │   ├── DataLoader.tsx   # Sample data loader
│   │   └── Header.tsx
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client setup
│   │   └── database.types.ts # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/          # Database migrations
│   └── functions/           # Edge Functions
│       └── suggest-experiences/
└── dist/                    # Production build
```

## Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Features in Detail

### Journey Statistics

Each journey automatically tracks:
- Total number of experiences
- Total estimated cost
- Number of confirmed bookings
- Number of pending bookings

### Experience Types

- 🍽️ Dining
- 🏨 Lodging
- 🎯 Activities
- 🚗 Transportation
- 🛍️ Shopping

### Data Persistence

All data is stored in Supabase and persists across sessions. The app supports:
- Real-time data synchronization
- Automatic timestamps
- Data validation
- Secure access with RLS policies (ready for authentication)

## Troubleshooting

### AI Suggestions Not Working

If you see an error with AI suggestions:
1. Check that `ANTHROPIC_API_KEY` is configured in Supabase Edge Function secrets
2. Verify you have credits in your Anthropic account
3. Check the browser console for specific error messages

### Database Connection Issues

1. Verify your `.env` file has the correct Supabase credentials
2. Check that your Supabase project is active
3. Ensure the migrations have been applied

## Future Enhancements

Potential features to add:
- User authentication and multi-user support
- Journey sharing and collaboration
- Map integration for locations
- Photo attachments for experiences
- Budget tracking and currency conversion
- Itinerary export (PDF, calendar)
- Mobile app version

## License

This project is private and proprietary.

## Support

For issues or questions, please check the troubleshooting section or review the code comments for implementation details.
