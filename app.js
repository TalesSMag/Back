import express from 'express';
import cors from "cors";
import routes from './routes.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import { authRequired } from './middleware/auth.js';

import sequelize from './databases/conecta.js';
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
const allowedOrigins = [
  'http://localhost:5173',
  'https://telnet-react.vercel.app'
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // allow non-browser requests
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `O CORS para ${origin} não é permitido!`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
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
