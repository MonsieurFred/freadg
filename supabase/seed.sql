-- ============================================================
-- FRIDGE - Donnees de demo
-- Executer apres supabase/schema.sql dans l'editeur SQL Supabase.
-- Le script est re-executable.
-- ============================================================

delete from public.weekly_selection
where recipe_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-4555-8555-555555555555',
  '66666666-6666-4666-8666-666666666666',
  '77777777-7777-4777-8777-777777777777',
  '88888888-8888-4888-8888-888888888888'
);

delete from public.ingredients
where recipe_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-4555-8555-555555555555',
  '66666666-6666-4666-8666-666666666666',
  '77777777-7777-4777-8777-777777777777',
  '88888888-8888-4888-8888-888888888888'
);

insert into public.recipes (
  id,
  title,
  description,
  prep_time_minutes,
  servings_base,
  tags,
  season,
  calories,
  proteins_g,
  carbs_g,
  fats_g,
  steps,
  is_active
) values
(
  '11111111-1111-4111-8111-111111111111',
  'Pates completes aux courgettes et ricotta',
  'Un plat familial rapide, cremeux sans etre lourd, parfait pour un soir de semaine.',
  25,
  4,
  array['vegetarian', 'quick', 'family'],
  array['spring', 'summer'],
  540,
  22,
  72,
  18,
  '[{"step":1,"instruction":"Cuire les pates dans une grande casserole d eau salee."},{"step":2,"instruction":"Faire revenir les courgettes en demi-lunes avec l ail et l huile d olive."},{"step":3,"instruction":"Melanger la ricotta avec un peu d eau de cuisson, le citron et le parmesan."},{"step":4,"instruction":"Assembler les pates, les courgettes et la sauce, puis servir avec du basilic."}]',
  true
),
(
  '22222222-2222-4222-8222-222222222222',
  'Poulet au four, grenailles et carottes',
  'Une plaque complete au four avec peu de vaisselle et des legumes bien rotis.',
  45,
  4,
  array['family', 'high_protein', 'gluten_free'],
  array['autumn', 'winter'],
  610,
  43,
  48,
  24,
  '[{"step":1,"instruction":"Prechauffer le four a 200 degres."},{"step":2,"instruction":"Couper les carottes et melanger les legumes avec l huile, le thym et le paprika."},{"step":3,"instruction":"Ajouter les cuisses de poulet sur la plaque et enfourner."},{"step":4,"instruction":"Retourner a mi-cuisson et servir quand le poulet est dore."}]',
  true
),
(
  '33333333-3333-4333-8333-333333333333',
  'Curry de pois chiches aux epinards',
  'Un curry vegetal doux, nourrissant, pratique pour le batch cooking.',
  30,
  4,
  array['vegan', 'vegetarian', 'gluten_free', 'batch_cooking'],
  array['autumn', 'winter', 'spring'],
  480,
  18,
  58,
  19,
  '[{"step":1,"instruction":"Faire revenir l oignon, l ail et le gingembre dans l huile."},{"step":2,"instruction":"Ajouter la pate de curry, les pois chiches et les tomates concassees."},{"step":3,"instruction":"Laisser mijoter puis ajouter le lait de coco et les epinards."},{"step":4,"instruction":"Servir avec du riz et un trait de citron vert."}]',
  true
),
(
  '44444444-4444-4444-8444-444444444444',
  'Saumon laque, riz et brocoli',
  'Un bol simple avec saumon fondant, sauce soja-miel et brocoli croquant.',
  30,
  4,
  array['quick', 'high_protein'],
  array['spring', 'winter'],
  590,
  38,
  62,
  20,
  '[{"step":1,"instruction":"Cuire le riz selon les indications du paquet."},{"step":2,"instruction":"Melanger sauce soja, miel, ail et citron pour la laque."},{"step":3,"instruction":"Cuire le saumon a la poele puis napper de sauce."},{"step":4,"instruction":"Cuire le brocoli vapeur et dresser les bols."}]',
  true
),
(
  '55555555-5555-4555-8555-555555555555',
  'Salade tiede de lentilles, feta et betterave',
  'Une assiette vegetarienne coloree qui tient bien au corps sans alourdir.',
  20,
  4,
  array['vegetarian', 'quick', 'gluten_free', 'light'],
  array['autumn', 'winter'],
  430,
  21,
  42,
  18,
  '[{"step":1,"instruction":"Rincer et rechauffer les lentilles cuites."},{"step":2,"instruction":"Couper les betteraves en des et emincer l oignon rouge."},{"step":3,"instruction":"Preparer une vinaigrette moutarde, vinaigre et huile d olive."},{"step":4,"instruction":"Assembler avec la feta, le persil et les noix."}]',
  true
),
(
  '66666666-6666-4666-8666-666666666666',
  'Omelette aux champignons et salade croquante',
  'Un repas express du soir, economique, avec des proteines et beaucoup de fraicheur.',
  18,
  4,
  array['vegetarian', 'quick', 'gluten_free'],
  array['autumn', 'winter', 'spring'],
  390,
  24,
  14,
  27,
  '[{"step":1,"instruction":"Faire revenir les champignons tranches dans une poele chaude."},{"step":2,"instruction":"Battre les oeufs avec le lait, le sel et le poivre."},{"step":3,"instruction":"Verser les oeufs et cuire doucement jusqu a prise."},{"step":4,"instruction":"Servir avec une salade de concombre et radis."}]',
  true
),
(
  '77777777-7777-4777-8777-777777777777',
  'Boulettes de dinde sauce tomate et polenta',
  'Un plat reconfortant, riche en proteines, facile a rechauffer le lendemain.',
  40,
  4,
  array['family', 'high_protein', 'batch_cooking'],
  array['autumn', 'winter'],
  620,
  42,
  56,
  22,
  '[{"step":1,"instruction":"Melanger la dinde hachee avec chapelure, oeuf, ail et herbes."},{"step":2,"instruction":"Former les boulettes et les dorer a la poele."},{"step":3,"instruction":"Ajouter la sauce tomate et laisser mijoter."},{"step":4,"instruction":"Cuire la polenta et servir avec du parmesan."}]',
  true
),
(
  '88888888-8888-4888-8888-888888888888',
  'Tacos haricots noirs, avocat et chou rouge',
  'Des tacos vegetariens frais et rapides, parfaits pour un repas convivial.',
  25,
  4,
  array['vegetarian', 'quick', 'family'],
  array['spring', 'summer'],
  510,
  17,
  68,
  19,
  '[{"step":1,"instruction":"Rechauffer les haricots noirs avec cumin, paprika et un peu de tomate."},{"step":2,"instruction":"Emincer le chou rouge et l assaisonner au citron vert."},{"step":3,"instruction":"Ecraser l avocat avec sel, citron vert et coriandre."},{"step":4,"instruction":"Garnir les tortillas avec les haricots, le chou, l avocat et le yaourt."}]',
  true
)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  prep_time_minutes = excluded.prep_time_minutes,
  servings_base = excluded.servings_base,
  tags = excluded.tags,
  season = excluded.season,
  calories = excluded.calories,
  proteins_g = excluded.proteins_g,
  carbs_g = excluded.carbs_g,
  fats_g = excluded.fats_g,
  steps = excluded.steps,
  is_active = excluded.is_active;

