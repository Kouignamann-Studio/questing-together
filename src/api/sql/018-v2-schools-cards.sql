-- 018: V2 — 4 schools per character, new card definitions
-- Replaces old universal card_definitions with role-specific cards.

-- Clear old card definitions
delete from public.card_definitions;

-- ═══════════════════════════════════════════════════════════════
-- WARRIOR CARDS
-- ═══════════════════════════════════════════════════════════════

insert into public.card_definitions (id, name, cost, trait, description, upgrade_threshold, upgrade_name, upgrade_description, base_damage, upgraded_damage, base_block, upgraded_block, base_heal, upgraded_heal, base_burn, upgraded_burn, is_aoe, is_rare, is_starter, starter_role) values
  -- Rage starters
  ('w-strike', 'Strike', 1, 'rage', 'Deal 8 damage.', 3, 'Strike+', 'Deal 11 damage.', 8, 11, null, null, null, null, null, null, false, false, true, 'warrior'),
  ('w-quick-slash', 'Quick Slash', 0, 'rage', 'Deal 3 damage.', 3, 'Quick Slash+', 'Deal 5 damage.', 3, 5, null, null, null, null, null, null, false, false, true, 'warrior'),
  ('w-heavy-blow', 'Heavy Blow', 2, 'rage', 'Deal 14 damage.', 2, 'Crushing Blow', 'Deal 19 damage.', 14, 19, null, null, null, null, null, null, false, false, true, 'warrior'),
  -- Iron starters
  ('w-guard', 'Guard', 1, 'iron', 'Gain 7 Block.', 3, 'Guard+', 'Gain 10 Block.', null, null, 7, 10, null, null, null, null, false, false, true, 'warrior'),
  ('w-brace', 'Brace', 0, 'iron', 'Gain 3 Block.', 3, 'Brace+', 'Gain 5 Block.', null, null, 3, 5, null, null, null, null, false, false, true, 'warrior'),
  ('w-fortify', 'Fortify', 2, 'iron', 'Gain 12 Block.', 2, 'Fortify+', 'Gain 16 Block.', null, null, 12, 16, null, null, null, null, false, false, true, 'warrior'),
  -- Blood starters
  ('w-drain-strike', 'Drain Strike', 1, 'blood', 'Deal 5 damage. Heal 3.', 3, 'Drain Strike+', 'Deal 7 damage. Heal 5.', 5, 7, null, null, 3, 5, null, null, false, false, true, 'warrior'),
  ('w-blood-pact', 'Blood Pact', 0, 'blood', 'Heal 2.', 3, 'Blood Pact+', 'Heal 4.', null, null, null, null, 2, 4, null, null, false, false, true, 'warrior'),
  ('w-siphon', 'Siphon', 2, 'blood', 'Deal 8 damage. Heal 6.', 2, 'Siphon+', 'Deal 11 damage. Heal 8.', 8, 11, null, null, 6, 8, null, null, false, false, true, 'warrior'),
  -- Thunder starters
  ('w-shock', 'Shock', 1, 'thunder', 'Deal 6 damage. Weak 1.', 3, 'Shock+', 'Deal 9 damage. Weak 1.', 6, 9, null, null, null, null, null, null, false, false, true, 'warrior'),
  ('w-spark', 'Spark', 0, 'thunder', 'Deal 2 damage.', 3, 'Spark+', 'Deal 4 damage.', 2, 4, null, null, null, null, null, null, false, false, true, 'warrior'),
  ('w-lightning-strike', 'Lightning Strike', 2, 'thunder', 'Deal 12 damage. Vuln 1.', 2, 'Lightning Strike+', 'Deal 16 damage. Vuln 1.', 12, 16, null, null, null, null, null, null, false, false, true, 'warrior'),
  -- Rage rewards
  ('w-reckless-strike', 'Reckless Strike', 1, 'rage', 'Deal 12 damage. Take 3 damage.', 3, 'Reckless Strike+', 'Deal 16 damage. Take 3 damage.', 12, 16, null, null, null, null, null, null, false, false, false, 'warrior'),
  ('w-cleave', 'Cleave', 2, 'rage', 'Deal 10 damage to all.', 2, 'Great Cleave', 'Deal 14 damage to all.', 10, 14, null, null, null, null, null, null, true, false, false, 'warrior'),
  ('w-fury-chain', 'Fury Chain', 2, 'rage', 'Deal 5 damage x3.', 2, 'Fury Chain+', 'Deal 7 damage x3.', 5, 7, null, null, null, null, null, null, false, false, false, 'warrior'),
  ('w-savage-swing', 'Savage Swing', 1, 'rage', 'Deal 6 damage. Vuln 1.', 3, 'Savage Swing+', 'Deal 9 damage. Vuln 1.', 6, 9, null, null, null, null, null, null, false, false, false, 'warrior'),
  ('w-war-stomp', 'War Stomp', 2, 'rage', 'Deal 8 damage to all. Weak 1.', 2, 'War Stomp+', 'Deal 11 damage to all. Weak 1.', 8, 11, null, null, null, null, null, null, true, false, false, 'warrior'),
  ('w-execute', 'Execute', 3, 'rage', 'Deal 22 damage.', 2, 'Execute+', 'Deal 28 damage.', 22, 28, null, null, null, null, null, null, false, true, false, 'warrior'),
  ('w-rampage', 'Rampage', 3, 'rage', 'Deal 16 damage to all.', 2, 'Rampage+', 'Deal 22 damage to all.', 16, 22, null, null, null, null, null, null, true, true, false, 'warrior'),
  ('w-pummel', 'Pummel', 1, 'rage', 'Deal 4 damage x2.', 3, 'Pummel+', 'Deal 6 damage x2.', 4, 6, null, null, null, null, null, null, false, false, false, 'warrior'),
  ('w-headbutt', 'Headbutt', 0, 'rage', 'Deal 2 damage. Weak 1.', 3, 'Headbutt+', 'Deal 4 damage. Weak 1.', 2, 4, null, null, null, null, null, null, false, false, false, 'warrior'),
  ('w-bloodlust', 'Bloodlust', 2, 'rage', 'Deal 14 damage. Heal 4.', 2, 'Bloodlust+', 'Deal 18 damage. Heal 6.', 14, 18, null, null, 4, 6, null, null, false, false, false, 'warrior'),
  ('w-massacre', 'Massacre', 3, 'rage', 'Deal 14 damage to all. Vuln 1.', 2, 'Massacre+', 'Deal 18 damage to all. Vuln 2.', 14, 18, null, null, null, null, null, null, true, true, false, 'warrior'),
  ('w-charge', 'Charge', 1, 'rage', 'Deal 10 damage. Vuln 1.', 3, 'Charge+', 'Deal 13 damage. Vuln 1.', 10, 13, null, null, null, null, null, null, false, false, false, 'warrior')
