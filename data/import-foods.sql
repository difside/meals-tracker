-- Step 1: Add saturated_fat and trans_fat columns to foods table
ALTER TABLE foods ADD COLUMN IF NOT EXISTS saturated_fat numeric DEFAULT 0;
ALTER TABLE foods ADD COLUMN IF NOT EXISTS trans_fat      numeric DEFAULT 0;

-- Step 2: Insert all Saudi local products (shared, no user_id = visible to everyone)
-- These are seeded as global foods; user_id is left NULL so RLS SELECT policy still allows all users to read them.
-- If your SELECT policy requires auth.uid() IS NOT NULL, use a service-role key to run this.

INSERT INTO foods (id, user_id, name, serving_size, serving_unit, calories, protein, carbs, fat, saturated_fat, trans_fat) VALUES
-- Almarai Dairy
  (gen_random_uuid()::text, NULL, 'Almarai Fresh Full Fat Milk',        100, 'ml', 61,  3.1,  4.8,  3.3,  2.1,  0.1),
  (gen_random_uuid()::text, NULL, 'Almarai Fresh Low Fat Milk',         100, 'ml', 41,  3.4,  5.0,  1.5,  0.9,  0.0),
  (gen_random_uuid()::text, NULL, 'Almarai Fresh Full Fat Laban',       100, 'ml', 60,  3.0,  4.7,  3.3,  2.0,  0.0),
  (gen_random_uuid()::text, NULL, 'Almarai Fresh Low Fat Laban',        100, 'ml', 40,  3.2,  4.7,  1.1,  0.7,  0.0),
  (gen_random_uuid()::text, NULL, 'Almarai Full Fat Yogurt',            100, 'g',  100, 5.3,  8.0,  5.1,  3.3,  0.0),
  (gen_random_uuid()::text, NULL, 'Almarai Low Fat Yogurt',             100, 'g',  57,  4.6,  7.0,  1.1,  0.8,  0.0),
  (gen_random_uuid()::text, NULL, 'Almarai Skimmed Yogurt',             100, 'g',  58,  7.8,  6.5,  0.1,  0.1,  0.0),
  (gen_random_uuid()::text, NULL, 'Almarai Greek Style Yogurt (Plain)', 100, 'g',  94,  10.0, 4.5,  4.5,  3.0,  0.0),
  (gen_random_uuid()::text, NULL, 'Almarai Cream Cheese',               100, 'g',  333, 7.0,  2.0,  33.0, 21.0, 0.0),
  (gen_random_uuid()::text, NULL, 'Almarai Spreadable Cream Cheese',    100, 'g',  250, 8.0,  3.5,  23.0, 15.0, 0.0),
  (gen_random_uuid()::text, NULL, 'Almarai Cheddar Cheese Slices',      100, 'g',  305, 18.5, 0.5,  25.5, 16.5, 0.5),
  (gen_random_uuid()::text, NULL, 'Almarai Processed Cheese (Wedge)',   100, 'g',  290, 13.0, 4.5,  24.0, 15.0, 0.0),
  (gen_random_uuid()::text, NULL, 'Almarai Unsalted Butter',            100, 'g',  717, 0.9,  0.1,  81.0, 51.0, 2.0),
  (gen_random_uuid()::text, NULL, 'Almarai Whipping Cream',             100, 'ml', 330, 2.5,  4.0,  35.0, 22.0, 0.5),
-- Nadec Dairy
  (gen_random_uuid()::text, NULL, 'Nadec Full Fat Milk',                100, 'ml', 60,  3.1,  4.7,  3.1,  2.0,  0.1),
  (gen_random_uuid()::text, NULL, 'Nadec Low Fat Milk',                 100, 'ml', 38,  3.4,  4.8,  1.0,  0.6,  0.0),
  (gen_random_uuid()::text, NULL, 'Nadec Full Fat Laban',               100, 'ml', 58,  3.0,  4.5,  3.0,  1.9,  0.0),
  (gen_random_uuid()::text, NULL, 'Nadec Full Fat Yogurt',              100, 'g',  99,  4.8,  8.5,  5.0,  3.2,  0.0),
  (gen_random_uuid()::text, NULL, 'Nadec Low Fat Yogurt',               100, 'g',  57,  5.0,  7.0,  1.0,  0.6,  0.0),
-- NADA Dairy
  (gen_random_uuid()::text, NULL, 'NADA Full Fat Milk',                 100, 'ml', 62,  3.1,  4.8,  3.5,  2.2,  0.0),
  (gen_random_uuid()::text, NULL, 'NADA Low Fat Milk',                  100, 'ml', 40,  3.4,  4.9,  1.0,  0.6,  0.0),
  (gen_random_uuid()::text, NULL, 'NADA Protein Milk (Plain)',          100, 'ml', 57,  9.0,  5.0,  0.1,  0.1,  0.0),
