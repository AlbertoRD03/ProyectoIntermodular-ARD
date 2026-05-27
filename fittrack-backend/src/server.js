import dotenv from 'dotenv';
import app from './app.js';
import connectMongoDB from './config/mongodb.js';

dotenv.config();

const startServer = async () => {
  try {
    const enableMySQL = String(process.env.ENABLE_MYSQL || '').toLowerCase() === 'true';
    const hasMongoUri = Boolean(String(process.env.MONGO_URI || '').trim());
    const hasJwtSecret = Boolean(String(process.env.JWT_SECRET || '').trim());
    const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';

    if (enableMySQL) {
      const { sequelize, connectMySQL } = await import('./config/mysql.js');
      await import('./models/mysql/index.js');

      await connectMySQL();
      await sequelize.sync({ force: false });
      console.log('Tablas de MySQL sincronizadas');
    } else {
      console.log('MySQL desactivado (setea ENABLE_MYSQL=true para activarlo).');
    }

    if (isProd && !hasJwtSecret) {
      throw new Error('JWT_SECRET no configurado: define JWT_SECRET en Render para poder iniciar sesión.');
    }

    if (!enableMySQL && !hasMongoUri && isProd) {
      throw new Error('MongoDB no configurado: define MONGO_URI en Render o activa MySQL con ENABLE_MYSQL=true.');
    }

    await connectMongoDB();

    const rawPort = process.env.PORT;
    console.log(
      `DEBUG: NODE_ENV=${process.env.NODE_ENV || 'undefined'} PORT=${rawPort || 'undefined'}`
    );

    const port =
      rawPort && rawPort.trim() !== ''
        ? Number.parseInt(rawPort, 10)
        : process.env.NODE_ENV === 'production'
          ? undefined
          : 3000;

    if (port === undefined) {
      throw new Error('🚨 PORT no definido. Render requiere que la app escuche en process.env.PORT.');
    }
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
      throw new Error(
        `🚨 PORT inválido (${JSON.stringify(rawPort)}). En Render no definas PORT manualmente; deja que Render inyecte PORT automáticamente.`
      );
    }

    app.listen(port, () => {
      console.log(`🚀 FitTrack Server listo en puerto ${port}`);
    });
  } catch (error) {
    console.error('Error crítico al arrancar el servidor:', error);
    if (String(process.env.NODE_ENV || '').toLowerCase() === 'production') {
      process.exit(1);
    }
  }
};

startServer();
