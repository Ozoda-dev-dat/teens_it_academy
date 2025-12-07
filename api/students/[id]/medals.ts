import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../../../lib/storage';
import { notificationService } from '../../../../server/notifications';
import { z } from 'zod';
import { getSecureUserFromSession, canTeacherAccessStudent } from '../../../../lib/secure-auth';

const medalAwardSchema = z.object({
  medalType: z.enum(['gold', 'silver', 'bronze']),
  amount: z.number().min(1).max(5),
  reason: z.string().optional().default('manual_award')
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid student ID' });
  }

  if (req.method === 'POST') {
    try {
      const { medalType, amount, reason } = medalAwardSchema.parse(req.body);
      
      const authenticatedUser = await getSecureUserFromSession(req);
      
      if (!authenticatedUser) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      let awardingUser;
      
      if (authenticatedUser.role === 'admin') {
        awardingUser = authenticatedUser;
      } else if (authenticatedUser.role === 'teacher') {
        const hasAccess = await canTeacherAccessStudent(authenticatedUser.id, id);
        if (!hasAccess) {
          return res.status(403).json({ message: "Bu o'quvchini boshqarish huquqingiz yo'q" });
        }
        awardingUser = authenticatedUser;
      } else {
        return res.status(403).json({ message: 'Access denied' });
      }

      const result = await storage.awardMedalsSafelyWithTotals(
        id, 
        medalType, 
        amount, 
        reason, 
        `awarded_by_${awardingUser.id}`
      );
      
      if (!result.success) {
        return res.status(400).json({ 
          message: result.reason || 'Medal award failed - monthly limit may be reached' 
        });
      }

      notificationService.broadcast({
        type: 'medal_awarded',
        data: {
          studentId: id,
          delta: { 
            gold: medalType === 'gold' ? amount : 0,
            silver: medalType === 'silver' ? amount : 0,
            bronze: medalType === 'bronze' ? amount : 0
          },
          totals: result.updatedTotals,
          awardedBy: awardingUser.id,
          awardedByName: `${awardingUser.firstName} ${awardingUser.lastName}`,
          reason,
          awardedAt: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        userId: awardingUser.id,
        role: awardingUser.role
      });
      
      return res.status(200).json({
        success: true,
        studentId: id,
        medalType,
        amount,
        updatedTotals: result.updatedTotals,
        awardedBy: awardingUser.id,
        reason
      });
      
    } catch (error) {
      console.error("Error awarding medals:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      }
      return res.status(500).json({ message: "Medal award failed" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