-- Al Safi Dairy
  (gen_random_uuid()::text, NULL, 'Al Safi Full Fat Milk',              100, 'ml', 63,  3.2,  4.9,  3.6,  2.3,  0.1),
  (gen_random_uuid()::text, NULL, 'Al Safi Low Fat Milk',               100, 'ml', 43,  3.5,  5.0,  1.5,  1.0,  0.0),
-- Americana
  (gen_random_uuid()::text, NULL, 'Americana Chicken Strips',           100, 'g',  200, 16.0, 12.0, 9.4,  2.5,  0.0),
  (gen_random_uuid()::text, NULL, 'Americana Chicken Nuggets',          100, 'g',  255, 14.0, 17.0, 14.0, 3.5,  0.0),
  (gen_random_uuid()::text, NULL, 'Americana Beef Meatballs',           100, 'g',  220, 14.0, 6.0,  16.0, 7.0,  0.3),
  (gen_random_uuid()::text, NULL, 'Americana Beef Burger Patties',      100, 'g',  247, 17.0, 1.0,  19.5, 8.5,  0.5),
  (gen_random_uuid()::text, NULL, 'Americana Chicken Burger',           100, 'g',  195, 15.0, 12.0, 8.0,  2.0,  0.0),
  (gen_random_uuid()::text, NULL, 'Americana Chicken Franks',           100, 'g',  210, 12.5, 4.0,  16.5, 5.0,  0.0),
-- Al Kabeer
  (gen_random_uuid()::text, NULL, 'Al Kabeer Chicken Seekh Kabab',      100, 'g',  142, 14.8, 2.8,  7.8,  2.2,  0.0),
  (gen_random_uuid()::text, NULL, 'Al Kabeer Beef Seekh Kabab',         100, 'g',  185, 12.0, 5.0,  13.0, 5.5,  0.3),
  (gen_random_uuid()::text, NULL, 'Al Kabeer Mutton Seekh Kabab',       100, 'g',  210, 13.0, 4.0,  16.0, 7.0,  0.3),
  (gen_random_uuid()::text, NULL, 'Al Kabeer Chicken Nuggets',          100, 'g',  249, 13.0, 19.0, 13.0, 3.0,  0.0),
  (gen_random_uuid()::text, NULL, 'Al Kabeer Chicken Burger (Breaded)', 100, 'g',  195, 12.5, 14.0, 9.0,  2.3,  0.0),
-- Herfy
  (gen_random_uuid()::text, NULL, 'Herfy Chicken Burger (Breaded)',     100, 'g',  200, 13.0, 13.0, 10.5, 2.5,  0.0),
  (gen_random_uuid()::text, NULL, 'Herfy Beef Burger Patties',          100, 'g',  240, 16.0, 2.0,  19.0, 8.5,  0.5),
-- Seara / Sadia
  (gen_random_uuid()::text, NULL, 'Seara Chicken Franks',               100, 'g',  195, 13.0, 3.5,  15.0, 4.5,  0.0),
  (gen_random_uuid()::text, NULL, 'Sadia Chicken Breast (Frozen)',      100, 'g',  88,  20.0, 0.0,  1.0,  0.3,  0.0),
  (gen_random_uuid()::text, NULL, 'Sadia Chicken Thighs (Frozen)',      100, 'g',  165, 18.0, 0.0,  10.0, 3.0,  0.0),
-- L'usine Bakery
  (gen_random_uuid()::text, NULL, 'L''usine White Sliced Bread',        100, 'g',  264, 8.8,  49.0, 4.0,  0.9,  0.0),
  (gen_random_uuid()::text, NULL, 'L''usine Brown Multigrain Bread',    100, 'g',  273, 10.0, 42.0, 6.6,  1.0,  0.0),
  (gen_random_uuid()::text, NULL, 'L''usine White Toast',               100, 'g',  305, 10.0, 55.0, 5.5,  1.2,  0.0),
  (gen_random_uuid()::text, NULL, 'L''usine Croissant',                 100, 'g',  400, 8.0,  45.0, 21.0, 12.0, 0.5),
-- Sunbulah
  (gen_random_uuid()::text, NULL, 'Sunbulah Konafah Dough (Frozen)',    100, 'g',  194, 5.0,  40.0, 2.0,  0.5,  0.0),
  (gen_random_uuid()::text, NULL, 'Sunbulah Puff Pastry Sheets',        100, 'g',  480, 7.0,  41.0, 32.0, 8.0,  0.0),
  (gen_random_uuid()::text, NULL, 'Sunbulah Molokhia (Frozen)',         100, 'g',  41,  3.5,  3.0,  1.8,  0.4,  0.0),
  (gen_random_uuid()::text, NULL, 'Sunbulah Fava Beans (Frozen)',       100, 'g',  62,  5.5,  8.5,  0.5,  0.1,  0.0),
-- Freshly Bakery
  (gen_random_uuid()::text, NULL, 'Freshly Whole Wheat Bread',          100, 'g',  246, 10.4, 42.5, 4.2,  0.7,  0.0),
  (gen_random_uuid()::text, NULL, 'Freshly White Sandwich Bread',       100, 'g',  268, 9.0,  50.0, 4.5,  1.0,  0.0),