insert into public.ingredients (recipe_id, name, quantity, unit, grocery_category) values
('11111111-1111-4111-8111-111111111111', 'Pates completes', 360, 'g', 'epicerie'),
('11111111-1111-4111-8111-111111111111', 'Courgettes', 3, 'piece', 'legumes'),
('11111111-1111-4111-8111-111111111111', 'Ricotta', 250, 'g', 'produits laitiers'),
('11111111-1111-4111-8111-111111111111', 'Parmesan', 50, 'g', 'produits laitiers'),
('11111111-1111-4111-8111-111111111111', 'Citron', 1, 'piece', 'fruits'),
('11111111-1111-4111-8111-111111111111', 'Basilic', 0.5, 'botte', 'legumes'),

('22222222-2222-4222-8222-222222222222', 'Cuisses de poulet', 4, 'piece', 'viandes'),
('22222222-2222-4222-8222-222222222222', 'Pommes de terre grenailles', 800, 'g', 'legumes'),
('22222222-2222-4222-8222-222222222222', 'Carottes', 600, 'g', 'legumes'),
('22222222-2222-4222-8222-222222222222', 'Huile d olive', 3, 'c. a soupe', 'epicerie'),
('22222222-2222-4222-8222-222222222222', 'Thym', 1, 'c. a cafe', 'epicerie'),

