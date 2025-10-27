import jwt from 'jsonwebtoken';

export function authRequired(req, res, next) {
  try {
    // 1) Pega do header "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    // 2) Ou do cookie httpOnly (se preferir)
    const cookieToken = req.cookies?.token;

    const jwtToken = token || cookieToken;
    if (!jwtToken) return res.status(401).json({ error: 'Não autenticado' });

    const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);
    req.user = payload; // { id, nome }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido/expirado' });
  }
}
