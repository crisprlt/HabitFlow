-- Script para poblar las tablas de opciones con datos iniciales

-- Insertar unidades de medida
INSERT INTO unidad_medida (descripcion) VALUES
('veces'),
('minutos'),
('horas'),
('kilómetros'),
('metros'),
('libros'),
('páginas'),
('vasos'),
('comidas'),
('días');

-- Insertar categorías
INSERT INTO categoria (descripcion) VALUES
('Salud y Fitness'),
('Educación'),
('Productividad'),
('Bienestar'),
('Hobbies'),
('Trabajo'),
('Finanzas'),
('Social'),
('Hogar'),
('Desarrollo Personal');

-- Insertar frecuencias
INSERT INTO frecuencia (descripcion) VALUES
('Diario'),
('Semanal'),
('Mensual'),
('Cada 2 días'),
('Cada 3 días'),
('Lunes a Viernes'),
('Fines de semana'),
('Una vez por semana'),
('Dos veces por semana'),
('Tres veces por semana');

-- Insertar metas
INSERT INTO meta (cantidad, id_unidad_medida) VALUES
(1, 1),    -- 1 vez
(2, 1),    -- 2 veces
(3, 1),    -- 3 veces
(5, 1),    -- 5 veces
(10, 1),   -- 10 veces
(15, 2),   -- 15 minutos
(30, 2),   -- 30 minutos
(45, 2),   -- 45 minutos
(60, 2),   -- 1 hora
(90, 2),   -- 1.5 horas
(120, 2),  -- 2 horas
(5, 3),    -- 5 km
(10, 3),   -- 10 km
(1, 6),    -- 1 libro
(10, 7),   -- 10 páginas
(20, 7),   -- 20 páginas
(50, 7),   -- 50 páginas
(100, 7),  -- 100 páginas
(8, 8),    -- 8 vasos
(3, 9),    -- 3 comidas
(7, 10);   -- 7 días
