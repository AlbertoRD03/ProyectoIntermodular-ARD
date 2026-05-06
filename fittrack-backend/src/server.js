import dotenv from 'dotenv';
import app from './app.js';
import connectMongoDB from './config/mongodb.js';

dotenv.config();

const startServer = async () => {
  try {
    const enableMySQL = String(process.env.ENABLE_MYSQL || '').toLowerCase() === 'true';

    if (enableMySQL) {
      const { sequelize, connectMySQL } = await import('./config/mysql.js');
      await import('./models/mysql/index.js');

      await connectMySQL();
      await sequelize.sync({ force: false });
      console.log('Tablas de MySQL sincronizadas');
    } else {
      console.log('MySQL desactivado (setea ENABLE_MYSQL=true para activarlo).');
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
  }
};

startServer();
