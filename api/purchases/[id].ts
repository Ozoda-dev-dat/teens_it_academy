import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../lib/storage';
import { requireSecureAdmin, getSecureUserFromSession } from '../../lib/secure-auth';
import { notificationService } from '../../server/notifications';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid purchase ID' });
  }

  if (req.method === 'GET') {
    const user = await getSecureUserFromSession(req);
    if (!user) {
      return res.status(401).json({ message: 'Autentifikatsiya talab qilinadi' });
    }

    try {
      const purchase = await storage.getPurchase(id);
      if (!purchase) {
        return res.status(404).json({ message: "Xarid topilmadi" });
      }
      
      if (user.role === 'student' && purchase.studentId !== user.id) {
        return res.status(403).json({ message: "Kirish rad etildi" });
      }
      
      return res.status(200).json(purchase);
    } catch (error) {
      console.error("Xarid ma'lumotlarini olishda xatolik:", error);
      return res.status(500).json({ message: "Xarid ma'lumotlarini yuklashda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
