import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const gerarRelatorioPDF = async (servicos, periodo) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // ================
      // 🧾 CABEÇALHO
      // ================
      const logoPath = path.resolve("public/Logo.png"); // ajuste se necessário
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 30, { width: 60 });
      }

      doc.font("Helvetica-Bold").fontSize(18).text("Relatório de Serviços", 0, 40, {
        align: "center",
      });

      doc.font("Helvetica").fontSize(12).text(`Período: ${periodo.dataInicio} até ${periodo.dataFim}`, {
        align: "center",
      });

      doc.moveDown(2);
      doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor("#000").stroke();
      doc.moveDown(1.2);

      // ================
      // 📋 CABEÇALHO DA TABELA
      // ================
      const startY = doc.y;
      const columnX = {
        data: 50,
        cliente: 120,
        tecnico: 250,
        descricao: 370,
        total: 510,
      };

      doc.font("Helvetica-Bold").fontSize(11);
      doc.text("Data", columnX.data, startY);
      doc.text("Cliente", columnX.cliente, startY);
      doc.text("Técnico", columnX.tecnico, startY);
      doc.text("Serviço", columnX.descricao, startY);
      doc.text("Total (R$)", columnX.total, startY, { align: "right" });

      doc.moveDown(0.5);
      doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor("#000").stroke();
      doc.moveDown(0.5);

      // ================
      // 📦 LINHAS DA TABELA
      // ================
      doc.font("Helvetica").fontSize(10);
      let totalGeral = 0;
      let y = doc.y;

      servicos.forEach((s, index) => {
        const dataFormatada = new Date(s.data).toLocaleDateString("pt-BR");
        const total = parseFloat(s.total).toFixed(2);
        totalGeral += parseFloat(total);

        // Linhas alternadas
        if (index % 2 === 0) {
          doc.rect(40, y - 2, 510, 16).fill("#f5f5f5").fillColor("#000");
        }

        doc.text(dataFormatada, columnX.data, y);
        doc.text(s.Cliente?.nome || "-", columnX.cliente, y, { width: 120 });
        doc.text(s.Tecnico?.nome || "-", columnX.tecnico, y, { width: 100 });
        doc.text(s.descricaoServico, columnX.descricao, y, { width: 120 });
        doc.text(`R$ ${total}`, columnX.total, y, { align: "right" });

        y += 18;
        doc.y = y;

        if (y > 730) {
          doc.addPage();
          y = 80;
        }
      });

      // ================
      // 🧮 TOTAL GERAL
      // ================
      doc.moveDown(1);
      doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor("#000").stroke();
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").fontSize(13);
      doc.text("Total Geral:", 380, doc.y);
      doc.text(`R$ ${totalGeral.toFixed(2)}`, 510, doc.y, { align: "right" });

      // Rodapé
      doc.fontSize(9).fillColor("#666");
      doc.text(
        `Relatório gerado automaticamente em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
        40,
        770,
        { align: "center" }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
