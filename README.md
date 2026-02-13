# حمزة - Quran Web App

A modern, Arabic-first Quran web application built with Next.js 15, React 19, and TypeScript.

## Features

- Browse all 114 surahs with search, sort, and filter
- Beautiful Quran text rendering with Uthmanic script
- Audio player with queue, speed control, and ayah highlighting
- Bookmarks and last-read position tracking
- Light/dark theme with spiritual color palette
- Font size customization
- Optional Tafsir (translation/interpretation)
- Responsive design (mobile-first)
- RTL/Arabic-first UX
- PWA ready (Add to Home Screen)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **State**: Zustand (persisted to localStorage)
- **APIs**: AlQuran Cloud (Quran data) + IslamHouse (reciters/audio)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone <repo-url>
cd HazmaQuranApp
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_ISLAMHOUSE_API_KEY=paV29H2gm56kvLPy
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Project Structure

```
app/
  layout.tsx              # Root layout (theme, audio providers)
  (main)/
    layout.tsx            # Main layout (navbar, audio player)
    page.tsx              # Home page
    surahs/
      page.tsx            # Surah list (search, sort, filter)
      [id]/page.tsx       # Surah reader
    reciters/
      page.tsx            # Reciters list
      [id]/page.tsx       # Reciter detail
    bookmarks/page.tsx    # Bookmarks
    settings/page.tsx     # Settings
lib/
  api/
    types.ts              # All TypeScript types
    client.ts             # HTTP client with retry & cache
    datasource.ts         # QuranDataSource interface
    providers/
      islamhouse.ts       # IslamHouse API provider
      alquran-cloud.ts    # AlQuran Cloud API provider
  stores/                 # Zustand stores (bookmarks, settings, audio)
  constants.ts            # App constants
components/
  ui/                     # shadcn/ui primitives
  layout/                 # Navbar, AudioPlayer, ThemeToggle
  quran/                  # SurahCard, AyahRow, ReciterCard, SearchInput
  shared/                 # Skeleton, ErrorState, EmptyState
  providers/              # ThemeProvider, AudioProvider
hooks/                    # Custom hooks (audio player, debounce)
```

## API Architecture

The app uses a **QuranDataSource** abstraction layer that allows swapping between API providers:

- **AlQuranCloudProvider**: Quran text, ayahs, translations (default for Quran data)
- **IslamHouseProvider**: Reciters, recitations, audio files (default for audio/reciters)

To add a new provider, implement the `QuranDataSource` interface in `lib/api/datasource.ts`.

## Deployment

### Vercel (Recommended)

```bash
npx vercel
```

### Docker

```bash
docker build -t quran-app .
docker run -p 3000:3000 quran-app
```

## License

MIT