('33333333-3333-4333-8333-333333333333', 'Pois chiches cuits', 500, 'g', 'epicerie'),
('33333333-3333-4333-8333-333333333333', 'Epinards', 250, 'g', 'legumes'),
('33333333-3333-4333-8333-333333333333', 'Tomates concassees', 400, 'g', 'epicerie'),
('33333333-3333-4333-8333-333333333333', 'Lait de coco', 250, 'ml', 'epicerie'),
('33333333-3333-4333-8333-333333333333', 'Riz basmati', 280, 'g', 'epicerie'),
('33333333-3333-4333-8333-333333333333', 'Oignon', 1, 'piece', 'legumes'),

('44444444-4444-4444-8444-444444444444', 'Paves de saumon', 4, 'piece', 'poissons'),
('44444444-4444-4444-8444-444444444444', 'Riz jasmin', 280, 'g', 'epicerie'),
('44444444-4444-4444-8444-444444444444', 'Brocoli', 600, 'g', 'legumes'),
('44444444-4444-4444-8444-444444444444', 'Sauce soja', 4, 'c. a soupe', 'epicerie'),
('44444444-4444-4444-8444-444444444444', 'Miel', 2, 'c. a soupe', 'epicerie'),
('44444444-4444-4444-8444-444444444444', 'Citron', 1, 'piece', 'fruits'),

('55555555-5555-4555-8555-555555555555', 'Lentilles cuites', 500, 'g', 'epicerie'),
('55555555-5555-4555-8555-555555555555', 'Betteraves cuites', 400, 'g', 'legumes'),
('55555555-5555-4555-8555-555555555555', 'Feta', 180, 'g', 'produits laitiers'),
('55555555-5555-4555-8555-555555555555', 'Oignon rouge', 1, 'piece', 'legumes'),
('55555555-5555-4555-8555-555555555555', 'Noix', 60, 'g', 'epicerie'),
('55555555-5555-4555-8555-555555555555', 'Persil', 0.5, 'botte', 'legumes'),

('66666666-6666-4666-8666-666666666666', 'Oeufs', 8, 'piece', 'produits laitiers'),
('66666666-6666-4666-8666-666666666666', 'Champignons', 400, 'g', 'legumes'),
('66666666-6666-4666-8666-666666666666', 'Lait', 80, 'ml', 'produits laitiers'),
('66666666-6666-4666-8666-666666666666', 'Concombre', 1, 'piece', 'legumes'),
('66666666-6666-4666-8666-666666666666', 'Radis', 1, 'botte', 'legumes'),

('77777777-7777-4777-8777-777777777777', 'Dinde hachee', 600, 'g', 'viandes'),
('77777777-7777-4777-8777-777777777777', 'Chapelure', 60, 'g', 'epicerie'),
('77777777-7777-4777-8777-777777777777', 'Oeuf', 1, 'piece', 'produits laitiers'),
('77777777-7777-4777-8777-777777777777', 'Sauce tomate', 600, 'g', 'epicerie'),
('77777777-7777-4777-8777-777777777777', 'Polenta', 250, 'g', 'epicerie'),
('77777777-7777-4777-8777-777777777777', 'Parmesan', 50, 'g', 'produits laitiers'),

('88888888-8888-4888-8888-888888888888', 'Tortillas', 8, 'piece', 'boulangerie'),
('88888888-8888-4888-8888-888888888888', 'Haricots noirs', 500, 'g', 'epicerie'),
('88888888-8888-4888-8888-888888888888', 'Avocats', 2, 'piece', 'fruits'),
('88888888-8888-4888-8888-888888888888', 'Chou rouge', 300, 'g', 'legumes'),
('88888888-8888-4888-8888-888888888888', 'Yaourt grec', 150, 'g', 'produits laitiers'),
('88888888-8888-4888-8888-888888888888', 'Citron vert', 2, 'piece', 'fruits');

insert into public.weekly_selection (week_start_date, recipe_id)
select date_trunc('week', current_date)::date, recipe_id
from (
  values
    ('11111111-1111-4111-8111-111111111111'::uuid),
    ('22222222-2222-4222-8222-222222222222'::uuid),
    ('33333333-3333-4333-8333-333333333333'::uuid),
    ('44444444-4444-4444-8444-444444444444'::uuid),
    ('55555555-5555-4555-8555-555555555555'::uuid),
    ('66666666-6666-4666-8666-666666666666'::uuid),
    ('77777777-7777-4777-8777-777777777777'::uuid),
    ('88888888-8888-4888-8888-888888888888'::uuid)
) as seeded(recipe_id)
on conflict (week_start_date, recipe_id) do nothing;
