import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../lib/storage';
import { requireSecureAdmin } from '../../../lib/secure-auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Guruh ID noto\'g\'ri' });
  }

  if (req.method === 'GET') {
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      const group = await storage.getGroup(id);
      if (!group) {
        return res.status(404).json({ message: "Guruh topilmadi" });
      }

      const attendance = await storage.getGroupAttendance(id);
      return res.status(200).json(attendance);
    } catch (error) {
      console.error("Davomat ma'lumotlarini olishda xatolik:", error);
      return res.status(500).json({ message: "Davomat ma'lumotlarini yuklashda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
