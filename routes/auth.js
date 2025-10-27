import express from 'express';
import { Tecnico } from '../models/Tecnico.js';

const router = express.Router();

// Rota de login
router.post('/login', async (req, res) => {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ msg: 'Informe usuário e senha' });
  }

  try {
    // Busca o técnico pelo nome e CPF (atenção ao case!)
    const tecnico = await Tecnico.findOne({
      where: {
        nome: usuario,
        CPF: senha // mapeado corretamente para a coluna do banco
      }
    });

    if (!tecnico) {
      return res.status(401).json({ msg: 'Usuário ou senha inválidos' });
    }

    // Aqui você pode criar token ou cookie
    res.status(200).json({ msg: 'Login realizado com sucesso', nome: tecnico.nome, CPF: tecnico.CPF });
  } catch (error) {
    res.status(500).json({ error });
  }
});

export default router;
