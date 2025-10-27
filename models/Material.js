import { DataTypes } from 'sequelize';
import { sequelize } from '../databases/conecta.js';

export const Material = sequelize.define('material', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  descricao: {
    type: DataTypes.STRING,
    allowNull: false
  },
  marca: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  preco: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  // 🔹 NOVO CAMPO para identificar materiais incompletos
  incompleto: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});
