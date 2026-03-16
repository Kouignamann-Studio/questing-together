# Questing Together

A cooperative multiplayer storytelling RPG built with [Expo](https://expo.dev) and [Supabase](https://supabase.com).

## Prerequisites

- [Bun](https://bun.sh/) (runtime & package manager)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

## Get started

1. Install dependencies

   ```bash
   bun install
   ```

2. Set up environment variables

   Create a `.env` file at the project root:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

   Get the values from a team member or the Supabase dashboard.

3. Start the app

   ```bash
   bun start
   ```

## Scripts

| Script | Description |
|--------|-------------|
| `bun start` | Start the Expo dev server |
| `bun run android` | Run on Android |
| `bun run ios` | Run on iOS |
| `bun run web` | Run on web |
| `bun run lint` | Lint & check with Biome |
| `bun run lint:fix` | Auto-fix lint & format issues |
| `bun run format` | Format all files with Biome |
| `bun run build:dev` | Build iOS development client (requires `expo start`) |
| `bun run build:preview` | Build iOS preview (standalone, no server needed) |
| `bun run update:preview` | Push an OTA update to preview builds |

## Builds & distribution

### Pour les devs (development build)

```bash
bun run build:dev
```

Installe l'app via le lien EAS, puis lance `expo start` sur ton Mac. L'app se connecte automatiquement au serveur de dev.

### Pour les testeurs / designers (preview build)

```bash
bun run build:preview
```

App standalone qui tourne sans serveur de dev. Envoie le lien d'install aux testeurs, c'est tout.

### Pusher une update (sans rebuild)

```bash
bun run update:preview
```

Met a jour l'app pour tous ceux qui ont le build preview installe. Pas besoin de refaire un build (limites a 30/mois). Seuls les changements natifs (nouveau plugin, nouvelle lib native) necessitent un rebuild.

## Project structure

```
src/
  app/          # Expo Router file-based routes
  api/          # Supabase client & API hooks
  components/   # UI components (Card, Animated, Layout)
  constants/    # Static data (storyConfig.json, constants)
  features/     # Feature-specific components (lobby, combat, party, story, emote, timed)
  hooks/        # Custom React hooks
  types/        # TypeScript types (player, story)
  utils/        # Utility functions & story config loader
  assets/       # Fonts, images
supabase/
  functions/    # Supabase Edge Functions (Deno)
```

## Tooling

- **Bun** - package manager & script runner
- **Biome** - linter & formatter (replaces ESLint + Prettier)
- **Husky** - pre-commit hook (lint avant chaque commit)
- **TypeScript** - strict mode
- **EAS** - builds & OTA updates

## Multiplayer

### Product rules

- 3 players pick unique roles (sage, warrior, ranger) before the host starts.
- Scene flow: Phase 1 (first action), Phase 2 (remaining actions), Phase 3 (vote).
- Each player may take at most one action per scene (or choose "no reaction").
- Decisions: one default option visible; hidden options unlock from action outcomes.
- Vote resolution: majority wins, random on tie, then advance scene.
- Story content lives in `src/constants/storyConfig.json` and is validated at runtime.
- Branching story graph with tag-driven routing + multiple endings.
- Optional combat scenes (shared combat actions, persistent party HP, automatic resolution).
- Timed rest/travel scenes (server-authoritative timers, automatic advance).

### Backend (Supabase)

- Anonymous auth enabled (MVP).
- Database tables: `rooms`, `room_players`, `room_messages`, `room_events`, `push_subscriptions`, `push_notification_dispatches`.
- Realtime publication includes: `rooms`, `room_players`, `room_messages`, `room_events`.
- Edge function `timed-scene-notify` (`supabase/functions/timed-scene-notify/index.ts`).

### Event stream contract (`room_events`)

Client action RPCs:
- `story_select_role`, `story_set_display_name`, `story_start_adventure`
- `story_take_action`, `story_confirm_option`, `story_resolve_combat`
- `story_start_timer`, `story_resolve_timed_scene`
- `set_push_subscription`, `story_reset`

Generated events: `scene_action`, `scene_resolve`, `scene_timer_started`, `story_reset`.

### Deployment

- Env vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Apply `src/api/sql/supabase-schema.sql` for fresh setup.
- If migrating from old schema, apply `src/api/sql/supabase-pivot-migration.sql`.
