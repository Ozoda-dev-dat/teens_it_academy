import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../lib/storage';
import { requireSecureAdmin } from '../../../lib/secure-auth';
import { notificationService } from '../../../server/notifications';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const adminUser = await requireSecureAdmin(req, res);
    if (!adminUser) return;

    const { id, reason } = req.body;
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

      const rejectedPurchase = await storage.updatePurchase(id, {
        status: "rejected",
        rejectionReason: reason || "Admin tomonidan rad etildi",
        approvedById: adminUser.id,
        approvedAt: new Date()
      });

      notificationService.broadcast({
        type: 'product_updated',
        data: {
          purchaseId: id,
          studentId: purchase.studentId,
          status: 'rejected'
        },
        timestamp: new Date().toISOString()
      });

      return res.status(200).json({
        ...rejectedPurchase,
        message: "Xarid rad etildi"
      });
    } catch (error) {
      console.error("Xaridni rad etishda xatolik:", error);
      return res.status(500).json({ message: "Xaridni rad etishda xatolik" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
