import User from './User.js';
import Achievement from './Achievement.js';
import UserAchievement from './UserAchievement.js';
import PersonalGoal from './PersonalGoal.js';
import Exercise from './Exercise.js';

User.belongsToMany(Achievement, {
  through: UserAchievement,
  foreignKey: 'user_id',
  otherKey: 'achievement_id'
});

Achievement.belongsToMany(User, {
  through: UserAchievement,
  foreignKey: 'achievement_id',
  otherKey: 'user_id'
});

User.hasMany(UserAchievement, { foreignKey: 'user_id' });
UserAchievement.belongsTo(User, { foreignKey: 'user_id' });

Achievement.hasMany(UserAchievement, { foreignKey: 'achievement_id' });
UserAchievement.belongsTo(Achievement, { foreignKey: 'achievement_id' });

User.hasMany(PersonalGoal, { foreignKey: 'usuario_id' });
PersonalGoal.belongsTo(User, { foreignKey: 'usuario_id' });

export {
  User,
  Achievement,
  UserAchievement,
  PersonalGoal,
  Exercise
};
