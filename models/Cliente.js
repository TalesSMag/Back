import { DataTypes } from 'sequelize';
import sequelize from '../databases/conecta.js';

export const Cliente = sequelize.define('cliente', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  contato: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  empresa: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  CNPJ: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
});
