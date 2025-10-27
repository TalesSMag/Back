import { Tecnico } from '../models/Tecnico.js';
import { Op } from 'sequelize';

export const tecnicoIndex = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const { count, rows } = await Tecnico.findAndCountAll({
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
    console.error("Erro ao carregar técnicos:", error);
    res.status(500).json({ msg: "Erro interno do servidor" });
  }
};

export const tecnicoShow = async (req, res) => {
  const { id } = req.params;
  try {
    const tecnico = await Tecnico.findByPk(id);
    if (!tecnico) return res.status(404).json({ error: "Técnico não encontrado" });
    res.status(200).json(tecnico);
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const tecnicoCreate = async (req, res) => {
  const { nome, contato, CPF, fatorRH } = req.body;
  if (!nome || !contato || !CPF || !fatorRH) return res.status(400).json({ msg: "Informe todos os dados" });

  try {
    const tecnico = await Tecnico.create({ nome, contato, CPF, fatorRH });
    res.status(201).json(tecnico);
  } catch (error) {
    res.status(500).json({ msg: "Erro ao criar técnico", error });
  }
};

export const tecnicoEdit = async (req, res) => {
  const { id } = req.params;
  const dados = req.body;
  try {
    const tecnico = await Tecnico.findByPk(id);
    if (!tecnico) return res.status(404).json({ error: "Técnico não encontrado" });

    await tecnico.update(dados);
    res.status(200).json(tecnico);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar técnico" });
  }
};

export const tecnicoDestroy = async (req, res) => {
  const { id } = req.params;
  try {
    await Tecnico.destroy({ where: { id } });
    res.status(200).json({ msg: "Técnico removido com sucesso" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const tecnicoSearch = async (req, res) => {
  const { termo, page = 1, limit = 5 } = req.query;

  if (!termo) {
    return res.status(400).json({ error: "Parâmetro 'termo' é obrigatório" });
  }

  try {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Tecnico.findAndCountAll({
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
