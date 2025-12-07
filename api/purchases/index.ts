import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../lib/storage';
import { insertPurchaseSchema } from '../../shared/schema';
import { notificationService } from '../../server/notifications';
import { getSecureUserFromSession } from '../../lib/secure-auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const user = await getSecureUserFromSession(req);
      
      if (!user) {
        return res.status(401).json({ message: "Autentifikatsiya talab qilinadi" });
      }
      
      if (user.role !== 'student' && user.role !== 'admin') {
        return res.status(403).json({ message: "Faqat talabalar xarid qilishlari mumkin" });
      }
    
      const purchaseInputSchema = insertPurchaseSchema.omit({ medalsPaid: true, status: true });
      const purchaseData = purchaseInputSchema.parse({
        ...req.body,
        studentId: user.id 
      });
      
      const student = await storage.getUser(user.id);
      if (!student) {
        return res.status(404).json({ message: "Talaba topilmadi" });
      }
      
      const product = await storage.getProduct(purchaseData.productId);
      if (!product) {
        return res.status(404).json({ message: "Mahsulot topilmadi" });
      }
      
      const studentMedals = student.medals as { gold: number; silver: number; bronze: number };
      const productCost = product.medalCost as { gold: number; silver: number; bronze: number };
      
      if (studentMedals.gold < productCost.gold || 
          studentMedals.silver < productCost.silver || 
          studentMedals.bronze < productCost.bronze) {
        return res.status(400).json({ message: "Yetarli medallaringiz yo'q" });
      }
      const purchase = await storage.createPurchase({
        ...purchaseData,
        medalsPaid: productCost,
        status: "pending" 
      });
      notificationService.broadcast({
        type: 'product_created',
        data: {
          purchaseId: purchase.id,
          studentId: user.id,
          studentName: `${student.firstName} ${student.lastName}`,
          productId: product.id,
          productName: product.name,
          status: 'pending'
        },
        timestamp: new Date().toISOString(),
        role: 'admin'
      });
      
      return res.status(201).json({ 
        ...purchase, 
        message: "So'rovingiz administratorga yuborildi. Tasdiqlangandan keyin mahsulot sizga beriladi." 
      });
    } catch (error) {
      console.error("Xarid qilishda xatolik:", error);
      return res.status(400).json({ message: "Xarid qilishda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
