import type { VercelRequest } from '@vercel/node';

export function getUserFromSession(req: VercelRequest) {
  try {
    const sessionCookie = req.cookies?.session;
    if (!sessionCookie) return null;
    
    const sessionData = Buffer.from(sessionCookie, 'base64').toString('utf-8');
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}

export function requireAuth(req: VercelRequest) {
  const user = getUserFromSession(req);
  if (!user) {
    throw new Error("Autentifikatsiya talab qilinadi");
  }
  return user;
}

export function requireAdmin(req: VercelRequest) {
  const user = requireAuth(req);
  if (user.role !== "admin") {
    throw new Error("Faqat administratorlar uchun");
  }
  return user;
}