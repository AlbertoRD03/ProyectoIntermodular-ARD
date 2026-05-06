# Guía de Deployment en Render

## Paso 1: Configurar Variables de Entorno en Render

En el dashboard de Render, ve a tu servicio y abre la sección **Environment**.

Añade las siguientes variables:

### Requerida
- **`MONGO_URI`**: URI de conexión a MongoDB
  ```
  mongodb+srv://usuario:contraseña@cluster.mongodb.net/fittrack?retryWrites=true&w=majority
  ```

### Opcionales
- **`NODE_ENV`**: Entorno de ejecución
  ```
  production
  ```
- **`JWT_SECRET`**: Clave secreta para JWT (⚠️ **MUY IMPORTANTE**: usar un valor seguro y largo)
  ```
  tu_jwt_secret_muy_seguro_y_largo_cambiar_en_produccion
  ```

### Si usas MySQL
- **`ENABLE_MYSQL`**: Activar MySQL (por defecto: false)
  ```
  true
  ```
- **`MYSQL_HOST`**: Host de MySQL
- **`MYSQL_USER`**: Usuario de MySQL
- **`MYSQL_PASSWORD`**: Contraseña de MySQL
- **`MYSQL_DATABASE`**: Nombre de la base de datos
- **`MYSQL_PORT`**: Puerto de MySQL (por defecto: 3306)

## Paso 2: Configurar Build & Start Commands

En **Build Command**:
```bash
npm ci
```

En **Start Command** (ya debería estar configurado):
```bash
npm start
```

## Importante: NO configurar `PORT` en Render

Render **inyecta** la variable `PORT` automáticamente en cada deploy y tu app debe escuchar en `process.env.PORT`.

- No añadas `PORT` manualmente en **Environment** (si la defines tú, puedes romper el routing de Render).
- Si ya la tienes definida, elimínala y vuelve a desplegar.

## Paso 3: Conectar MongoDB

Si aún no tienes MongoDB:

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito (M0)
3. Crea un usuario en Database Access
4. Ve a Connect → Connect your application
5. Copia la URI (reemplaza `<password>` con tu contraseña)

## Verificación

Una vez deployed, deberías ver en los logs:
```
✅ MongoDB: Conectado en el host: cluster0.xxxxx.mongodb.net
🚀 FitTrack Server listo en puerto <puerto_asignado_por_Render>
```

## Troubleshooting

### Error: "MONGO_URI must be a string"
→ Asegúrate de que la variable `MONGO_URI` esté configurada en Render

### Error: "Authentication failed"
→ Verifica que la contraseña en `MONGO_URI` sea correcta y esté URL-encoded

### Error: "Timeout connecting to MongoDB"
→ Verifica que tu IP esté allowlisted en MongoDB Atlas Network Access

### El servidor inicia pero sin conectar a MongoDB
→ Es normal. MongoDB es opcional y el servidor funcionará sin ella (solo con MySQL si está habilitado)

## Monitoreo

Usa [MongoDB Atlas](https://cloud.mongodb.com) para monitorear la conexión y las métricas en tiempo real.
