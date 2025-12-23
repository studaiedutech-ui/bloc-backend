import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
export async function authMiddleware(req, res, next) { try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }
    req.user = { id: user.id, email: user.email, name: user.name, };
    next();
}
catch (error) {
    res.status(401).json({ message: 'Invalid token' });
} }
//# sourceMappingURL=auth.js.map