import { Request, Response, NextFunction } from "express";
import { auth } from "../index";

export interface AuthRequest extends Request {
    user?: {
        uid: string;
        email?: string;
        orgId?: string;
        role?: string;
    };
}

/**
 * Middleware to verify Firebase ID Token and Custom Claims
 */
export const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split("Bearer ")[1];
        if (!token) {
            res.status(401).json({ error: "Unauthorized: No token provided" });
            return;
        }

        const decodedToken = await auth.verifyIdToken(token);

        // Attach user info to request
        (req as AuthRequest).user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            orgId: decodedToken.orgId as string,
            role: decodedToken.role as string,
        };

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};

/**
 * Middleware to enforce Organization membership
 */
export const requireOrg = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    if (!user?.orgId) {
        res.status(403).json({ error: "Forbidden: User does not belong to an organization" });
        return;
    }
    next();
};

/**
 * Middleware to enforce Admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    if (user?.role !== "admin") {
        res.status(403).json({ error: "Forbidden: Admin access required" });
        return;
    }
    next();
};
