import { prisma } from "../lib/prisma.js";
import { verifyToken } from "../lib/jwt.js";

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized — token required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Not authorized — user not found" });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({ message: "Your account is disabled" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired — please log in again" });
    }
    return res.status(401).json({ message: "Not authorized — invalid token" });
  }
}

/** Reject public/client users from staff-only admin APIs */
export function requireStaff(req, res, next) {
  const roleName = req.user?.role?.name?.toLowerCase() ?? "";
  const isClient =
    roleName === "user" ||
    roleName === "client" ||
    req.user?.roleId === 3;

  if (isClient) {
    return res.status(403).json({ message: "Staff access required" });
  }

  next();
}

/** Allow access only to the user's own role menus, or ADMIN */
export function requireSelfRoleOrAdmin(req, res, next) {
  const requestedRoleId = parseInt(req.params.roleId);
  const isAdmin = req.user?.role?.name?.toUpperCase() === "ADMIN";

  if (isAdmin || req.user?.roleId === requestedRoleId) {
    return next();
  }

  return res.status(403).json({ message: "Access denied" });
}

/** Ensure the authenticated user can only act on their own userId (ADMIN bypass) */
export function assertSelfOrAdmin(req, res, userId) {
  if (req.user?.role?.name?.toUpperCase() === "ADMIN") {
    return true;
  }
  if (parseInt(userId) !== req.user?.id) {
    res.status(403).json({ message: "Access denied — you can only access your own data" });
    return false;
  }
  return true;
}
