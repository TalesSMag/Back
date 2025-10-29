import express from 'express';
import cors from "cors";
import routes from './routes.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import { authRequired } from './middleware/auth.js';

import { sequelize } from './databases/conecta.js';
import { Cliente } from './models/Cliente.js';
import { Tecnico } from './models/Tecnico.js';
import { Material } from './models/Material.js';
import { Status } from './models/Status.js';
import { Servico } from './models/Servico.js';
import { MaterialPedido } from './models/MaterialPedido.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware para parsear JSON
app.use(express.json());

// Middleware para habilitar CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true // permite cookies cross-origin
}));

// Cookie parser
app.use(cookieParser());

// Rotas de autenticação (login/logout)
app.use('/auth', authRoutes);

// Rotas principais da aplicação (protegidas)
app.use('/api', routes);

// Função assíncrona para conectar ao banco de dados
async function conecta_db() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com banco de dados realizada com sucesso');

    await Cliente.sync();
    await Tecnico.sync();
    await Material.sync();
    await Status.sync();
    await Servico.sync();
    await MaterialPedido.sync();

  } catch (error) {
    console.error('Erro na conexão com o banco: ', error);
  }
}

// Chama a função para conectar ao banco de dados
conecta_db();

// Rota principal
app.get('/', (req, res) => {
  res.send('Projeto Telnet');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor Rodando na Porta: ${PORT}`);
});
