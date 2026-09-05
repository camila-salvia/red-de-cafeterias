#!/bin/bash
# Script para verificar datos en la BD

echo "=== CATEGORÍAS ==="
mysql -u root -pmari2003 -h localhost cafeteria -e "SELECT id, nombre FROM categoria;"

echo ""
echo "=== PRODUCTOS Y SUS CATEGORÍAS ==="
mysql -u root -pmari2003 -h localhost cafeteria -e "SELECT p.nombre, p.id, c.nombre as categoria FROM producto p LEFT JOIN categoria c ON p.id_categoria = c.id ORDER BY p.nombre;"

echo ""
echo "=== PRODUCTOS DUPLICADOS ==="
mysql -u root -pmari2003 -h localhost cafeteria -e "SELECT nombre, COUNT(*) as cantidad FROM producto GROUP BY nombre HAVING cantidad > 1;"

echo ""
echo "=== BÚSQUEDA: cafe cortado ==="
mysql -u root -pmari2003 -h localhost cafeteria -e "SELECT nombre FROM producto WHERE LOWER(nombre) LIKE '%cafe%cortado%' OR LOWER(nombre) LIKE '%cortado%';"

echo ""
echo "=== BÚSQUEDA: lemon pie ==="
mysql -u root -pmari2003 -h localhost cafeteria -e "SELECT nombre, id_categoria FROM producto WHERE LOWER(nombre) LIKE '%lemon%' OR LOWER(nombre) LIKE '%pie%';"
