-- Script SQL pour initialiser la base de données StockFlow Pro
-- Ce script peut être utilisé pour créer des données de test

-- Insertion de catégories par défaut
INSERT INTO categories (name, description, created_at) VALUES
('Électronique', 'Produits électroniques', NOW()),
('Informatique', 'Équipements informatiques', NOW()),
('Mobilier', 'Mobilier de bureau et maison', NOW()),
('Alimentaire', 'Produits alimentaires', NOW()),
('Vêtements', 'Vêtements et accessoires', NOW()),
('Fournitures', 'Fournitures de bureau', NOW());