on conflict (id) do update set name=excluded.name, cost=excluded.cost, trait=excluded.trait, description=excluded.description, upgrade_threshold=excluded.upgrade_threshold, upgrade_name=excluded.upgrade_name, upgrade_description=excluded.upgrade_description, base_damage=excluded.base_damage, upgraded_damage=excluded.upgraded_damage, base_block=excluded.base_block, upgraded_block=excluded.upgraded_block, base_heal=excluded.base_heal, upgraded_heal=excluded.upgraded_heal, base_burn=excluded.base_burn, upgraded_burn=excluded.upgraded_burn, is_aoe=excluded.is_aoe, is_rare=excluded.is_rare, is_starter=excluded.is_starter, starter_role=excluded.starter_role;

-- ═══════════════════════════════════════════════════════════════
-- SAGE CARDS
-- ═══════════════════════════════════════════════════════════════

insert into public.card_definitions (id, name, cost, trait, description, upgrade_threshold, upgrade_name, upgrade_description, base_damage, upgraded_damage, base_block, upgraded_block, base_heal, upgraded_heal, base_burn, upgraded_burn, is_aoe, is_rare, is_starter, starter_role) values
  -- Fire starters
  ('s-fireball', 'Fireball', 1, 'fire', 'Deal 7 damage. Burn 3.', 3, 'Fireball+', 'Deal 10 damage. Burn 5.', 7, 10, null, null, null, null, 3, 5, false, false, true, 'sage'),
  ('s-kindle', 'Kindle', 0, 'fire', 'Deal 3 damage.', 3, 'Kindle+', 'Deal 5 damage.', 3, 5, null, null, null, null, null, null, false, false, true, 'sage'),
  ('s-flame-wave', 'Flame Wave', 2, 'fire', 'Deal 10 damage to all.', 2, 'Flame Wave+', 'Deal 14 damage to all.', 10, 14, null, null, null, null, null, null, true, false, true, 'sage'),
  -- Frost starters
  ('s-ice-shard', 'Ice Shard', 1, 'frost', 'Deal 6 damage. Weak 1.', 3, 'Ice Shard+', 'Deal 9 damage. Weak 2.', 6, 9, null, null, null, null, null, null, false, false, true, 'sage'),
  ('s-frost-shield', 'Frost Shield', 0, 'frost', 'Gain 4 Block.', 3, 'Frost Shield+', 'Gain 6 Block.', null, null, 4, 6, null, null, null, null, false, false, true, 'sage'),
  ('s-blizzard', 'Blizzard', 2, 'frost', 'Deal 6 damage to all. Weak 1.', 2, 'Blizzard+', 'Deal 9 damage to all. Weak 2.', 6, 9, null, null, null, null, null, null, true, false, true, 'sage'),
  -- Storm starters
  ('s-zap', 'Zap', 0, 'storm', 'Deal 3 damage.', 3, 'Zap+', 'Deal 5 damage.', 3, 5, null, null, null, null, null, null, false, false, true, 'sage'),
  ('s-arc-bolt', 'Arc Bolt', 1, 'storm', 'Deal 8 damage.', 3, 'Arc Bolt+', 'Deal 11 damage.', 8, 11, null, null, null, null, null, null, false, false, true, 'sage'),
  ('s-thunderstrike', 'Thunderstrike', 2, 'storm', 'Deal 14 damage.', 2, 'Thunderstrike+', 'Deal 19 damage.', 14, 19, null, null, null, null, null, null, false, false, true, 'sage'),
  -- Arcane starters
  ('s-arcane-bolt', 'Arcane Bolt', 1, 'arcane', 'Deal 6 damage.', 3, 'Arcane Bolt+', 'Deal 9 damage.', 6, 9, null, null, null, null, null, null, false, false, true, 'sage'),
  ('s-mystic-shield', 'Mystic Shield', 0, 'arcane', 'Gain 3 Block. Heal 1.', 3, 'Mystic Shield+', 'Gain 5 Block. Heal 2.', null, null, 3, 5, 1, 2, null, null, false, false, true, 'sage'),
  ('s-arcane-blast', 'Arcane Blast', 2, 'arcane', 'Deal 12 damage.', 2, 'Arcane Blast+', 'Deal 16 damage.', 12, 16, null, null, null, null, null, null, false, false, true, 'sage')
