/**
 * JWT‑Authentifizierungs‑Middleware
 *
 * • Prüft, ob im Header `x-auth-token` ein gültiges JWT vorhanden ist.
 * • Legt nach erfolgreicher Verifikation `req.user` an.
 * • Exportiert außerdem `authorizeRoles(...roles)` für einfache Rollenprüfungen.
 */
import jwt from 'jsonwebtoken';

// ---------------------------------------------------------
//  Auth‑Middleware
// ---------------------------------------------------------
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token)
    return res.status(401).json({ message: 'Kein Token – Zugriff verweigert.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // { id, role }
    next();
  } catch {
    res.status(401).json({ message: 'Ungültiger Token.' });
  }
};

// ---------------------------------------------------------
//  Rollen‑Middleware
// ---------------------------------------------------------
export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user?.role || !roles.includes(req.user.role))
    return res.status(403).json({ message: 'Verboten: Keine ausreichenden Berechtigungen.' });
  next();
};

export default authMiddleware;
