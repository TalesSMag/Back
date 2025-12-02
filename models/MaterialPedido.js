import { DataTypes } from 'sequelize';
import  sequelize  from '../databases/conecta.js';
import { Cliente } from './Cliente.js';
//import { Servico } from './Servico.js';
import { Material } from './Material.js';

export const MaterialPedido = sequelize.define('materialpedido', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantidade: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

// 🔗 Associações
MaterialPedido.belongsTo(Cliente, { foreignKey: 'cliente_id' });
MaterialPedido.belongsTo(Material, { foreignKey: 'materiais_id' });
export const associateMaterialPedido = (Servico) => {
  MaterialPedido.belongsTo(Servico, { foreignKey: 'servico_id', as: 'servico' });
};