on conflict (id) do update set name=excluded.name, cost=excluded.cost, trait=excluded.trait, description=excluded.description, upgrade_threshold=excluded.upgrade_threshold, upgrade_name=excluded.upgrade_name, upgrade_description=excluded.upgrade_description, base_damage=excluded.base_damage, upgraded_damage=excluded.upgraded_damage, base_block=excluded.base_block, upgraded_block=excluded.upgraded_block, base_heal=excluded.base_heal, upgraded_heal=excluded.upgraded_heal, base_burn=excluded.base_burn, upgraded_burn=excluded.upgraded_burn, is_aoe=excluded.is_aoe, is_rare=excluded.is_rare, is_starter=excluded.is_starter, starter_role=excluded.starter_role;

-- ═══════════════════════════════════════════════════════════════
-- RANGER CARDS
-- ═══════════════════════════════════════════════════════════════

insert into public.card_definitions (id, name, cost, trait, description, upgrade_threshold, upgrade_name, upgrade_description, base_damage, upgraded_damage, base_block, upgraded_block, base_heal, upgraded_heal, base_burn, upgraded_burn, is_aoe, is_rare, is_starter, starter_role) values
  -- Shadow starters
  ('r-shadow-mark', 'Shadow Mark', 1, 'shadow', 'Deal 4 damage. Vuln 2.', 3, 'Deep Mark', 'Deal 6 damage. Vuln 3.', 4, 6, null, null, null, null, null, null, false, false, true, 'ranger'),
  ('r-nick', 'Nick', 0, 'shadow', 'Deal 2 damage. Weak 1.', 3, 'Nick+', 'Deal 4 damage. Weak 1.', 2, 4, null, null, null, null, null, null, false, false, true, 'ranger'),
  ('r-ambush', 'Ambush', 2, 'shadow', 'Deal 12 damage.', 2, 'Ambush+', 'Deal 16 damage.', 12, 16, null, null, null, null, null, null, false, false, true, 'ranger'),
  -- Nature starters
  ('r-sprout', 'Sprout', 0, 'nature', 'Heal 3.', 3, 'Sprout+', 'Heal 5.', null, null, null, null, 3, 5, null, null, false, false, true, 'ranger'),
  ('r-vine-lash', 'Vine Lash', 1, 'nature', 'Deal 4 damage. Heal 4.', 3, 'Vine Lash+', 'Deal 6 damage. Heal 6.', 4, 6, null, null, 4, 6, null, null, false, false, true, 'ranger'),
  ('r-regrowth', 'Regrowth', 2, 'nature', 'Heal 8. +1 Regen.', 2, 'Regrowth+', 'Heal 12. +2 Regen.', null, null, null, null, 8, 12, null, null, false, false, true, 'ranger'),
  -- Precision starters
  ('r-quick-shot', 'Quick Shot', 0, 'precision', 'Deal 3 damage.', 3, 'Quick Shot+', 'Deal 5 damage.', 3, 5, null, null, null, null, null, null, false, false, true, 'ranger'),
  ('r-aimed-shot', 'Aimed Shot', 1, 'precision', 'Deal 9 damage.', 3, 'Aimed Shot+', 'Deal 12 damage.', 9, 12, null, null, null, null, null, null, false, false, true, 'ranger'),
  ('r-snipe', 'Snipe', 2, 'precision', 'Deal 16 damage.', 2, 'Snipe+', 'Deal 22 damage.', 16, 22, null, null, null, null, null, null, false, false, true, 'ranger'),
  -- Venom starters
  ('r-poison-dart', 'Poison Dart', 0, 'venom', 'Burn 3.', 3, 'Poison Dart+', 'Burn 5.', null, null, null, null, null, null, 3, 5, false, false, true, 'ranger'),
  ('r-toxic-strike', 'Toxic Strike', 1, 'venom', 'Deal 5 damage. Burn 4.', 3, 'Toxic Strike+', 'Deal 7 damage. Burn 6.', 5, 7, null, null, null, null, 4, 6, false, false, true, 'ranger'),
  ('r-acid-splash', 'Acid Splash', 2, 'venom', 'Deal 6 damage to all. Burn 3.', 2, 'Acid Splash+', 'Deal 9 damage to all. Burn 5.', 6, 9, null, null, null, null, 3, 5, true, false, true, 'ranger')
