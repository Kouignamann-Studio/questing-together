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
| `bun run db:types` | Regenerate Supabase DB types |
| `bun run build:dev` | EAS build (development, iOS) |
| `bun run build:preview` | EAS build (preview, iOS) |
| `bun run update:preview` | EAS OTA update (preview channel) |

## Supabase

### Generate DB types

Requires Supabase CLI login:

```bash
npx supabase login
bun run db:types
```

This generates `src/api/database.types.ts` from the live database schema.

### Apply migrations

SQL migrations are in `src/api/sql/`. Apply them via the Supabase SQL Editor:

- `supabase-schema.sql` — full bootstrap schema
- `supabase-pivot-migration.sql` — roles + action loop migration
- `supabase-characters-migration.sql` — characters table + updated RPCs

## Tech Stack

- **App**: Expo (React Native), Expo Router, TypeScript
- **State**: TanStack Query, React Context
- **Backend**: Supabase (Postgres, Auth, Realtime)
- **Styling**: Inline styles, custom design system (`src/components/`)
- **Linting**: Biome
