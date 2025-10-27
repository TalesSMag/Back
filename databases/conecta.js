import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(
  "os", "root", "", {
  dialect: "mysql",
  host: "localhost",
  port: 3306
});