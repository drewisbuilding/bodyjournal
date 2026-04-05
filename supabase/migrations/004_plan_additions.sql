alter table plans
  add column fuel_status        text,
  add column training_readiness text,
  add column nutrition_gap      text,
  add column reasoning_summary  text,
  add column what_to_eat_next   jsonb,
  add column adjustment_notes   jsonb;
