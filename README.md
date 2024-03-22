# Sync RaceTec to Titanium Remote Database

This is a simple application that syncs the RaceTec database to a remote database. It is designed to be run on a local machine and will sync the data on a regular interval.

## Usage

### Prerequisites

- [Node.js](https://nodejs.org/en/download/)
- [pnpm](https://pnpm.io/installation)

### Running for the first time.

- Run "start-titanium-sync.bat"
- Add env variables based on the .env.example file

## Configuration

- Go to `/src/config.ts` to change the default / slow sync interval values for each sync type.
  - MAX_DELETE_COUNT can also be changed here. (This is the maximum number of rows that can be deleted in a single sync. If 0 is set, will skip the delete step)

## Updating

- Open git bash
- cd ~/titanium-admin
- git pull
- pnpm build
- pnpm start

## Development

### Installation

1. Clone the repo

   ```sh
   git clone https://github.com/ENTER-REPO-HERE
   ```

2. Install NPM packages

   ```sh
   pnpm install

   ```

3. Run in development mode
   ```sh
   pnpm run dev
   ```
4. Open in browser ( http://localhost:3000 )

### Local Database Setup

- Install Docker (and WSL 2 if on Windows)
- Run the following command to start a local database

#### Start the local database (MSSQL RaceTec)

- Load RaceTec.bak into the local MSSQL database
- Then run:

```sh
pnpm db:start-local
```

### Start the 'remote' database (MYSQL)

- Load the mysql dump file into the "remote" mysql database
- Then run:

```sh
pnpm db:start-remote
```

### Technology Stack

- Next.js
- TypeScript
- [ShadcnUI](https://ui.shadcn.com/) (Tailwind CSS + Radix UI)
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [TRPC](https://trpc.io/) + [React Query](https://tanstack.com/query/latest/docs/framework/react/overview)

### Folder Structure

- `src/app/api/trpc/[trpc]/route.ts` - All API routes are routed here
- `src/services` - All API logic is located here

  - `src/services/index.ts` - Main router definition for all services (similar to normal trpc app router)
  - `src/services/configure-services.ts` - connections to remote and local databases are defined here, and passed as context to all services

- `src/components/admi-table/rows.tsx`- All table rows are configured here.
- `src/components/admin-table/actions` - The sync actions (including interal logic, rendering status, and showing logs) are defined here.

## TODOS:

[x]: running = sync green
iteration 1:
[x]: change default sync interval
[x]: too many connections error (use singleton)
[x]: all sync queries implemented
[-]: test with actual digital ocean
[x]: set up desktop icon for starting
[x]: write quick docs in readme
[-]: change race id (modal)
[-]: change local / remote db title
[x]: run all once
[x]: add count X seconds until next run (time till text)

interation 2:
[-]: add event parameters
[-]: handle logging
[]: add explanation/user guide
[]: add logo
