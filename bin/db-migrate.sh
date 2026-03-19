#!/bin/bash
# Apply all SQL migrations to Supabase in order.
# Usage: bun run db:migrate

set -e

PROJECT_ID="jjomkrlwakrtshdnsrtu"
SQL_DIR="src/api/sql"

MIGRATIONS=$(find "$SQL_DIR" -maxdepth 1 -name '*.sql' -type f | sort)
COUNT=$(echo "$MIGRATIONS" | wc -l | tr -d ' ')

echo "Applying $COUNT migrations to project $PROJECT_ID..."

for path in $MIGRATIONS; do
  file=$(basename "$path")
  echo "  Applying $file..."
  npx supabase db query --linked -f "$path"
done

echo "Done. Regenerating types..."
npx supabase gen types typescript --project-id "$PROJECT_ID" > src/api/database.types.ts
echo "Types updated."
