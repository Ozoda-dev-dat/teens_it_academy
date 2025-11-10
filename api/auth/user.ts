import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../lib/storage';
import { getSecureUserFromSession } from '../../lib/secure-auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = await getSecureUserFromSession(req);
    
    if (!user) {
      return res.status(401).json({ message: 'Autentifikatsiya talab qilinadi' });
    }
    

    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ message: 'Foydalanuvchi ma\'lumotlarini olishda xatolik' });
  }
}
