# Questing Together

Multiplayer Text RPG Adventure built with Expo (React Native) and Supabase.

## Getting Started

```bash
bun install
npx expo start --clear
```

## Scripts

| Script | Description |
|---|---|
| `bun run start` | Start Expo dev server |
| `bun run ios` | Run on iOS |
| `bun run android` | Run on Android |
| `bun run lint` | Run Biome linter |
| `bun run lint:fix` | Auto-fix lint issues |
| `bun run format` | Format code with Biome |
| `bun run db:migrate` | Apply all SQL migrations + regenerate types |
| `bun run db:types` | Regenerate Supabase DB types only |
| `bun run build:dev` | EAS build (development, iOS) |
| `bun run build:preview` | EAS build (preview, iOS) |
| `bun run update:preview` | EAS OTA update (preview channel) |

## Supabase

### First-time setup

Login to the Supabase CLI and link the project:

```bash
npx supabase login          # opens browser to authenticate
npx supabase link --project-ref jjomkrlwakrtshdnsrtu
```

You only need to do this once. It creates a `supabase/.temp` directory locally to store the link.

### Apply migrations

All SQL migrations live in `src/api/sql/`. Old/deprecated migrations are in `src/api/sql/old/`.

Apply all migrations at once:

```bash
bun run db:migrate
```

This runs every `.sql` file in `src/api/sql/` (alphabetical order) against the linked project, then regenerates the TypeScript types.

To add a new migration, create a `.sql` file in `src/api/sql/` — it will be picked up automatically.

### Generate DB types only

```bash
bun run db:types
```

This generates `src/api/database.types.ts` from the live database schema.

## Tech Stack

- **App**: Expo (React Native), Expo Router, TypeScript
- **State**: TanStack Query, React Context
- **Backend**: Supabase (Postgres, Auth, Realtime)
- **Styling**: Inline styles, custom design system (`src/components/`)
- **Linting**: Biome
