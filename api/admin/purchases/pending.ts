import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../lib/storage';
import { requireSecureAdmin } from '../../../lib/secure-auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      const pendingPurchases = await storage.getPendingPurchases();
      return res.status(200).json(pendingPurchases);
    } catch (error) {
      console.error("Kutilayotgan xaridlarni olishda xatolik:", error);
      return res.status(500).json({ message: "Kutilayotgan xaridlarni yuklashda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
