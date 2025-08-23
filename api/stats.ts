import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../lib/storage';

function getUserFromSession(req: VercelRequest) {
  try {
    const sessionCookie = req.cookies?.session;
    if (!sessionCookie) return null;
    
    const sessionData = Buffer.from(sessionCookie, 'base64').toString('utf-8');
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}

function requireAdmin(req: VercelRequest, res: VercelResponse) {
  const user = getUserFromSession(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ message: "Faqat administratorlar uchun" });
    return false;
  }
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // GET /api/stats - Get statistics (admin only)
    if (!requireAdmin(req, res)) return;

    try {
      const stats = await storage.getStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Statistika olishda xatolik:", error);
      return res.status(500).json({ message: "Statistika ma'lumotlarini yuklashda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}