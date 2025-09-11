import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../lib/storage';
import { insertGroupSchema } from '../../shared/schema';
import { requireSecureAdmin } from '../../lib/secure-auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid group ID' });
  }

  if (req.method === 'PUT') {
    // PUT /api/groups/[id] - Update group (admin only)
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      const updates = insertGroupSchema.partial().parse(req.body);
      const group = await storage.updateGroup(id, updates);
      if (!group) {
        return res.status(404).json({ message: "Guruh topilmadi" });
      }
      return res.status(200).json(group);
    } catch (error) {
      console.error("Guruh yangilashda xatolik:", error);
      return res.status(400).json({ message: "Guruh yangilashda xatolik" });
    }
  }

  if (req.method === 'DELETE') {
    // DELETE /api/groups/[id] - Delete group (admin only)
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      const deleted = await storage.deleteGroup(id);
      if (!deleted) {
        return res.status(404).json({ message: "Guruh topilmadi" });
      }
      return res.status(200).json({ message: "Guruh muvaffaqiyatli o'chirildi" });
    } catch (error) {
      console.error("Guruhni o'chirishda xatolik:", error);
      return res.status(500).json({ message: "Guruhni o'chirishda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}