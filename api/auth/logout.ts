import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    res.setHeader('Set-Cookie', 'session=; HttpOnly; Path=/; Max-Age=0; SameSite=strict');
    
    return res.status(410).json({ 
      message: 'Bu endpoint xavfsizlik yangilanishi tufayli o\'chirildi. Iltimos /api/logout dan foydalaning.',
      redirectTo: '/api/logout',
      securityNote: 'Yangi xavfsiz sessiya tizimi PostgreSQL asosida ishlaydi'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Logout da xatolik' });
  }
}
