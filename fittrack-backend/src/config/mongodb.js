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
    // Fail fast instead of buffering operations for ~10s when Mongo isn't reachable.
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

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
    if (/authentication failed|bad auth/i.test(String(error?.message || ''))) {
      console.error(
        'Pista: revisa usuario/contraseña en Atlas. Si la contraseña tiene caracteres especiales, debe ir URL-encoded (por ejemplo @ => %40).'
      );
    }
    // In development, allow the server to boot so other routes/middleware can be worked on.
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return;
  }
};

export default connectMongoDB;
