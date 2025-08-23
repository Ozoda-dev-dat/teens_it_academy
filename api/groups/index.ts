import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../lib/storage';
import { insertGroupSchema } from '../../shared/schema';

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
    // GET /api/groups - Get all groups
    try {
      const groups = await storage.getAllGroups();
      return res.status(200).json(groups);
    } catch (error) {
      console.error("Guruhlarni olishda xatolik:", error);
      return res.status(500).json({ message: "Guruhlarni yuklashda xatolik" });
    }
  }

  if (req.method === 'POST') {
    // POST /api/groups - Create group (admin only)
    if (!requireAdmin(req, res)) return;

    try {
      const groupData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(groupData);
      return res.status(201).json(group);
    } catch (error) {
      console.error("Guruh yaratishda xatolik:", error);
      return res.status(400).json({ message: "Guruh yaratishda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}