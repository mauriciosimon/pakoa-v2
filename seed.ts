import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.userAchievement.deleteMany()
  await prisma.commission.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.cycle.deleteMany()
  await prisma.achievement.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleaned existing data')

  // Create Products (telecom plans)
  const products = await Promise.all([
    prisma.product.create({
      data: {
        sku: 'PLAN-BASIC',
        name: 'Plan Básico',
        description: 'Internet 50Mbps + 500 min llamadas',
        basePrice: 29.99,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'PLAN-PLUS',
        name: 'Plan Plus',
        description: 'Internet 100Mbps + llamadas ilimitadas',
        basePrice: 49.99,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'PLAN-PREMIUM',
        name: 'Plan Premium',
        description: 'Internet 300Mbps + llamadas + TV',
        basePrice: 89.99,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'ADDON-TV',
        name: 'Pack TV Extra',
        description: '50 canales adicionales HD',
        basePrice: 15.99,
      },
    }),
  ])
  console.log('📦 Created products:', products.length)

  // Create MLM Tree (3 levels)
  // Level 0: María (founder/top)
  const maria = await prisma.user.create({
    data: {
      email: 'maria@pakoa.com',
      phone: '+1234567001',
      name: 'María García',
      isActive: true,
      activatedAt: new Date('2024-01-01'),
      totalRevenue: 15000,
    },
  })

  // Level 1: Carlos & Ana (referred by María)
  const carlos = await prisma.user.create({
    data: {
      email: 'carlos@pakoa.com',
      phone: '+1234567002',
      name: 'Carlos Rodríguez',
      parentId: maria.id,
      isActive: true,
      activatedAt: new Date('2024-02-15'),
      totalRevenue: 5200,
    },
  })

  const ana = await prisma.user.create({
    data: {
      email: 'ana@pakoa.com',
      phone: '+1234567003',
      name: 'Ana Martínez',
      parentId: maria.id,
      isActive: true,
      activatedAt: new Date('2024-03-01'),
      totalRevenue: 3800,
    },
  })

  // Level 2: Pedro & Laura (referred by Carlos), Sofia (referred by Ana)
  const pedro = await prisma.user.create({
    data: {
      email: 'pedro@pakoa.com',
      phone: '+1234567004',
      name: 'Pedro López',
      parentId: carlos.id,
      isActive: true,
      activatedAt: new Date('2024-04-10'),
      totalRevenue: 2100,
    },
  })

  const laura = await prisma.user.create({
    data: {
      email: 'laura@pakoa.com',
      phone: '+1234567005',
      name: 'Laura Sánchez',
      parentId: carlos.id,
      isActive: false, // Not yet activated
      totalRevenue: 750, // Below $1000 threshold
    },
  })

  const sofia = await prisma.user.create({
    data: {
      email: 'sofia@pakoa.com',
      phone: '+1234567006',
      name: 'Sofía Hernández',
      parentId: ana.id,
      isActive: true,
      activatedAt: new Date('2024-05-20'),
      totalRevenue: 1200,
    },
  })

  // Level 3: Diego (referred by Pedro) - max depth
  const diego = await prisma.user.create({
    data: {
      email: 'diego@pakoa.com',
      phone: '+1234567007',
      name: 'Diego Ramírez',
      parentId: pedro.id,
      isActive: false,
      totalRevenue: 400,
    },
  })

  console.log('👥 Created MLM tree:')
  console.log('   María (L0)')
  console.log('   ├── Carlos (L1)')
  console.log('   │   ├── Pedro (L2)')
  console.log('   │   │   └── Diego (L3)')
  console.log('   │   └── Laura (L2, inactive)')
  console.log('   └── Ana (L1)')
  console.log('       └── Sofía (L2)')

  // Create Cycles
  const currentCycle = await prisma.cycle.create({
    data: {
      name: '2024-W50',
      startDate: new Date('2024-12-09'),
      endDate: new Date('2024-12-15'),
      status: 'OPEN',
    },
  })

  const pastCycle = await prisma.cycle.create({
    data: {
      name: '2024-W49',
      startDate: new Date('2024-12-02'),
      endDate: new Date('2024-12-08'),
      status: 'COMPLETED',
      totalSales: 1250.50,
      totalCommissions: 450.25,
      closedAt: new Date('2024-12-09'),
      paidAt: new Date('2024-12-11'),
    },
  })
  console.log('📅 Created cycles:', 2)

  // Create Campaigns (for active users)
  const mariaCampaign = await prisma.campaign.create({
    data: {
      userId: maria.id,
      name: 'María - Diciembre',
      totalBudget: 800, // Max (15000/2.5 = 6000, capped at 800)
      remainingBudget: 650,
      spentBudget: 150,
      weekStartDate: new Date('2024-12-09'),
      weekEndDate: new Date('2024-12-15'),
    },
  })

  const carlosCampaign = await prisma.campaign.create({
    data: {
      userId: carlos.id,
      name: 'Carlos - Diciembre',
      totalBudget: 800, // 5200/2.5 = 2080, capped at 800
      remainingBudget: 800,
      spentBudget: 0,
      weekStartDate: new Date('2024-12-09'),
      weekEndDate: new Date('2024-12-15'),
    },
  })
  console.log('🎯 Created campaigns:', 2)

  // Create Sales
  const sales = await Promise.all([
    // María's sales
    prisma.sale.create({
      data: {
        userId: maria.id,
        productId: products[2].id, // Premium
        quantity: 2,
        unitPrice: 89.99,
        totalPrice: 179.98,
        cycleId: currentCycle.id,
        campaignId: mariaCampaign.id,
        customerName: 'Juan Pérez',
        customerPhone: '+1234560001',
        status: 'CONFIRMED',
      },
    }),
    // Carlos's sales
    prisma.sale.create({
      data: {
        userId: carlos.id,
        productId: products[1].id, // Plus
        quantity: 3,
        unitPrice: 49.99,
        totalPrice: 149.97,
        cycleId: currentCycle.id,
        customerName: 'Rosa Díaz',
        customerEmail: 'rosa@email.com',
        status: 'CONFIRMED',
      },
    }),
    // Pedro's sale
    prisma.sale.create({
      data: {
        userId: pedro.id,
        productId: products[0].id, // Basic
        quantity: 1,
        unitPrice: 29.99,
        totalPrice: 29.99,
        cycleId: currentCycle.id,
        customerName: 'Luis Moreno',
        status: 'PENDING',
      },
    }),
    // Sofia's sale
    prisma.sale.create({
      data: {
        userId: sofia.id,
        productId: products[1].id, // Plus
        quantity: 1,
        unitPrice: 49.99,
        totalPrice: 49.99,
        cycleId: currentCycle.id,
        customerName: 'Carmen Vega',
        status: 'CONFIRMED',
      },
    }),
  ])
  console.log('💰 Created sales:', sales.length)

  // Create Commissions for Carlos's sale (to demonstrate MLM tree)
  // Carlos sells $149.97 → commissions flow up
  await Promise.all([
    // Carlos gets 30% personal
    prisma.commission.create({
      data: {
        userId: carlos.id,
        saleId: sales[1].id,
        type: 'PERSONAL',
        level: null,
        rate: 0.30,
        amount: 44.99, // 149.97 * 0.30
        cycleId: currentCycle.id,
        status: 'PENDING',
      },
    }),
    // María (L1 above Carlos) gets 8%
    prisma.commission.create({
      data: {
        userId: maria.id,
        saleId: sales[1].id,
        type: 'LEVEL_1',
        level: 1,
        rate: 0.08,
        amount: 12.00, // 149.97 * 0.08
        cycleId: currentCycle.id,
        status: 'PENDING',
      },
    }),
  ])
  console.log('💸 Created commissions for MLM tree')

  // Create Achievements
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        code: 'FIRST_SALE',
        name: 'Primera Venta',
        description: 'Realiza tu primera venta',
        criteria: { type: 'sales_count', threshold: 1 },
        rewardType: 'BADGE_ONLY',
        displayOrder: 1,
      },
    }),
    prisma.achievement.create({
      data: {
        code: 'ACTIVATED',
        name: 'Activado',
        description: 'Alcanza $1,000 en ventas para activarte',
        criteria: { type: 'revenue', threshold: 1000 },
        rewardType: 'BUDGET_BOOST',
        rewardValue: 50,
        displayOrder: 2,
      },
    }),
    prisma.achievement.create({
      data: {
        code: 'TEAM_BUILDER',
        name: 'Constructor de Equipo',
        description: 'Refiere a 3 vendedores activos',
        criteria: { type: 'active_referrals', threshold: 3 },
        rewardType: 'BONUS_COMMISSION',
        rewardValue: 100,
        displayOrder: 3,
      },
    }),
    prisma.achievement.create({
      data: {
        code: 'REVENUE_5K',
        name: 'Club 5K',
        description: 'Genera $5,000 en ventas totales',
        criteria: { type: 'revenue', threshold: 5000 },
        rewardType: 'BADGE_ONLY',
        displayOrder: 4,
      },
    }),
  ])
  console.log('🏆 Created achievements:', achievements.length)

  // Award achievements to users
  await Promise.all([
    prisma.userAchievement.create({
      data: { userId: maria.id, achievementId: achievements[0].id },
    }),
    prisma.userAchievement.create({
      data: { userId: maria.id, achievementId: achievements[1].id },
    }),
    prisma.userAchievement.create({
      data: { userId: maria.id, achievementId: achievements[3].id },
    }),
    prisma.userAchievement.create({
      data: { userId: carlos.id, achievementId: achievements[0].id },
    }),
    prisma.userAchievement.create({
      data: { userId: carlos.id, achievementId: achievements[1].id },
    }),
    prisma.userAchievement.create({
      data: { userId: carlos.id, achievementId: achievements[3].id },
    }),
  ])
  console.log('🎖️  Awarded achievements to users')

  console.log('\n✅ Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
