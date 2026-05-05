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

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 FitTrack Server listo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error crítico al arrancar el servidor:', error);
  }
};

startServer();
