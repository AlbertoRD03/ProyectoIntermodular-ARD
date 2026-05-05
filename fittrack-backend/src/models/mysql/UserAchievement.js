import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/mysql.js';

const UserAchievement = sequelize.define('UserAchievement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  achievement_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_desbloqueo: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'usuarios_logros',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'achievement_id']
    }
  ]
});

export default UserAchievement;
