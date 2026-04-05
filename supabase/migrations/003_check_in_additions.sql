alter table check_ins
  add column time_of_day      text,
  add column protein_so_far_g int,
  add column calories_so_far  int,
  add column symptoms_today   text;
