import type { VercelRequest, VercelResponse } from '@vercel/node';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { storage } from '../../lib/storage';
import { insertUserSchema } from '../../shared/schema';
import { z } from 'zod';

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
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = loginSchema.parse(req.body);
    
    console.log(`🔍 Login attempt: { email: '${email}', passwordLength: ${password.length} }`);

    // Find user by email
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      console.log('👤 User found: NO');
      console.log('❌ User not found');
      return res.status(401).json({ message: "Email yoki parol noto'g'ri" });
    }

    console.log('👤 User found: YES');

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      console.log('🔐 Password match: false');
      console.log('❌ Invalid password');
      return res.status(401).json({ message: "Email yoki parol noto'g'ri" });
    }

    console.log('🔐 Password match: true');
    console.log('✅ Login successful');

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Set user session in cookie (simple approach for Vercel)
    const sessionData = JSON.stringify(userWithoutPassword);
    const sessionCookie = Buffer.from(sessionData).toString('base64');
    
    res.setHeader('Set-Cookie', `session=${sessionCookie}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=strict`);

    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Login error:', error);
    return res.status(400).json({ message: 'Login ma\'lumotlarida xatolik' });
  }
}