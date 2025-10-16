/**
 * Fix subscription expiration dates that were incorrectly set to 1 day
 * Run with: npx tsx scripts/fix-subscription-dates.ts
 * Or install tsx first: npm install -g tsx
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function calculateCorrectExpirationDate(planType: string, createdAt: Date): Date {
  switch (planType) {
    case "monthly":
      return new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 gün
    case "6months":
      return new Date(createdAt.getTime() + 180 * 24 * 60 * 60 * 1000); // 6 ay (180 gün)
    case "yearly":
      return new Date(createdAt.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 yıl (365 gün)
    default:
      return new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000); // Varsayılan 30 gün
  }
}

async function fixSubscriptionDates() {
  try {
    console.log('🔍 Checking for subscriptions with incorrect expiration dates...');
    
    // 1 gün süreli abonelikleri bul (muhtemelen yanlış olanlar)
    const incorrectSubscriptions = await prisma.companySubscription.findMany({
      where: {
        expiresAt: {
          // Bugünden 2 gün sonrasından küçük olan abonelikleri bul
          lt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${incorrectSubscriptions.length} subscriptions that might need fixing`);

    if (incorrectSubscriptions.length === 0) {
      console.log('✅ No subscriptions need fixing!');
      return;
    }

    // Her aboneliği kontrol et ve düzelt
    for (const subscription of incorrectSubscriptions) {
      const correctExpirationDate = calculateCorrectExpirationDate(
        subscription.planType, 
        subscription.createdAt
      );

      console.log(`\n📝 Subscription ${subscription.orderId}:`);
      console.log(`   Plan: ${subscription.planType}`);
      console.log(`   Current expiresAt: ${subscription.expiresAt.toISOString()}`);
      console.log(`   Correct expiresAt: ${correctExpirationDate.toISOString()}`);
      console.log(`   Amount: ${subscription.amount}₺`);
      console.log(`   Status: ${subscription.status}`);

      // Sadece completed veya active status'undaki abonelikleri düzelt
      if (subscription.status === 'completed' || subscription.status === 'active') {
        await prisma.companySubscription.update({
          where: { id: subscription.id },
          data: { expiresAt: correctExpirationDate }
        });
        console.log(`   ✅ Fixed!`);
      } else {
        console.log(`   ⏭️ Skipped (status: ${subscription.status})`);
      }
    }

    console.log('\n🎉 Subscription date fixing completed!');

  } catch (error) {
    console.error('❌ Error fixing subscription dates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
fixSubscriptionDates();
