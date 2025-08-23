import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../lib/storage';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const sessionUser = getUserFromSession(req);
    
    if (!sessionUser) {
      return res.status(401).json({ message: 'Autentifikatsiya talab qilinadi' });
    }

    // Get fresh user data from database
    const user = await storage.getUser(sessionUser.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Foydalanuvchi topilmadi' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ message: 'Foydalanuvchi ma\'lumotlarini olishda xatolik' });
  }
}