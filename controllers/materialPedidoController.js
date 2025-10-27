import { MaterialPedido } from '../models/MaterialPedido.js';
import { Material } from '../models/Material.js';
import { Servico } from '../models/Servico.js';

export const materialPedidoIndex = async (req, res) => {
  try {
    const pedidos = await MaterialPedido.findAll();
    res.status(200).json(pedidos);
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const materialPedidoShow = async (req, res) => {
  const { id } = req.params;
  try {
    const pedido = await MaterialPedido.findByPk(id);
    if (!pedido) return res.status(404).json({ error: "Pedido não encontrado" });
    res.status(200).json(pedido);
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const materialPedidoCreate = async (req, res) => {
  const { materiais_id, quantidade, servico_id, cliente_id } = req.body;

  console.log("➡️ Recebido no backend (materialpedido):", req.body);

  if (!materiais_id || !quantidade || !servico_id || !cliente_id) 
    return res.status(400).json({ msg: "Informe todos os dados" });

  try {
    // busca preço do material
    const material = await Material.findByPk(materiais_id);
    if (!material) return res.status(404).json({ msg: "Material não encontrado" });

    // cria o pedido
    const pedido = await MaterialPedido.create({ materiais_id, quantidade, servico_id, cliente_id });
    console.log("✅ MaterialPedido criado:", pedido);

    // calcula o valor total dos materiais deste serviço
    const pedidosServico = await MaterialPedido.findAll({ 
      where: { servico_id }, 
      include: [Material] 
    });

    console.log("📦 Pedidos encontrados:", pedidosServico.length);

    const valorMateriais = pedidosServico.reduce((acc, p) => {
      if (!p.material) {
        console.warn("⚠️ Material ausente para materialpedido id:", p.id);
        return acc;
      }
      return acc + (p.quantidade * p.material.preco);
    }, 0);
    
    console.log("💰 Valor total dos materiais atualizado:", valorMateriais);

    // atualiza o serviço
    await Servico.update({ valorMateriais }, { where: { id: servico_id } });

    res.status(201).json({ pedido, valorMateriais });
  } catch (error) {
    console.error("❌ ERRO DETALHADO AO CRIAR MATERIALPEDIDO:", error);
    return res.status(500).json({
      msg: "Erro ao criar pedido",
      error: error.message,
      stack: error.stack,
    });
  }
};

export const materialPedidoEdit = async (req, res) => {
  const { id } = req.params;
  const dados = req.body;
  try {
    const pedido = await MaterialPedido.findByPk(id);
    if (!pedido) return res.status(404).json({ error: "Pedido não encontrado" });

    await pedido.update(dados);
    res.status(200).json(pedido);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar pedido" });
  }
};

export const materialPedidoDestroy = async (req, res) => {
  const { id } = req.params;
  try {
    await MaterialPedido.destroy({ where: { id } });
    res.status(200).json({ msg: "Pedido removido com sucesso" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const materialPedidoSearch = async (req, res) => {
  const { materiais_id } = req.query;
  if (!materiais_id) return res.status(400).json({ error: "Parâmetro 'materialId' é obrigatório" });

  try {
    const pedidos = await MaterialPedido.findAll({ where: { materiais_id } });
    if (pedidos.length === 0) return res.status(404).json({ msg: "Nenhum pedido encontrado" });
    res.status(200).json(pedidos);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const materiaisByServico = async (req, res) => {
  const { id } = req.params; // id do serviço
  try {
    const materiais = await MaterialPedido.findAll({
      where: { servico_id: id },
      include: [
        {
          model: Material,
          as: "material",
          attributes: ["id", "descricao", "marca", "preco"],
        },
      ],
    });

    if (!materiais || materiais.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(materiais);
  } catch (error) {
    console.error("Erro ao buscar materiais por serviço:", error);
    res.status(500).json({ error: "Erro ao buscar materiais do serviço" });
  }
};

