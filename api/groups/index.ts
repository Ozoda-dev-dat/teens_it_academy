import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../lib/storage';
import { insertGroupSchema } from '../../shared/schema';
import { notificationService } from '../../server/notifications';
import { requireSecureAdmin } from '../../lib/secure-auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const groups = await storage.getAllGroups();
      return res.status(200).json(groups);
    } catch (error) {
      console.error("Guruhlarni olishda xatolik:", error);
      return res.status(500).json({ message: "Guruhlarni yuklashda xatolik" });
    }
  }

  if (req.method === 'POST') {
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    try {
      const groupData = insertGroupSchema.parse(req.body);
      
      const allGroups = await storage.getAllGroups();
      const newSchedule = groupData.schedule as string[] || [];
      
      for (const existingGroup of allGroups) {
        const existingSchedule = existingGroup.schedule as string[] || [];
        
        for (const newTime of newSchedule) {
          if (existingSchedule.includes(newTime)) {
            return res.status(400).json({ 
              message: `Ushbu vaqtda "${existingGroup.name}" guruhi mavjud, guruh vaqti va kunini o'zgartiring` 
            });
          }
        }
      }
      
      const group = await storage.createGroup(groupData);
      
      notificationService.broadcast({
        type: 'group_created',
        data: group,
        timestamp: new Date().toISOString()
      });
      
      return res.status(201).json(group);
    } catch (error) {
      console.error("Guruh yaratishda xatolik:", error);
      return res.status(400).json({ message: "Guruh yaratishda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