on conflict (id) do update set name=excluded.name, cost=excluded.cost, trait=excluded.trait, description=excluded.description, upgrade_threshold=excluded.upgrade_threshold, upgrade_name=excluded.upgrade_name, upgrade_description=excluded.upgrade_description, base_damage=excluded.base_damage, upgraded_damage=excluded.upgraded_damage, base_block=excluded.base_block, upgraded_block=excluded.upgraded_block, base_heal=excluded.base_heal, upgraded_heal=excluded.upgraded_heal, base_burn=excluded.base_burn, upgraded_burn=excluded.upgraded_burn, is_aoe=excluded.is_aoe, is_rare=excluded.is_rare, is_starter=excluded.is_starter, starter_role=excluded.starter_role;

-- Update combat_init_turn to use role-based trait_charges (4 schools per role)
create or replace function public.combat_init_turn(
  p_room_id uuid,
  p_screen_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_turn_id uuid;
  v_player record;
  v_starter_cards jsonb;
  v_draw_result jsonb;
  v_trait_charges jsonb;
begin
  if exists (select 1 from public.combat_turns where room_id = p_room_id and screen_id = p_screen_id) then
    return;
  end if;

  insert into public.combat_turns (room_id, screen_id, turn_number, phase)
  values (p_room_id, p_screen_id, 1, 'player')
  returning id into v_turn_id;

  for v_player in
    select rp.player_id, rp.role_id
    from public.room_players rp
    where rp.room_id = p_room_id
  loop
    insert into public.player_turn_state (combat_turn_id, player_id, actions_remaining, has_ended_turn)
    values (v_turn_id, v_player.player_id, 0, false);

    -- Build starter deck for this player's role
    select jsonb_agg(
      jsonb_build_object('cardId', cd.id, 'upgraded', false, 'usageCount', 0)
    ) into v_starter_cards
    from public.card_definitions cd
    where cd.is_starter = true and cd.starter_role = v_player.role_id;

    -- Fallback: if no role-specific cards, use all starters
    if v_starter_cards is null or jsonb_array_length(v_starter_cards) = 0 then
      select jsonb_agg(
        jsonb_build_object('cardId', cd.id, 'upgraded', false, 'usageCount', 0)
      ) into v_starter_cards
      from public.card_definitions cd
      where cd.is_starter = true;
    end if;

    -- Build trait_charges based on role (4 schools per role)
    v_trait_charges := case v_player.role_id
      when 'warrior' then '{"rage":0,"iron":0,"blood":0,"thunder":0}'::jsonb
      when 'sage' then '{"fire":0,"frost":0,"storm":0,"arcane":0}'::jsonb
      when 'ranger' then '{"shadow":0,"nature":0,"precision":0,"venom":0}'::jsonb
      else '{"rage":0,"iron":0,"blood":0,"thunder":0}'::jsonb
    end;

    v_draw_result := public._draw_hand(v_starter_cards, '[]'::jsonb, 4);

    insert into public.player_combat_state (
      room_id, screen_id, player_id, identity_id,
      draw_pile, hand, discard_pile,
      energy, max_energy, block,
      trait_charges, attune_charges
    ) values (
      p_room_id, p_screen_id, v_player.player_id, coalesce(v_player.role_id, 'warrior'),
      v_draw_result->'drawPile', v_draw_result->'hand', '[]'::jsonb,
      3, 3, 0,
      v_trait_charges,
      0
    )
    on conflict (room_id, screen_id, player_id) do nothing;
  end loop;

  update public.characters set taunt_turns_left = 0 where room_id = p_room_id;
end;
$$;

grant execute on function public.combat_init_turn(uuid, uuid) to authenticated;
