import { Servico } from "../models/Servico.js";
import { Cliente } from "../models/Cliente.js";
import { Tecnico } from "../models/Tecnico.js";
import { Status } from "../models/Status.js";
import { gerarRelatorioPDF } from "../utils/gerarRelatorioPDF.js";
import { Op } from "sequelize";

// 🔹 Geração de relatório de serviços com base em data inicial e final
export const relatorioServicos = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    if (!dataInicio || !dataFim) {
      return res.status(400).json({ msg: "Parâmetros 'dataInicio' e 'dataFim' são obrigatórios." });
    }

    const servicos = await Servico.findAll({
      where: {
        data: {
          [Op.between]: [dataInicio, dataFim]
        }
      },
      include: [Cliente, Tecnico, Status],
      order: [["data", "ASC"]]
    });

    if (servicos.length === 0) {
      return res.status(404).json({ msg: "Nenhum serviço encontrado neste período." });
    }

    // Gera o PDF
    const pdfBuffer = await gerarRelatorioPDF(servicos, { dataInicio, dataFim });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=relatorio-servicos.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    res.status(500).json({ msg: "Erro ao gerar relatório", error });
  }
};
