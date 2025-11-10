import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../lib/storage';
import { requireSecureStudentOrOwn } from '../../../lib/secure-auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid student ID' });
  }

  if (req.method === 'GET') {
    const user = await requireSecureStudentOrOwn(req, res, id);
    if (!user) return;

    try {
      const purchases = await storage.getStudentPurchases(id);
      return res.status(200).json(purchases);
    } catch (error) {
      console.error("Xaridlarni olishda xatolik:", error);
      return res.status(500).json({ message: "Xaridlarni yuklashda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
