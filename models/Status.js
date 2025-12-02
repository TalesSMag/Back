import { DataTypes } from 'sequelize';
import { sequelize } from '../databases/conecta.js';

export const Status = sequelize.define('status', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  descricao: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
});
