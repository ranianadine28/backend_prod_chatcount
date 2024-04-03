import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../default.js';

export  function authenticateUser (req, res, next) {
    if (req.header('Authorization') === undefined)
        return res.status(401).json({ error: 'Authorization denied.' })

    const token = req.header('authorization').split(' ')[1]
    if (!token) return res.status(401).send('Access denied.')

    jwt.verify(
        token,
        JWT_SECRET,
        (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Access denied.' })
            }
            req.userId = decoded.id; // Ajoutez l'ID de l'utilisateur à la demande
            next()
        }
    )
}
