import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/mysql.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  genero: {
    type: DataTypes.ENUM('Masculino', 'Femenino', 'Otro'),
    allowNull: true
  },
  altura_cm: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  peso_kg: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  nivel_experiencia: {
    type: DataTypes.ENUM('Principiante', 'Intermedio', 'Avanzado'),
    allowNull: true
  },
  objetivo_principal: {
    type: DataTypes.STRING,
    allowNull: true
  },
  onboarding_completado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'usuarios',
  timestamps: true
});

export default User;
