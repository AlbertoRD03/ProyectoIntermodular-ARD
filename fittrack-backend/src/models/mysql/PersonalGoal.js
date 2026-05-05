import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/mysql.js';

const PersonalGoal = sequelize.define('PersonalGoal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  valor_inicial: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  valor_objetivo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  unidad: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fecha_limite: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'objetivos_personales',
  timestamps: true
});

export default PersonalGoal;
