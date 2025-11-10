import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../lib/storage';
import { requireSecureAdmin } from '../lib/secure-auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

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
