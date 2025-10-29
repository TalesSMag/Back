import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(process.env.MYSQL_URL, {
  dialect: "mysql",
  dialectOptions: {
    ssl: {
      require: false,
    },
  },
});
