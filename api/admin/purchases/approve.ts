import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../lib/storage';
import { requireSecureAdmin } from '../../../lib/secure-auth';
import { notificationService } from '../../../server/notifications';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'Purchase ID talab qilinadi' });
    }

    try {
      const purchase = await storage.getPurchase(id);
      if (!purchase) {
        return res.status(404).json({ message: "Xarid topilmadi" });
      }

      if (purchase.status !== "pending") {
        return res.status(400).json({ message: "Bu xarid allaqachon tasdiqlangan yoki rad etilgan" });
      }
      const student = await storage.getUser(purchase.studentId);
      if (!student) {
        return res.status(404).json({ message: "Talaba topilmadi" });
      }

      const product = await storage.getProduct(purchase.productId);
      if (!product) {
        return res.status(404).json({ message: "Mahsulot topilmadi" });
      }

      const studentMedals = student.medals as { gold: number; silver: number; bronze: number };
      const productCost = purchase.medalsPaid as { gold: number; silver: number; bronze: number };

      if (studentMedals.gold < productCost.gold || 
          studentMedals.silver < productCost.silver || 
          studentMedals.bronze < productCost.bronze) {
        return res.status(400).json({ message: "Talabada yetarli medallar yo'q" });
      }
      const updatedMedals = {
        gold: studentMedals.gold - productCost.gold,
        silver: studentMedals.silver - productCost.silver,
        bronze: studentMedals.bronze - productCost.bronze
      };

      await storage.updateUser(purchase.studentId, { medals: updatedMedals });

      const approvedPurchase = await storage.updatePurchase(id, {
        status: "approved",
        approvedById: adminUser.id,
        approvedAt: new Date()
      });

      notificationService.broadcast({
        type: 'product_updated',
        data: {
          purchaseId: id,
          studentId: purchase.studentId,
          status: 'approved'
        },
        timestamp: new Date().toISOString()
      });

      return res.status(200).json({
        ...approvedPurchase,
        message: "Xarid tasdiqlandi va medallar yechib olindi!"
      });
    } catch (error) {
      console.error("Xaridni tasdiqlashda xatolik:", error);
      return res.status(500).json({ message: "Xaridni tasdiqlashda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
