import { Op } from "sequelize";
import { Tecnico } from "../models/Tecnico.js";
import { Cliente } from "../models/Cliente.js";
import { Material } from "../models/Material.js";
import { Servico } from "../models/Servico.js";

export const globalSearch = async (req, res) => {
  const { termo } = req.query;
  if (!termo || !termo.trim()) {
    return res.status(400).json({ msg: "Termo de busca inválido" });
  }

  try {
    console.log("Buscando tecnicos...");
    const tecnicos = await Tecnico.findAll({ where: { nome: { [Op.like]: `%${termo}%` } }, limit: 5 });

    console.log("Buscando clientes...");
    const clientes = await Cliente.findAll({ where: { nome: { [Op.like]: `%${termo}%` } }, limit: 5 });

    console.log("Buscando materiais...");
    const materiais = await Material.findAll({ where: { descricao: { [Op.like]: `%${termo}%` } }, limit: 5 });

    console.log("Buscando servicos...");
    const servicos = await Servico.findAll({ where: { descricaoServico: { [Op.like]: `%${termo}%` } }, limit: 5 });

    return res.json({ tecnicos, clientes, materiais, servicos });
  } catch (error) {
    console.error("Erro na busca global:", error);
    return res.status(500).json({ msg: "Erro interno do servidor" });
  }
};

