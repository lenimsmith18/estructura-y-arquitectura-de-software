-- MICROSERVICIOS — "Database per service".
-- Un solo servidor PostgreSQL para simplificar la demo, pero cada microservicio
-- tiene su PROPIA base de datos y nunca accede a la de otro servicio.
-- (Las tablas las crea cada servicio al arrancar: es dueño de su esquema.)
CREATE DATABASE empleados_db;
CREATE DATABASE asistencia_db;
CREATE DATABASE reportes_db;
