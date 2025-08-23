import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../lib/storage';
import { insertProductSchema } from '../../shared/schema';

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
    // GET /api/products - Get all products
    try {
      const products = await storage.getAllProducts();
      return res.status(200).json(products);
    } catch (error) {
      console.error("Mahsulotlarni olishda xatolik:", error);
      return res.status(500).json({ message: "Mahsulotlarni yuklashda xatolik" });
    }
  }

  if (req.method === 'POST') {
    // POST /api/products - Create product (admin only)
    if (!requireAdmin(req, res)) return;

    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      return res.status(201).json(product);
    } catch (error) {
      console.error("Mahsulot yaratishda xatolik:", error);
      return res.status(400).json({ message: "Mahsulot yaratishda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}