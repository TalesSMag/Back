import Sequelize from "sequelize";

const dbUrl = process.env.MYSQL_URL;

export const sequelize = dbUrl
  new Sequelize(dbUrl, { dialect: "mysql", logging: false, });
  //: new Sequelize("os", "root", "", {
  //    dialect: "mysql",
  //    host: "localhost",
  //    port: 3306,
  //  });

try {
  await sequelize.authenticate();
  console.log("✅ Conectado ao banco de dados com sucesso!");
} catch (error) {
  console.error("❌ Erro ao conectar ao banco de dados:", error);
}
