import { Servico } from "../models/Servico.js";
import { Cliente } from "../models/Cliente.js";
import { Tecnico } from "../models/Tecnico.js";
import { Status } from "../models/Status.js";
import { MaterialPedido } from "../models/MaterialPedido.js";
import { Material } from "../models/Material.js";
import { gerarRelatorioPDF } from "../utils/gerarRelatorioPDF.js";
import { Op } from "sequelize";

const validarCampos = (dados) => {
    const { data, horaChegada, horaSaida, descricaoServico, valorMateriais, valorServico, cliente, tecnico, status } = dados;
    if (!data || !horaChegada || !horaSaida || !descricaoServico || valorMateriais == null || valorServico == null || !cliente || !tecnico || !status) {
      return false;
    }
    return true;
};
  

export const servicoIndex = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const servicos = await Servico.findAndCountAll({
      include: [Cliente, Tecnico, Status],
      limit,
      offset,
    });

    res.json({
      data: servicos.rows,
      total: servicos.count,
    });
  } catch (error) {
    console.error("Erro ao listar serviços:", error);
    res.status(400).json({ message: "Erro ao listar serviços", error });
  }
};

export const servicoShow = async (req, res) => {
  const { id } = req.params;
  try {
    const servico = await Servico.findByPk(id);
    if (!servico) return res.status(404).json({ error: "Serviço não encontrado" });
    res.status(200).json(servico);
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const servicoCreate = async (req, res) => {
  const {
    data,
    horaChegada,
    horaSaida,
    kilometragem,
    descricaoServico,
    valorMateriais,
    valorServico,
    cliente, // pode ser { id } ou { nome, empresa, contato, CNPJ }
    tecnico, // idem
    status // agora será apenas o ID
  } = req.body;

  if (
    !validarCampos({
      data,
      horaChegada,
      horaSaida,
      descricaoServico,
      valorMateriais,
      valorServico,
      cliente,
      tecnico,
      status
    })
  ) {
    return res.status(400).json({ message: "Campos obrigatórios faltando" });
  }

  try {
    // ===========================
    // AJUSTE DE DATA (timezone fix)
    // ===========================
    let dataServico = new Date(data);
    dataServico.setMinutes(dataServico.getMinutes() + dataServico.getTimezoneOffset());
    // Agora dataServico reflete a data exata escolhida no input, sem deslocamento UTC

    // ===========================
    // CLIENTE
    // ===========================
    let clienteObj;
    if (cliente?.id) {
      clienteObj = await Cliente.findByPk(cliente.id);
    } else if (cliente?.nome) {
      clienteObj = await Cliente.findOne({
        where: { nome: cliente.nome, empresa: cliente.empresa }
      });

      if (!clienteObj) {
        clienteObj = await Cliente.create({
          nome: cliente.nome,
          empresa: cliente.empresa,
          contato: cliente.contato,
          CNPJ: cliente.CNPJ
        });
      }
    }

    if (!clienteObj) {
      return res.status(400).json({ msg: "Cliente não informado ou inválido" });
    }

    // ===========================
    // TÉCNICO
    // ===========================
    let tecnicoObj;
    if (tecnico?.id) {
      tecnicoObj = await Tecnico.findByPk(tecnico.id);
    } else if (tecnico?.nome) {
      tecnicoObj = await Tecnico.findOne({ where: { nome: tecnico.nome } });
    }

    if (!tecnicoObj) {
      return res.status(400).json({ msg: "Técnico não encontrado" });
    }

    // ===========================
    // CRIAR SERVIÇO
    // ===========================
    console.log("Recebido no backend (req.body):", req.body);
    console.log("Cliente selecionado:", clienteObj);
    console.log("Técnico selecionado:", tecnicoObj);

    const servico = await Servico.create({
      data: dataServico, // ⬅️ agora usamos a data ajustada
      horaChegada,
      horaSaida,
      kilometragem: kilometragem || null,
      descricaoServico,
      valorMateriais,
      valorServico,
      total: parseFloat(valorMateriais) + parseFloat(valorServico),
      cliente_id: clienteObj.id,
      tecnico_id: tecnicoObj.id,
      status_id: status
    });

    res.status(201).json(servico);
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    res.status(500).json({ msg: "Erro ao criar serviço", error });
  }
};



export const servicoEdit = async (req, res) => {
  const { id } = req.params;
  const {
    data,
    horaChegada,
    horaSaida,
    kilometragem,
    descricaoServico,
    valorMateriais,
    valorServico,
    cliente,
    tecnico,
    status
  } = req.body;

  try {
    const servico = await Servico.findByPk(id);
    if (!servico) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }

    // ===========================
    // CLIENTE
    // ===========================
    let clienteObj;
    if (cliente?.id) {
      clienteObj = await Cliente.findByPk(cliente.id);
      if (clienteObj && cliente.nome) {
        // se veio dados novos, atualiza
        await clienteObj.update({
          nome: cliente.nome,
          empresa: cliente.empresa,
          contato: cliente.contato,
          CNPJ: cliente.CNPJ
        });
      }
    } else if (cliente?.nome) {
      clienteObj = await Cliente.findOne({
        where: { nome: cliente.nome, empresa: cliente.empresa }
      });

      if (!clienteObj) {
        clienteObj = await Cliente.create({
          nome: cliente.nome,
          empresa: cliente.empresa,
          contato: cliente.contato,
          CNPJ: cliente.CNPJ
        });
      } else {
        await clienteObj.update({
          nome: cliente.nome,
          empresa: cliente.empresa,
          contato: cliente.contato,
          CNPJ: cliente.CNPJ
        });
      }
    }

    // ===========================
    // TÉCNICO
    // ===========================
    let tecnicoObj;
    if (tecnico?.id) {
      tecnicoObj = await Tecnico.findByPk(tecnico.id);
    } else if (tecnico?.nome) {
      tecnicoObj = await Tecnico.findOne({ where: { nome: tecnico.nome } });
    }

    if (!tecnicoObj) {
      return res.status(400).json({ msg: "Técnico não encontrado" });
    }

    // ===========================
    // Atualizar SERVIÇO
    // ===========================
    await servico.update({
      data,
      horaChegada,
      horaSaida,
      kilometragem: kilometragem || null,
      descricaoServico,
      valorMateriais,
      valorServico,
      total: parseFloat(valorMateriais) + parseFloat(valorServico),
      cliente_id: clienteObj?.id || servico.cliente_id,
      tecnico_id: tecnicoObj.id,
      status_id: status || servico.status_id
    });

    res.status(200).json(servico);
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    res.status(500).json({ error: "Erro ao atualizar serviço", details: error });
  }
};


export const servicoDestroy = async (req, res) => {
  const { id } = req.params;
  try {
    await Servico.destroy({ where: { id } });
    res.status(200).json({ msg: "Serviço removido com sucesso" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

// 🔹 Para o endpoint /servico/search (busca por data)
export const servicoSearch = async (req, res) => {
  const { termo, page = 1, limit = 5 } = req.query;

  if (!termo) {
    return res.status(400).json({ error: "Parâmetro 'termo' é obrigatório" });
  }

  try {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Servico.findAndCountAll({
      where: { 
        descricaoServico: { [Op.like]: `%${termo}%` } 
      },
      include: [Cliente, Tecnico, Status],
      limit: parseInt(limit),
      offset: offset,
      order: [['data', 'DESC']]
    });

    res.json({
      data: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error("Erro na busca por descrição:", error);
    res.status(500).json({ error: error.message });
  }
};

export const servicoGeralSearch = async (req, res) => {
  const { termo } = req.query;

  if (!termo) {
    return res.status(400).json({ error: "Parâmetro 'termo' é obrigatório" });
  }

  try {
    const servicos = await Servico.findAndCountAll({
      where: { descricaoServico: { [Op.like]: `%${termo}%` } },
      include: [Cliente, Tecnico, Status],
    });

    res.json({
      data: servicos.rows,
      total: servicos.count,
    });
  } catch (error) {
    console.error("Erro na busca geral:", error);
    res.status(500).json({ error });
  }
};

export const servicoDetalhes = async (req, res) => {
  const { id } = req.params;
  try {
    const servico = await Servico.findByPk(id, {
      include: [
        Cliente,
        Tecnico,
        Status,
        {
          model: MaterialPedido,
          as: 'materialpedidos',
          include: [{ model: Material, as: 'material' }]
        }
      ]
    });
    

    if (!servico) return res.status(404).json({ error: "Serviço não encontrado" });

    res.status(200).json({
      servico,
      materiais: servico.materialpedidos // retorna a lista de materiais já com dados do material
    });
  } catch (error) {
    console.error("Erro ao buscar detalhes do serviço:", error);
    res.status(500).json({ error });
  }
};

export const relatorioServicos = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
      return res.status(400).json({ msg: "Parâmetros 'dataInicio' e 'dataFim' são obrigatórios." });
    }

    const servicos = await Servico.findAll({
      where: {
        data: { [Op.between]: [dataInicio, dataFim] },
      },
      include: [Cliente, Tecnico, Status],
      order: [["data", "ASC"]],
    });

    if (servicos.length === 0) {
      return res.status(404).json({ msg: "Nenhum serviço encontrado neste período." });
    }

    const pdfBuffer = await gerarRelatorioPDF(servicos, { dataInicio, dataFim });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=relatorio-servicos.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    res.status(500).json({ msg: "Erro ao gerar relatório", error });
  }
};
