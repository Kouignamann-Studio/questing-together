-- Reset combat state when restarting adventure
-- Run this in Supabase SQL Editor.

begin;

create or replace function public.reset_combat(p_room_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_room_member(p_room_id) then
    raise exception 'Not a room member';
  end if;

  -- Reset all characters: full HP, level 1, 0 gold, 0 exp, no taunt
  update public.characters
  set hp = hp_max,
      level = 1,
      gold = 0,
      exp = 0,
      taunt_turns_left = 0
  where room_id = p_room_id;

  -- Delete old enemies so seed_enemies creates fresh ones
  delete from public.enemies
  where room_id = p_room_id;

  return true;
end;
$$;

grant execute on function public.reset_combat(uuid) to authenticated;

commit;
