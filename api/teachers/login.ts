import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { storage } from '../../lib/storage';
import { scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function verifyPassword(password: string, hash: string) {
  const [hashedPassword, salt] = hash.split(".");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return buf.toString("hex") === hashedPassword;
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = loginSchema.parse(req.body);
    
    console.log(`🔍 Teacher login attempt: { email: '${email}', passwordLength: ${password.length} }`);

    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      console.log('👤 User found: NO');
      console.log('❌ User not found');
      return res.status(401).json({ message: "Email yoki parol noto'g'ri" });
    }

    if (user.role !== 'teacher') {
      console.log('👤 User role:', user.role);
      console.log('❌ User is not a teacher');
      return res.status(401).json({ message: "Faqat o'qituvchilar uchun kirish" });
    }

    console.log('👤 Teacher found: YES');

    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      console.log('🔐 Password match: false');
      console.log('❌ Invalid password');
      return res.status(401).json({ message: "Email yoki parol noto'g'ri" });
    }

    console.log('🔐 Password match: true');
    console.log('✅ Teacher login successful');

    const { password: _, ...userWithoutPassword } = user;

    
    return res.status(410).json({ 
      message: "Bu endpoint xavfsizlik yangilanishi tufayli o'chirildi. Iltimos /api/login dan foydalaning.",
      redirectTo: "/api/login",
      securityNote: "Yangi xavfsiz sessiya tizimi PostgreSQL asosida ishlaydi"
    });

  } catch (error) {
    console.error('Teacher login error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Ma'lumotlarni to'g'ri kiriting",
        errors: error.errors
      });
    }

    return res.status(500).json({ message: "Tizimda xatolik yuz berdi" });
  }
}
