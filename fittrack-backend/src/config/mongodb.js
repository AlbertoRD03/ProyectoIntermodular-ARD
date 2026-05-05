import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB: Conectado en el host: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB Error post-conexión:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB: Desconectado. Intentando reconectar...');
    });
  } catch (error) {
    console.error('MongoDB: Error de conexión inicial:', error.message);
    process.exit(1);
  }
};

export default connectMongoDB;
