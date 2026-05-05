import dotenv from 'dotenv';
import app from './app.js';
import { sequelize, connectMySQL } from './config/mysql.js';
import connectMongoDB from './config/mongodb.js';
import './models/mysql/index.js';

dotenv.config();

const startServer = async () => {
  try {
    await connectMySQL();
    await connectMongoDB();

    await sequelize.sync({ force: false });
    console.log('Tablas de MySQL sincronizadas');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 FitTrack Server listo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error crítico al arrancar el servidor:', error);
  }
};

startServer();
