import { DataTypes } from 'sequelize';
import  sequelize  from '../databases/conecta.js';
import { MaterialPedido, associateMaterialPedido } from './MaterialPedido.js';
import { Cliente } from './Cliente.js';
import { Tecnico } from './Tecnico.js';
import { Status } from './Status.js';

export const Servico = sequelize.define('servico', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  data: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  horaChegada: {
    type: DataTypes.TIME,
    allowNull: false
  },
  horaSaida: {
    type: DataTypes.TIME,
    allowNull: false
  },
  kilometragem: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  descricaoServico: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  valorMateriais: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  valorServico: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  total: {
    type: DataTypes.DOUBLE,
    allowNull: true
  }}, {
    hooks: {
      beforeCreate: (servico) => {
        servico.total = Number(servico.valorMateriais) + Number(servico.valorServico);
      },
      beforeUpdate: (servico) => {
        servico.total = Number(servico.valorMateriais) + Number(servico.valorServico);
      }
    }
});

// 🔗 Associações
Servico.belongsTo(Cliente, { foreignKey: 'cliente_id' });
Servico.belongsTo(Tecnico, { foreignKey: 'tecnico_id' });
Servico.belongsTo(Status, { foreignKey: 'status_id' });
Servico.hasMany(MaterialPedido, { foreignKey: 'servico_id', as: 'materialpedidos' });

// Associa MaterialPedido dinamicamente
associateMaterialPedido(Servico);
