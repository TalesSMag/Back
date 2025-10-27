import express from 'express';
import multer from "multer";

import {
  tecnicoIndex, tecnicoShow, tecnicoCreate, tecnicoEdit, tecnicoDestroy, tecnicoSearch
} from './controllers/tecnicoController.js';

import {
  materialIndex, materialShow, materialCreate, materialEdit, 
  materialDestroy, materialSearch, materialUpload
} from './controllers/materialController.js';

import {
  clienteIndex, clienteShow, clienteCreate, clienteEdit, clienteDestroy, clienteSearch
} from './controllers/clienteController.js';

import {
  servicoIndex, servicoShow, servicoCreate, servicoEdit, servicoDestroy, servicoSearch, servicoDetalhes
} from './controllers/servicoController.js';

import {
  materialPedidoIndex, materialPedidoShow, materialPedidoCreate,
  materialPedidoEdit, materialPedidoDestroy, materialPedidoSearch, materiaisByServico
} from './controllers/materialPedidoController.js';

import { relatorioServicos } from "./controllers/relatorioController.js";

import { globalSearch } from "./controllers/searchController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

// ------------------- TECNICO -------------------
router.get('/tecnico', tecnicoIndex);
router.get('/tecnico/search', tecnicoSearch);
router.get('/tecnico/:id', tecnicoShow);
router.post('/tecnico', tecnicoCreate);
router.put('/tecnico/:id', tecnicoEdit);
router.delete('/tecnico/:id', tecnicoDestroy);

// ------------------- MATERIAL -------------------
router.get('/material', materialIndex);
//router.get("/incompletos", materialIncompletos);
router.get('/material/search', materialSearch);
router.get('/material/:id', materialShow);
router.post('/material', materialCreate);
router.put('/material/:id', materialEdit);
router.delete('/material/:id', materialDestroy);
router.post("/material/upload", upload.single("file"), materialUpload);

// ------------------- CLIENTE -------------------
router.get('/cliente', clienteIndex);
router.get('/cliente/search', clienteSearch);
router.get('/cliente/:id', clienteShow);
router.post('/cliente', clienteCreate);
router.put('/cliente/:id', clienteEdit);
router.delete('/cliente/:id', clienteDestroy);

// ------------------- SERVICO -------------------
router.get('/servico', servicoIndex);
router.get('/servico/search', servicoSearch);
router.get('/servico/:id', servicoShow);
router.get('/servico/:id/detalhes', servicoDetalhes);
router.post('/servico', servicoCreate);
router.put('/servico/:id', servicoEdit);
router.delete('/servico/:id', servicoDestroy);

// ------------------- MATERIAL PEDIDO -------------------
router.get('/materialpedido', materialPedidoIndex);
router.get('/materialpedido/search', materialPedidoSearch);
router.get('/materialpedido/:id', materialPedidoShow);
router.post('/materialpedido', materialPedidoCreate);
router.put('/materialpedido/:id', materialPedidoEdit);
router.delete('/materialpedido/:id', materialPedidoDestroy);
router.get("/materialpedido/servico/:id", materiaisByServico);

// ------------------- BUSCA GLOBAL -------------------
router.get("/search", globalSearch);

// ------------------- GERADOR DE RELATÓRIO ---------------
router.get("/relatorio/servicos", relatorioServicos);



export default router;
