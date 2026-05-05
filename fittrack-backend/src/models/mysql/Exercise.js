import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/mysql.js';

const Exercise = sequelize.define('Exercise', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  grupo_muscular: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'ejercicios',
  timestamps: false
});

export default Exercise;
