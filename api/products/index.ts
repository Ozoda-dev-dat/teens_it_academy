import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../lib/storage';
import { insertProductSchema } from '../../shared/schema';
import { requireSecureAdmin } from '../../lib/secure-auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const products = await storage.getAllProducts();
      return res.status(200).json(products);
    } catch (error) {
      console.error("Mahsulotlarni olishda xatolik:", error);
      return res.status(500).json({ message: "Mahsulotlarni yuklashda xatolik" });
    }
  }

  if (req.method === 'POST') {
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

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