-- Afia Oils
  (gen_random_uuid()::text, NULL, 'Afia Sunflower Oil',                 100, 'ml', 884, 0.0,  0.0,  100.0,12.0, 0.0),
  (gen_random_uuid()::text, NULL, 'Afia Corn Oil',                      100, 'ml', 884, 0.0,  0.0,  100.0,14.0, 0.0),
  (gen_random_uuid()::text, NULL, 'Afia Olive Oil',                     100, 'ml', 884, 0.0,  0.0,  100.0,14.0, 0.0),
-- Saudi Date Varieties
  (gen_random_uuid()::text, NULL, 'Ajwa Dates (Al-Madinah)',            100, 'g',  282, 2.5,  75.0, 0.4,  0.0,  0.0),
  (gen_random_uuid()::text, NULL, 'Medjool Dates',                      100, 'g',  277, 1.8,  75.0, 0.2,  0.0,  0.0),
  (gen_random_uuid()::text, NULL, 'Sukari Dates',                       100, 'g',  289, 2.2,  76.0, 0.3,  0.0,  0.0),
  (gen_random_uuid()::text, NULL, 'Khalas Dates',                       100, 'g',  274, 2.1,  73.5, 0.3,  0.0,  0.0),
  (gen_random_uuid()::text, NULL, 'Safawi Dates',                       100, 'g',  280, 2.3,  74.0, 0.4,  0.0,  0.0),
-- Traditional Saudi & Middle Eastern Foods
  (gen_random_uuid()::text, NULL, 'Hummus (Traditional)',               100, 'g',  166, 7.9,  14.3, 9.6,  1.3,  0.0),
  (gen_random_uuid()::text, NULL, 'Tahini (Sesame Paste)',              100, 'g',  595, 17.0, 21.2, 53.8, 7.5,  0.0),
  (gen_random_uuid()::text, NULL, 'Falafel (Fried)',                    100, 'g',  333, 13.3, 31.8, 17.8, 2.2,  0.0),
  (gen_random_uuid()::text, NULL, 'Chicken Shawarma (Meat Only)',       100, 'g',  195, 16.0, 10.0, 10.0, 2.0,  0.0),
  (gen_random_uuid()::text, NULL, 'Meat Shawarma (Beef/Veal)',          100, 'g',  220, 15.0, 6.0,  15.0, 4.5,  0.2),
  (gen_random_uuid()::text, NULL, 'Kabsa (Chicken & Rice)',             100, 'g',  175, 12.0, 18.0, 6.0,  1.5,  0.0),
  (gen_random_uuid()::text, NULL, 'Mandi (Lamb & Rice)',                100, 'g',  190, 14.0, 17.0, 7.0,  2.5,  0.0),
  (gen_random_uuid()::text, NULL, 'Jareesh (Cracked Wheat)',            100, 'g',  142, 5.5,  26.5, 2.5,  1.0,  0.0),
  (gen_random_uuid()::text, NULL, 'Arabic Flatbread (Khubz)',           100, 'g',  275, 9.0,  56.0, 1.5,  0.3,  0.0),
  (gen_random_uuid()::text, NULL, 'Samosa – Chicken (Fried)',           100, 'g',  292, 10.0, 28.0, 16.0, 4.0,  0.0),
  (gen_random_uuid()::text, NULL, 'Samosa – Vegetable (Fried)',         100, 'g',  265, 5.0,  32.0, 13.0, 2.5,  0.0),
  (gen_random_uuid()::text, NULL, 'Mutabbal / Baba Ghanoush',           100, 'g',  92,  2.6,  8.6,  5.5,  0.8,  0.0),
  (gen_random_uuid()::text, NULL, 'Ouzi (Lamb with Rice)',              100, 'g',  195, 13.5, 18.0, 7.5,  2.8,  0.0),
  (gen_random_uuid()::text, NULL, 'Macarona Béchamel',                  100, 'g',  175, 8.5,  18.5, 7.5,  3.5,  0.0),
  (gen_random_uuid()::text, NULL, 'Masoob (Bread & Banana Dessert)',    100, 'g',  310, 7.5,  45.0, 12.5, 6.5,  0.0),
  (gen_random_uuid()::text, NULL, 'Ful Medames (Fava Bean Stew)',       100, 'g',  110, 7.6,  14.0, 2.8,  0.5,  0.0),
  (gen_random_uuid()::text, NULL, 'White Rice (Cooked)',                100, 'g',  130, 2.7,  28.2, 0.3,  0.1,  0.0),
  (gen_random_uuid()::text, NULL, 'Basmati Rice (Cooked)',              100, 'g',  121, 3.5,  25.2, 0.4,  0.1,  0.0),
  (gen_random_uuid()::text, NULL, 'Margarine (Generic)',                100, 'g',  717, 0.1,  0.5,  79.0, 20.0, 2.0)
ON CONFLICT (id) DO NOTHING;
