import { Cliente } from '../models/Cliente.js';
import { Op } from 'sequelize';

// Listar todos os clientes
export const clienteIndex = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const { count, rows } = await Cliente.findAndCountAll({
      limit: limit,
      offset: offset,
      order: [['nome', 'ASC']]
    });

    res.status(200).json({
      data: rows,
      total: count,
      page: page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
    res.status(500).json({ msg: "Erro interno do servidor" });
  }
};

// Mostrar detalhes de um cliente
export const clienteShow = async (req, res) => {
  const { id } = req.params;
  try {
    const cliente = await Cliente.findByPk(id);
    if (!cliente) return res.status(404).json({ error: "Cliente não encontrado" });
    res.status(200).json(cliente);
  } catch (error) {
    res.status(400).json({ error });
  }
};

// Criar cliente
export const clienteCreate = async (req, res) => {
  const { nome, contato, empresa, CNPJ } = req.body;
  if (!nome || !contato || !empresa || !CNPJ) {
    return res.status(400).json({ msg: "Informe todos os dados" });
  }

  try {
    const cliente = await Cliente.create({ nome, contato, empresa, CNPJ });
    res.status(201).json(cliente);
  } catch (error) {
    res.status(500).json({ msg: "Erro ao criar cliente", error });
  }
};

// Editar cliente
export const clienteEdit = async (req, res) => {
  const { id } = req.params;
  const dados = req.body;
  try {
    const cliente = await Cliente.findByPk(id);
    if (!cliente) return res.status(404).json({ error: "Cliente não encontrado" });

    await cliente.update(dados);
    res.status(200).json(cliente);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
};

// Deletar cliente
export const clienteDestroy = async (req, res) => {
  const { id } = req.params;
  try {
    await Cliente.destroy({ where: { id } });
    res.status(200).json({ msg: "Cliente removido com sucesso" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const clienteSearch = async (req, res) => {
  const { termo, page = 1, limit = 5 } = req.query;

  if (!termo) {
    return res.status(400).json({ error: "Parâmetro 'termo' é obrigatório" });
  }

  try {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Cliente.findAndCountAll({
      where: { 
        nome: { [Op.like]: `%${termo}%` } 
      },
      limit: parseInt(limit),
      offset: offset,
      order: [['nome', 'ASC']]
    });

    res.status(200).json({
      data: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
