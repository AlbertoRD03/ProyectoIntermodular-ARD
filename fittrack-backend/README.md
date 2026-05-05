## FitTrack Backend

### MySQL en despliegues (Vercel)

- Por defecto, el backend **no carga MySQL** salvo que se active `ENABLE_MYSQL=true`.
- Los endpoints que dependen de MySQL devuelven `503` cuando MySQL está desactivado.

Configura `ENABLE_MYSQL=true` (y `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) solo si vas a usar MySQL en ese entorno.
