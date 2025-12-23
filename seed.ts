import { PrismaClient, FunnelStatus, RelationshipType } from '@prisma/client'

const prisma = new PrismaClient()

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDecimal(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Mexican names for realistic data
const firstNames = [
  'Juan', 'María', 'José', 'Ana', 'Carlos', 'Rosa', 'Luis', 'Carmen',
  'Pedro', 'Laura', 'Miguel', 'Sofía', 'Roberto', 'Elena', 'Diego',
  'Fernanda', 'Alejandro', 'Gabriela', 'Ricardo', 'Patricia', 'Eduardo',
  'Daniela', 'Fernando', 'Mónica', 'Jorge', 'Claudia', 'Raúl', 'Verónica',
  'Arturo', 'Adriana', 'Sergio', 'Leticia', 'Francisco', 'Mariana', 'Héctor',
  'Sandra', 'Andrés', 'Alejandra', 'Oscar', 'Paola', 'Alberto', 'Teresa',
  'Manuel', 'Isabel', 'Antonio', 'Gloria', 'Enrique', 'Lucía', 'Rafael', 'Silvia'
]

const lastNames = [
  'García', 'Rodríguez', 'Martínez', 'López', 'González', 'Hernández',
  'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez',
  'Díaz', 'Morales', 'Reyes', 'Jiménez', 'Cruz', 'Ortiz', 'Castillo',
  'Vázquez', 'Mendoza', 'Ruiz', 'Romero', 'Vargas', 'Molina', 'Castro',
  'Núñez', 'Herrera', 'Medina', 'Aguilar', 'Silva', 'Ramos', 'Delgado'
]

const productTypes = [
  'Internet 50MB',
  'Internet 100MB',
  'Internet 200MB',
  'Internet 300MB',
  'Paquete TV+Internet 100MB',
  'Paquete TV+Internet 200MB',
  'Paquete Familiar (TV+Internet+Teléfono)',
  'Internet Empresarial 500MB',
]

function generateClientName(): string {
  return `${randomItem(firstNames)} ${randomItem(lastNames)}`
}

function generatePhone(): string {
  return `+52${randomInt(55, 99)}${randomInt(1000, 9999)}${randomInt(1000, 9999)}`
}

// Get Wednesday dates for the last N weeks
function getWednesdays(count: number): Date[] {
  const wednesdays: Date[] = []
  const now = new Date()

  // Find the most recent Wednesday
  let current = new Date(now)
  current.setHours(0, 0, 0, 0)
  while (current.getDay() !== 3) {
    current.setDate(current.getDate() - 1)
  }

  for (let i = 0; i < count; i++) {
    wednesdays.push(new Date(current))
    current.setDate(current.getDate() - 7)
  }

  return wednesdays
}

// =============================================================================
// LLAVE DEL REINO THRESHOLD
// =============================================================================
const LLAVE_THRESHOLD = 15000 // $15,000 in rolling 30-day sales

// Commission rates by relationship
const COMMISSION_RATES = {
  HIJO: 0.08,      // 8%
  NIETO: 0.12,     // 12%
  BISNIETO: 0.20,  // 20%
} as const

// =============================================================================
// MAIN SEED FUNCTION
// =============================================================================

async function main() {
  // Clean existing data (order matters for foreign keys)
  await prisma.impersonationSession.deleteMany()
  await prisma.weeklyCommission.deleteMany()
  await prisma.llaveSnapshot.deleteMany()
  await prisma.commissionSnapshot.deleteMany()
  await prisma.userAchievement.deleteMany()
  await prisma.commission.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.cycle.deleteMany()
  await prisma.achievement.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleaned existing data')

  // ==========================================================================
  // CREATE ADMIN USERS
  // ==========================================================================
  const adminUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@pakoa.com',
        phone: '+521234560001',
        name: 'Admin Principal',
        role: 'ADMIN',
        isActive: true,
        activatedAt: new Date('2024-01-01'),
        totalRevenue: 0, // Admins don't make sales
      },
    }),
    prisma.user.create({
      data: {
        email: 'soporte@pakoa.com',
        phone: '+521234560002',
        name: 'Soporte Pakoa',
        role: 'ADMIN',
        isActive: true,
        activatedAt: new Date('2024-01-01'),
        totalRevenue: 0,
      },
    }),
  ])
  console.log('👑 Created admin users:', adminUsers.length)

  // ==========================================================================
  // CREATE PRODUCTS
  // ==========================================================================
  const products = await Promise.all([
    prisma.product.create({
      data: { sku: 'PLAN-BASIC', name: 'Plan Básico', description: 'Internet 50Mbps', basePrice: 499 },
    }),
    prisma.product.create({
      data: { sku: 'PLAN-PLUS', name: 'Plan Plus', description: 'Internet 100Mbps', basePrice: 699 },
    }),
    prisma.product.create({
      data: { sku: 'PLAN-PREMIUM', name: 'Plan Premium', description: 'Internet 300Mbps + TV', basePrice: 999 },
    }),
  ])
  console.log('📦 Created products:', products.length)

  // ==========================================================================
  // CREATE MLM TREE (5 levels deep to test commission cutoff)
  // ==========================================================================
  // Structure designed to demonstrate:
  // - Working chains (all have Llave)
  // - Broken chains (someone in middle lacks Llave)
  // - Deep trees (Level 4+ should NEVER get commissions)

  // Level 0: Root (Platform founder - María)
  const maria = await prisma.user.create({
    data: {
      email: 'maria@pakoa.com',
      phone: '+521234567001',
      name: 'María García',
      isActive: true,
      activatedAt: new Date('2024-01-01'),
      totalRevenue: 45000, // Well above threshold
    },
  })

  // Level 1: María's direct children (Hijos)
  // Mix of with/without Llave to demonstrate chain breaking
  const level1 = await Promise.all([
    // Carlos - HAS Llave, creates working chain
    prisma.user.create({
      data: {
        email: 'carlos@pakoa.com',
        phone: '+521234567002',
        name: 'Carlos Rodríguez',
        parentId: maria.id,
        isActive: true,
        activatedAt: new Date('2024-02-01'),
        totalRevenue: 22000, // Above $15k threshold
      },
    }),
    // Ana - HAS Llave
    prisma.user.create({
      data: {
        email: 'ana@pakoa.com',
        phone: '+521234567003',
        name: 'Ana Martínez',
        parentId: maria.id,
        isActive: true,
        activatedAt: new Date('2024-02-15'),
        totalRevenue: 18500,
      },
    }),
    // Roberto - NO Llave (breaks chain for his descendants)
    prisma.user.create({
      data: {
        email: 'roberto@pakoa.com',
        phone: '+521234567004',
        name: 'Roberto Gómez',
        parentId: maria.id,
        isActive: false, // Below threshold
        totalRevenue: 8500, // Below $15k
      },
    }),
    // Elena - HAS Llave
    prisma.user.create({
      data: {
        email: 'elena@pakoa.com',
        phone: '+521234567005',
        name: 'Elena Vázquez',
        parentId: maria.id,
        isActive: true,
        activatedAt: new Date('2024-03-01'),
        totalRevenue: 16200,
      },
    }),
    // Fernando - NO Llave
    prisma.user.create({
      data: {
        email: 'fernando@pakoa.com',
        phone: '+521234567006',
        name: 'Fernando Ruiz',
        parentId: maria.id,
        isActive: false,
        totalRevenue: 4500,
      },
    }),
  ])

  // Level 2: Grandchildren (Nietos)
  const level2 = await Promise.all([
    // Under Carlos (Carlos has Llave)
    prisma.user.create({
      data: {
        email: 'pedro@pakoa.com',
        phone: '+521234567007',
        name: 'Pedro López',
        parentId: level1[0].id, // Carlos
        isActive: true,
        activatedAt: new Date('2024-04-01'),
        totalRevenue: 19000, // HAS Llave
      },
    }),
    prisma.user.create({
      data: {
        email: 'laura@pakoa.com',
        phone: '+521234567008',
        name: 'Laura Sánchez',
        parentId: level1[0].id, // Carlos
        isActive: false,
        totalRevenue: 7500, // NO Llave
      },
    }),
    // Under Ana (Ana has Llave)
    prisma.user.create({
      data: {
        email: 'sofia@pakoa.com',
        phone: '+521234567009',
        name: 'Sofía Hernández',
        parentId: level1[1].id, // Ana
        isActive: true,
        activatedAt: new Date('2024-04-15'),
        totalRevenue: 21000, // HAS Llave
      },
    }),
    prisma.user.create({
      data: {
        email: 'alejandro@pakoa.com',
        phone: '+521234567010',
        name: 'Alejandro Flores',
        parentId: level1[1].id, // Ana
        isActive: true,
        activatedAt: new Date('2024-05-01'),
        totalRevenue: 16800, // HAS Llave
      },
    }),
    // Under Roberto (Roberto NO Llave - chain broken!)
    prisma.user.create({
      data: {
        email: 'gabriela@pakoa.com',
        phone: '+521234567011',
        name: 'Gabriela Morales',
        parentId: level1[2].id, // Roberto (no Llave)
        isActive: true,
        activatedAt: new Date('2024-05-15'),
        totalRevenue: 17500, // HAS Llave but chain broken above
      },
    }),
    // Under Elena (Elena has Llave)
    prisma.user.create({
      data: {
        email: 'daniela@pakoa.com',
        phone: '+521234567012',
        name: 'Daniela Cruz',
        parentId: level1[3].id, // Elena
        isActive: true,
        activatedAt: new Date('2024-06-01'),
        totalRevenue: 15500, // HAS Llave
      },
    }),
  ])

  // Level 3: Great-grandchildren (Bisnietos) - This is the LAST level for commissions
  const level3 = await Promise.all([
    // Under Pedro (full chain: María->Carlos->Pedro all have Llave)
    prisma.user.create({
      data: {
        email: 'diego@pakoa.com',
        phone: '+521234567013',
        name: 'Diego Ramírez',
        parentId: level2[0].id, // Pedro
        isActive: true,
        activatedAt: new Date('2024-07-01'),
        totalRevenue: 18200, // HAS Llave
      },
    }),
    prisma.user.create({
      data: {
        email: 'carmen@pakoa.com',
        phone: '+521234567014',
        name: 'Carmen Rivera',
        parentId: level2[0].id, // Pedro
        isActive: false,
        totalRevenue: 6500, // NO Llave
      },
    }),
    // Under Laura (Laura NO Llave - chain broken at level 2)
    prisma.user.create({
      data: {
        email: 'jorge@pakoa.com',
        phone: '+521234567015',
        name: 'Jorge Ortiz',
        parentId: level2[1].id, // Laura (no Llave)
        isActive: true,
        activatedAt: new Date('2024-07-15'),
        totalRevenue: 16000, // Has Llave but chain broken
      },
    }),
    // Under Sofía (full chain: María->Ana->Sofía all have Llave)
    prisma.user.create({
      data: {
        email: 'monica@pakoa.com',
        phone: '+521234567016',
        name: 'Mónica Castillo',
        parentId: level2[2].id, // Sofía
        isActive: true,
        activatedAt: new Date('2024-08-01'),
        totalRevenue: 17800,
      },
    }),
    // Under Gabriela (chain broken at Roberto level)
    prisma.user.create({
      data: {
        email: 'raul@pakoa.com',
        phone: '+521234567017',
        name: 'Raúl Herrera',
        parentId: level2[4].id, // Gabriela
        isActive: true,
        activatedAt: new Date('2024-08-15'),
        totalRevenue: 15200,
      },
    }),
    // Under Daniela (full chain: María->Elena->Daniela all have Llave)
    prisma.user.create({
      data: {
        email: 'veronica@pakoa.com',
        phone: '+521234567018',
        name: 'Verónica Medina',
        parentId: level2[5].id, // Daniela
        isActive: true,
        activatedAt: new Date('2024-09-01'),
        totalRevenue: 19500,
      },
    }),
  ])

  // Level 4: TATARANIETOS - Should NEVER receive commissions from María
  const level4 = await Promise.all([
    // Under Diego (even with full Llave chain, Level 4 = 0% commissions)
    prisma.user.create({
      data: {
        email: 'arturo@pakoa.com',
        phone: '+521234567019',
        name: 'Arturo Mendez',
        parentId: level3[0].id, // Diego
        isActive: true,
        activatedAt: new Date('2024-10-01'),
        totalRevenue: 20000, // Has Llave but too deep for María
      },
    }),
    prisma.user.create({
      data: {
        email: 'silvia@pakoa.com',
        phone: '+521234567020',
        name: 'Silvia Aguilar',
        parentId: level3[0].id, // Diego
        isActive: true,
        activatedAt: new Date('2024-10-15'),
        totalRevenue: 16500,
      },
    }),
    // Under Mónica
    prisma.user.create({
      data: {
        email: 'enrique@pakoa.com',
        phone: '+521234567021',
        name: 'Enrique Delgado',
        parentId: level3[3].id, // Mónica
        isActive: true,
        activatedAt: new Date('2024-11-01'),
        totalRevenue: 18000,
      },
    }),
  ])

  // Level 5: Even deeper - to test cutoff
  const level5 = await Promise.all([
    prisma.user.create({
      data: {
        email: 'teresa@pakoa.com',
        phone: '+521234567022',
        name: 'Teresa Ramos',
        parentId: level4[0].id, // Arturo
        isActive: true,
        activatedAt: new Date('2024-11-15'),
        totalRevenue: 17000,
      },
    }),
  ])

  const allUsers = [maria, ...level1, ...level2, ...level3, ...level4, ...level5]
  console.log('👥 Created MLM tree with', allUsers.length, 'users (5 levels deep)')
  console.log('   Level 0 (Root):', 1)
  console.log('   Level 1 (Hijos):', level1.length)
  console.log('   Level 2 (Nietos):', level2.length)
  console.log('   Level 3 (Bisnietos):', level3.length)
  console.log('   Level 4 (Tataranietos):', level4.length)
  console.log('   Level 5:', level5.length)

  // ==========================================================================
  // CREATE CYCLES (last 12 weeks)
  // ==========================================================================
  const wednesdays = getWednesdays(12)
  const cycles = await Promise.all(
    wednesdays.map((wed, i) => {
      const weekNum = 52 - i
      const endDate = new Date(wed)
      endDate.setDate(endDate.getDate() + 6)

      return prisma.cycle.create({
        data: {
          name: `2024-W${weekNum}`,
          startDate: wed,
          endDate: endDate,
          status: i === 0 ? 'OPEN' : 'COMPLETED',
          totalSales: i === 0 ? 0 : randomDecimal(10000, 30000),
          totalCommissions: i === 0 ? 0 : randomDecimal(3000, 9000),
          closedAt: i === 0 ? null : new Date(endDate.getTime() + 86400000),
          paidAt: i === 0 ? null : new Date(endDate.getTime() + 172800000),
        },
      })
    })
  )
  console.log('📅 Created cycles:', cycles.length)

  // ==========================================================================
  // CREATE SALES (distributed to show realistic commission scenarios)
  // ==========================================================================
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  const now = new Date()

  interface SaleData {
    userId: string
    userName: string
    productType: string
    amount: number
    customerName: string
    customerPhone: string
    funnelStatus: FunnelStatus
    capturedAt: Date
    quotedAt: Date | null
    scheduledAt: Date | null
    installedAt: Date | null
    cancelledAt: Date | null
  }

  const salesData: SaleData[] = []

  // Generate sales with weighted distribution toward active high-performers
  // More sales for users with Llave to make the data realistic
  for (const user of allUsers) {
    const hasLlave = Number(user.totalRevenue) >= LLAVE_THRESHOLD
    const baseSalesCount = hasLlave ? randomInt(15, 30) : randomInt(3, 10)

    for (let i = 0; i < baseSalesCount; i++) {
      const capturedAt = randomDate(threeMonthsAgo, now)
      const amount = randomDecimal(400, 1800)

      // Higher conversion rate for Llave holders
      const funnelRoll = Math.random()
      let funnelStatus: FunnelStatus
      if (hasLlave) {
        if (funnelRoll < 0.60) funnelStatus = 'INSTALADO'
        else if (funnelRoll < 0.80) funnelStatus = 'AGENDADO'
        else if (funnelRoll < 0.92) funnelStatus = 'COTIZADO'
        else if (funnelRoll < 0.97) funnelStatus = 'PROSPECTO'
        else funnelStatus = 'CANCELADO'
      } else {
        if (funnelRoll < 0.35) funnelStatus = 'INSTALADO'
        else if (funnelRoll < 0.50) funnelStatus = 'AGENDADO'
        else if (funnelRoll < 0.70) funnelStatus = 'COTIZADO'
        else if (funnelRoll < 0.85) funnelStatus = 'PROSPECTO'
        else funnelStatus = 'CANCELADO'
      }

      let quotedAt: Date | null = null
      let scheduledAt: Date | null = null
      let installedAt: Date | null = null
      let cancelledAt: Date | null = null

      if (['COTIZADO', 'AGENDADO', 'INSTALADO'].includes(funnelStatus)) {
        quotedAt = new Date(capturedAt.getTime() + randomInt(1, 3) * 86400000)
      }
      if (['AGENDADO', 'INSTALADO'].includes(funnelStatus)) {
        scheduledAt = new Date((quotedAt || capturedAt).getTime() + randomInt(2, 7) * 86400000)
      }
      if (funnelStatus === 'INSTALADO') {
        installedAt = new Date((scheduledAt || capturedAt).getTime() + randomInt(1, 5) * 86400000)
      }
      if (funnelStatus === 'CANCELADO') {
        cancelledAt = new Date(capturedAt.getTime() + randomInt(1, 14) * 86400000)
      }

      salesData.push({
        userId: user.id,
        userName: user.name,
        productType: randomItem(productTypes),
        amount,
        customerName: generateClientName(),
        customerPhone: generatePhone(),
        funnelStatus,
        capturedAt,
        quotedAt,
        scheduledAt,
        installedAt,
        cancelledAt,
      })
    }
  }

  // Create sales
  const createdSales = await prisma.sale.createManyAndReturn({
    data: salesData.map(s => ({
      userId: s.userId,
      productType: s.productType,
      amount: s.amount,
      customerName: s.customerName,
      customerPhone: s.customerPhone,
      funnelStatus: s.funnelStatus,
      capturedAt: s.capturedAt,
      quotedAt: s.quotedAt,
      scheduledAt: s.scheduledAt,
      installedAt: s.installedAt,
      cancelledAt: s.cancelledAt,
      status: s.funnelStatus === 'INSTALADO' ? 'CONFIRMED' :
              s.funnelStatus === 'CANCELADO' ? 'CANCELLED' : 'PENDING',
    })),
  })
  console.log('💰 Created sales:', createdSales.length)

  // ==========================================================================
  // CREATE LLAVE SNAPSHOTS (Weekly threshold evaluation)
  // ==========================================================================
  const llaveSnapshots: Array<{
    userId: string
    weekDate: Date
    rolling30DaySales: number
    hasLlave: boolean
  }> = []

  for (const wednesday of wednesdays) {
    const thirtyDaysAgo = new Date(wednesday)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    for (const user of allUsers) {
      // Calculate rolling 30-day sales for this user at this point
      const userSales = salesData.filter(s =>
        s.userId === user.id &&
        s.funnelStatus === 'INSTALADO' &&
        s.installedAt &&
        s.installedAt >= thirtyDaysAgo &&
        s.installedAt <= wednesday
      )

      const rolling30DaySales = userSales.reduce((sum, s) => sum + s.amount, 0)
      const hasLlave = rolling30DaySales >= LLAVE_THRESHOLD

      llaveSnapshots.push({
        userId: user.id,
        weekDate: wednesday,
        rolling30DaySales,
        hasLlave,
      })
    }
  }

  await prisma.llaveSnapshot.createMany({ data: llaveSnapshots })
  console.log('🔑 Created Llave snapshots:', llaveSnapshots.length)

  // Count users with/without Llave in most recent week
  const currentWeekSnapshots = llaveSnapshots.filter(
    s => s.weekDate.getTime() === wednesdays[0].getTime()
  )
  const withLlave = currentWeekSnapshots.filter(s => s.hasLlave).length
  const withoutLlave = currentWeekSnapshots.filter(s => !s.hasLlave).length
  console.log(`   Current week: ${withLlave} with Llave, ${withoutLlave} without`)

  // ==========================================================================
  // CREATE WEEKLY COMMISSIONS (with chain rule logic)
  // ==========================================================================
  // Build user lookup map
  const userMap = new Map(allUsers.map(u => [u.id, u]))

  // Build parent chain lookup
  function getUplineChain(userId: string): string[] {
    const chain: string[] = []
    let currentId = userMap.get(userId)?.parentId

    while (currentId && chain.length < 5) {
      chain.push(currentId)
      currentId = userMap.get(currentId)?.parentId
    }

    return chain
  }

  // Build Llave status lookup per week
  function hasLlaveInWeek(userId: string, weekDate: Date): boolean {
    return llaveSnapshots.some(
      s => s.userId === userId &&
           s.weekDate.getTime() === weekDate.getTime() &&
           s.hasLlave
    )
  }

  const weeklyCommissions: Array<{
    recipientId: string
    sourceAgentId: string
    saleId: string
    weekDate: Date
    relationship: RelationshipType
    saleAmount: number
    commissionRate: number
    commissionAmount: number
    chainValid: boolean
  }> = []

  // Process each sale and calculate commissions
  for (let weekIdx = 0; weekIdx < wednesdays.length; weekIdx++) {
    const weekDate = wednesdays[weekIdx]
    const weekStart = new Date(weekDate)
    const weekEnd = new Date(weekDate)
    weekEnd.setDate(weekEnd.getDate() + 7)

    // Find sales installed during this week
    const weekSales = createdSales.filter(sale => {
      const saleData = salesData.find(s =>
        s.userId === sale.userId &&
        s.amount === Number(sale.amount) &&
        s.customerName === sale.customerName
      )
      if (!saleData?.installedAt) return false
      return saleData.installedAt >= weekStart && saleData.installedAt < weekEnd
    })

    for (const sale of weekSales) {
      const sellerId = sale.userId
      const uplineChain = getUplineChain(sellerId)
      const saleAmount = Number(sale.amount)

      // Process up to 3 levels up (Hijo, Nieto, Bisnieto from recipient's perspective)
      for (let level = 0; level < Math.min(3, uplineChain.length); level++) {
        const recipientId = uplineChain[level]

        // Check chain validity: recipient + all intermediate nodes must have Llave
        let chainValid = hasLlaveInWeek(recipientId, weekDate)

        // For level > 0, check intermediate nodes
        for (let i = 0; i < level && chainValid; i++) {
          chainValid = chainValid && hasLlaveInWeek(uplineChain[i], weekDate)
        }

        // Determine relationship type
        let relationship: RelationshipType
        let commissionRate: number

        if (level === 0) {
          relationship = 'HIJO'
          commissionRate = COMMISSION_RATES.HIJO
        } else if (level === 1) {
          relationship = 'NIETO'
          commissionRate = COMMISSION_RATES.NIETO
        } else {
          relationship = 'BISNIETO'
          commissionRate = COMMISSION_RATES.BISNIETO
        }

        const commissionAmount = chainValid ? saleAmount * commissionRate : 0

        weeklyCommissions.push({
          recipientId,
          sourceAgentId: sellerId,
          saleId: sale.id,
          weekDate,
          relationship,
          saleAmount,
          commissionRate,
          commissionAmount,
          chainValid,
        })
      }
    }
  }

  await prisma.weeklyCommission.createMany({ data: weeklyCommissions })
  console.log('💵 Created weekly commissions:', weeklyCommissions.length)

  // Stats on chain validity
  const validChains = weeklyCommissions.filter(c => c.chainValid).length
  const brokenChains = weeklyCommissions.filter(c => !c.chainValid).length
  const totalCommissionValue = weeklyCommissions
    .filter(c => c.chainValid)
    .reduce((sum, c) => sum + c.commissionAmount, 0)
  console.log(`   Valid chains: ${validChains}, Broken chains: ${brokenChains}`)
  console.log(`   Total commission value: $${totalCommissionValue.toFixed(2)}`)

  // ==========================================================================
  // CREATE ACHIEVEMENTS
  // ==========================================================================
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        code: 'FIRST_SALE',
        name: 'Primera Venta',
        description: 'Realiza tu primera venta instalada',
        criteria: { type: 'sales_count', threshold: 1 },
        rewardType: 'BADGE_ONLY',
        displayOrder: 1,
      },
    }),
    prisma.achievement.create({
      data: {
        code: 'LLAVE_DEL_REINO',
        name: 'Llave del Reino',
        description: 'Alcanza $15,000 en ventas en 30 días',
        criteria: { type: 'revenue_30d', threshold: 15000 },
        rewardType: 'BADGE_ONLY',
        displayOrder: 2,
      },
    }),
    prisma.achievement.create({
      data: {
        code: 'TEAM_BUILDER',
        name: 'Constructor de Equipo',
        description: 'Refiere a 3 vendedores con Llave activa',
        criteria: { type: 'active_referrals', threshold: 3 },
        rewardType: 'BONUS_COMMISSION',
        rewardValue: 500,
        displayOrder: 3,
      },
    }),
    prisma.achievement.create({
      data: {
        code: 'CHAIN_MASTER',
        name: 'Maestro de Cadenas',
        description: 'Mantén una cadena activa de 3 niveles por 4 semanas',
        criteria: { type: 'chain_weeks', threshold: 4 },
        rewardType: 'BADGE_ONLY',
        displayOrder: 4,
      },
    }),
  ])
  console.log('🏆 Created achievements:', achievements.length)

  // Award achievements
  const achievementAwards = []
  for (const user of allUsers) {
    const userSalesCount = salesData.filter(
      s => s.userId === user.id && s.funnelStatus === 'INSTALADO'
    ).length

    if (userSalesCount >= 1) {
      achievementAwards.push({ userId: user.id, achievementId: achievements[0].id })
    }

    if (Number(user.totalRevenue) >= LLAVE_THRESHOLD) {
      achievementAwards.push({ userId: user.id, achievementId: achievements[1].id })
    }
  }

  await prisma.userAchievement.createMany({ data: achievementAwards })
  console.log('🎖️  Awarded achievements:', achievementAwards.length)

  // ==========================================================================
  // SUMMARY
  // ==========================================================================
  console.log('\n✅ Seed completed!')
  console.log('=' .repeat(50))
  console.log(`   👥 ${allUsers.length} users across 5 levels`)
  console.log(`   💰 ${createdSales.length} sales`)
  console.log(`   🔑 ${llaveSnapshots.length} Llave snapshots (${withLlave} current with Llave)`)
  console.log(`   💵 ${weeklyCommissions.length} weekly commission records`)
  console.log(`   📊 Chain analysis: ${validChains} valid, ${brokenChains} broken`)
  console.log('=' .repeat(50))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
