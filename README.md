# Run Dave Run

Live race tracker for the Centennial Trail 100k — June 13, 2026.

## What it does

Two views:

- **Supporter view** (`/`) — shows a live map of the course, the runner's latest check-in, progress bar, and status updates. Auto-refreshes every 15 seconds. Share this URL with anyone following along.
- **Runner view** (`/runner`) — PIN-protected. Tap to check in at named checkpoints, post quick status updates, or send an SOS. Grabs GPS in the background when available.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, webpack)
- TypeScript
- Tailwind CSS
- MongoDB + Mongoose
- Leaflet / React-Leaflet
- Vercel (hosting)

## Project structure

```
src/
  app/
    page.tsx              # Supporter view
    runner/page.tsx       # Runner view
    api/
      race/route.ts       # GET active race, POST new race
      races/route.ts      # GET all races
      races/[id]/route.ts # PATCH (activate), DELETE race
      checkin/route.ts    # GET/POST/DELETE check-ins
      status/route.ts     # GET/POST/DELETE status updates
      race-data/route.ts  # Combined endpoint for supporter view polling
  components/
    RaceMap.tsx           # Leaflet map with route polyline
  data/
    checkpoints.ts        # Ordered checkpoint list for the Centennial 100k
  lib/
    mongodb.ts            # Mongoose connection with dev-mode caching
  models/
    Race.ts               # Race session model
    CheckIn.ts            # Check-in model
    StatusUpdate.ts       # Status update model
  types/
    race.ts               # Shared TypeScript types (safe for client + server)
```

## Environment variables

```
MONGODB_URI=mongodb+srv://...
RUNNER_PIN=your_pin_here
```

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Race management

The runner view opens to a race selection screen after PIN entry:

- **Start New Race** — give it a name, archives any currently active race
- **Load Existing Race** — reactivates a previous race
- **Delete a Race** — removes the race and all its check-ins and status updates

## Checkpoints

The Centennial Trail 100k is an out-and-back course (~62 miles). Checkpoints are defined as an ordered list covering both legs — tap them sequentially as you reach each one. The map colors the completed portion of the route green based on your position in the checkpoint list.

Checkpoint locations are in `src/data/checkpoints.ts` and can be updated if the race organizers publish official exchange zones.
