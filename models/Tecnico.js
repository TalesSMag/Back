import { DataTypes } from 'sequelize';
import { sequelize } from '../databases/conecta.js';

export const Tecnico = sequelize.define('tecnico', {
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
  CPF: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'CPF' // mapeia para a coluna do banco
  },
  fatorRH: {
    type: DataTypes.STRING(5),
    allowNull: false
  }
}, {
  paranoid: true
});
