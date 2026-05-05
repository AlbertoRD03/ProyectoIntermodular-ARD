import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/mysql.js';

const Achievement = sequelize.define('Achievement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'logros',
  timestamps: true
});

export default Achievement;
