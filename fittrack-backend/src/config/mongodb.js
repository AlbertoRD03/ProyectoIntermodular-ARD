import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectMongoDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn(
      '⚠️  MongoDB desactivado: MONGO_URI no está definida. ' +
      'Para activar MongoDB, configura la variable de entorno MONGO_URI.'
    );
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB: Conectado en el host: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB Error post-conexión:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB: Desconectado. Intentando reconectar...');
    });
  } catch (error) {
    console.error('❌ MongoDB: Error de conexión inicial:', error.message);
    console.error('Verifica que MONGO_URI sea válida y que MongoDB esté accesible.');
    process.exit(1);
  }
};

export default connectMongoDB;
