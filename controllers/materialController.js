import multer from "multer";
import path from "path";
import fs from "fs";
import csvParser from "csv-parser";
import XLSX from 'xlsx';
import { Material } from '../models/Material.js';
import { Op } from 'sequelize';

export const materialIndex = async (req, res) => {
  try {
    const { page = 1, limit = 5, termo } = req.query;
    const offset = (page - 1) * limit;

    const where = termo
      ? { descricao: { [Op.like]: `%${termo}%` } }
      : {};

    const { rows, count } = await Material.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [
        ['incompleto', 'DESC'],  // TRUE vem primeiro (incompletos)
        ['descricao', 'ASC']     // Depois por descrição
      ]
    });

    res.status(200).json({
      data: rows,
      total: count,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const materialShow = async (req, res) => {
  const { id } = req.params;
  try {
    const material = await Material.findByPk(id);
    if (!material) return res.status(404).json({ error: "Material não encontrado" });
    res.status(200).json(material);
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const materialCreate = async (req, res) => {
  const { descricao, marca, preco, incompleto } = req.body;

  // 🔹 Validações mais flexíveis para materiais incompletos
  if (!descricao) return res.status(400).json({ msg: "Descrição é obrigatória" });

  // Para materiais incompletos, aceita marca vazia e preço 0
  const isIncompleto = incompleto === true;
  
  let precoValidado = parseFloat(preco) || 0;
  if (isIncompleto) {
    // Materiais incompletos podem ter preço 0
    precoValidado = Math.max(0, precoValidado);
  } else {
    // Materiais completos precisam de preço > 0
    if (!preco || precoValidado <= 0) {
      return res.status(400).json({ msg: "Preço deve ser maior que zero" });
    }
    if (!marca || marca.trim() === "") {
      return res.status(400).json({ msg: "Marca é obrigatória" });
    }
  }

  const marcaValidada = marca && marca.trim() !== "" ? marca.trim() : "Pendente";

  try {
    const material = await Material.create({ 
      descricao, 
      marca: marcaValidada, 
      preco: precoValidado,
      incompleto: isIncompleto
    });
    res.status(201).json(material);
  } catch (error) {
    console.error("Erro ao criar material:", error);
    res.status(500).json({ msg: "Erro ao criar material", error: error.message });
  }
};

export const materialEdit = async (req, res) => {
  const { id } = req.params;
  const dados = req.body;
  
  try {
    const material = await Material.findByPk(id);
    if (!material) return res.status(404).json({ error: "Material não encontrado" });

    // 🔹 Lógica automática: se marca e preço estiverem preenchidos, marca como completo
    if (dados.marca && dados.marca.trim() !== "" && dados.preco && dados.preco > 0) {
      dados.incompleto = false;
    }

    await material.update(dados);
    res.status(200).json(material);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar material" });
  }
};

export const materialDestroy = async (req, res) => {
  const { id } = req.params;
  try {
    await Material.destroy({ where: { id } });
    res.status(200).json({ msg: "Material removido com sucesso" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

export const materialSearch = async (req, res) => {
  const { termo, page = 1, limit = 5 } = req.query;
  
  if (!termo) return res.status(400).json({ error: "Parâmetro 'termo' é obrigatório" });

  try {
    const offset = (page - 1) * limit;
    
    const { rows, count } = await Material.findAndCountAll({
      where: {
        descricao: { [Op.like]: `%${termo}%` }
      },
      limit: parseInt(limit),
      offset: offset,
      order: [
        ['incompleto', 'DESC'],  // 🔥 MESMA ORDENAÇÃO do materialIndex
        ['descricao', 'ASC']
      ]
    });

    // 🔥 RETORNO PADRONIZADO igual ao materialIndex
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


// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // ex: 169486123.pdf
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".csv", ".xlsx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) cb(null, true);
    else cb(new Error("Apenas arquivos PDF, CSV ou XLSX são permitidos"));
  },
});

// Rota de processamento do arquivo
export const materialUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "Nenhum arquivo enviado" });
    }

    console.log("📁 Arquivo recebido:", req.file.originalname);

    const filePath = req.file.path;
    const ext = req.file.originalname.split(".").pop().toLowerCase();
    let registros = [];

    // 📘 CSV
    if (ext === "csv") {
      console.log("📗 Processando CSV...");
      const rows = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on("data", (row) => rows.push(row))
          .on("end", () => resolve())
          .on("error", (err) => reject(err));
      });

      registros = rows.map((row) => {
        const descricao = row["descricao"] || row["Descricao"] || "";
        const marca = row["marca"] || row["Marca"] || "";
        const preco = parseFloat(row["preco"] || row["Preco"] || 0);
      
        const marcaValida = marca && marca.trim() !== "";
        const precoValido = !isNaN(preco) && preco > 0;
        const incompleto = !(marcaValida && precoValido);
      
        return { descricao, marca, preco, incompleto };
      });
    }

    // 📗 EXCEL
    if (ext === "xlsx" || ext === "xls") {
      console.log("📘 Processando Excel...");
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      registros = data.map((row) => {
        const descricao = row["descricao"] || row["Descricao"] || "";
        const marca = row["marca"] || row["Marca"] || "";
        const preco = parseFloat(row["preco"] || row["Preco"] || 0);
      
        const marcaValida = marca && marca.trim() !== "";
        const precoValido = !isNaN(preco) && preco > 0;
        const incompleto = !(marcaValida && precoValido);
      
        return { descricao, marca, preco, incompleto };
      });
    }

    if (registros.length === 0) {
      return res.status(400).json({ msg: "Nenhum dado válido encontrado no arquivo." });
    }

    // ✅ Evita duplicação com verificação manual
    let inseridos = 0;
    let atualizados = 0;

    for (const reg of registros) {
      const existente = await Material.findOne({
        where: {
          descricao: reg.descricao.trim(),
          marca: reg.marca.trim(),
        },
      });

      if (existente) {
        // 🔄 Atualiza se algo mudou
        await existente.update({
          preco: reg.preco,
          incompleto: reg.incompleto,
        });
        atualizados++;
      } else {
        // 🆕 Cria novo registro
        await Material.create(reg);
        inseridos++;
      }
    }

    // Corrige status de incompletos que agora estão completos
    await Material.update(
      { incompleto: false },
      {
        where: {
          marca: { [Op.ne]: "" },
          preco: { [Op.gt]: 0 },
          incompleto: true,
        },
      }
    );

    // 🔁 Remove o arquivo após o processamento
    fs.unlinkSync(filePath);

    // 🔹 Retorna resposta compatível com o front-end
    res.json({
      msg: "📦 Upload e sincronização concluídos",
      count: registros.length,
      inseridos,
      atualizados,
    });
  } catch (error) {
    console.error("❌ Erro no upload:", error);
    res.status(500).json({ error: error.message });
  }
};
