import type { Trophy, TrophyCategory, UserTrophy } from '@/types'

// All 13 trophies defined
export const trophies: Trophy[] = [
  // Category 1: Ventas (2)
  {
    id: 'trophy-1',
    slug: 'quetzal-iniciatico',
    name: 'Quetzal Iniciático',
    description: 'Completa tu primera venta instalada',
    category: 'ventas',
    imagePath: '/images/trophies/quetzal-iniciatico.png',
    conditionType: 'first_sale',
    conditionValue: 1,
    sortOrder: 1,
  },
  {
    id: 'trophy-2',
    slug: 'llave-del-reino',
    name: 'Llave del Reino',
    description: 'Alcanza $15,000 en ventas de 30 días',
    category: 'ventas',
    imagePath: '/images/trophies/llave-del-reino.png',
    conditionType: 'sales_30d',
    conditionValue: 15000,
    sortOrder: 2,
  },

  // Category 2: Legado (3)
  {
    id: 'trophy-3',
    slug: 'llave-del-quetzal',
    name: 'Llave del Quetzal',
    description: 'Tu hijo obtiene la Llave del Reino',
    category: 'legado',
    imagePath: '/images/trophies/llave-del-quetzal.png',
    conditionType: 'child_has_llave',
    conditionValue: 1,
    sortOrder: 3,
  },
  {
    id: 'trophy-4',
    slug: 'llave-del-dragon',
    name: 'Llave del Dragón',
    description: 'Tu nieto obtiene la Llave del Reino',
    category: 'legado',
    imagePath: '/images/trophies/llave-del-dragon.png',
    conditionType: 'grandchild_has_llave',
    conditionValue: 1,
    sortOrder: 4,
  },
  {
    id: 'trophy-5',
    slug: 'meta-trono',
    name: 'Meta Trono',
    description: 'Ten 6 hijos con Llave del Reino al mismo tiempo',
    category: 'legado',
    imagePath: '/images/trophies/meta-trono.png',
    conditionType: 'children_with_llave',
    conditionValue: 6,
    sortOrder: 5,
  },

  // Category 3: Campañas (3)
  {
    id: 'trophy-6',
    slug: 'sello-aprendiz-agua',
    name: 'Sello del Aprendiz de Agua',
    description: 'Crea tu primera campaña',
    category: 'campanas',
    imagePath: '/images/trophies/sello-aprendiz-agua.png',
    conditionType: 'campaign_count',
    conditionValue: 1,
    sortOrder: 6,
  },
  {
    id: 'trophy-7',
    slug: 'sortija-maestro-agua',
    name: 'Sortija del Maestro de Agua',
    description: 'Crea tu segunda campaña',
    category: 'campanas',
    imagePath: '/images/trophies/sortija-maestro-agua.png',
    conditionType: 'campaign_count',
    conditionValue: 2,
    sortOrder: 7,
  },
  {
    id: 'trophy-8',
    slug: 'diamante-paragon-agua',
    name: 'Diamante del Paragón de Agua',
    description: 'Crea tu tercera campaña',
    category: 'campanas',
    imagePath: '/images/trophies/diamante-paragon-agua.png',
    conditionType: 'campaign_count',
    conditionValue: 3,
    sortOrder: 8,
  },

  // Category 4: Consistencia (2)
  {
    id: 'trophy-9',
    slug: 'esmeralda-de-pakoa',
    name: 'Esmeralda de Pakoa',
    description: 'Mantén la Llave del Reino por 4 semanas consecutivas',
    category: 'consistencia',
    imagePath: '/images/trophies/esmeralda-de-pakoa.png',
    conditionType: 'consecutive_llave_weeks',
    conditionValue: 4,
    sortOrder: 9,
  },
  {
    id: 'trophy-10',
    slug: 'daga-ancestral',
    name: 'Daga Ancestral',
    description: 'Mantén la Llave del Reino por 8 semanas consecutivas',
    category: 'consistencia',
    imagePath: '/images/trophies/daga-ancestral.png',
    conditionType: 'consecutive_llave_weeks',
    conditionValue: 8,
    sortOrder: 10,
  },

  // Category 5: Ingresos (3)
  {
    id: 'trophy-11',
    slug: 'corona-del-principe',
    name: 'Corona del Príncipe',
    description: 'Gana más de $750 en una semana',
    category: 'ingresos',
    imagePath: '/images/trophies/corona-del-principe.png',
    conditionType: 'weekly_income',
    conditionValue: 750,
    sortOrder: 11,
  },
  {
    id: 'trophy-12',
    slug: 'corona-del-imperio',
    name: 'Corona del Imperio',
    description: 'Gana más de $1,500 en una semana',
    category: 'ingresos',
    imagePath: '/images/trophies/corona-del-imperio.png',
    conditionType: 'weekly_income',
    conditionValue: 1500,
    sortOrder: 12,
  },
  {
    id: 'trophy-13',
    slug: 'penacho-de-pakoa',
    name: 'Penacho de Pakoa',
    description: 'Campeón de la semana - Mayor ingreso semanal',
    category: 'ingresos',
    imagePath: '/images/trophies/penacho-de-pakoa.png',
    conditionType: 'top_earner',
    conditionValue: 1,
    sortOrder: 13,
    isSpecial: true,  // Rotating trophy
  },
]

// Mock user trophies - which users have earned which trophies
export const mockUserTrophies: UserTrophy[] = [
  // María García (user-maria) - Has Llave, has hijos, has campaigns
  { userId: 'user-maria', trophyId: 'trophy-1', earnedAt: '2024-02-01' },  // Quetzal Iniciático
  { userId: 'user-maria', trophyId: 'trophy-2', earnedAt: '2024-03-15' },  // Llave del Reino
  { userId: 'user-maria', trophyId: 'trophy-3', earnedAt: '2024-05-01' },  // Llave del Quetzal
  { userId: 'user-maria', trophyId: 'trophy-6', earnedAt: '2024-03-15' },  // Sello Aprendiz
  { userId: 'user-maria', trophyId: 'trophy-7', earnedAt: '2024-06-01' },  // Sortija Maestro
  { userId: 'user-maria', trophyId: 'trophy-9', earnedAt: '2024-04-15' },  // Esmeralda
  { userId: 'user-maria', trophyId: 'trophy-11', earnedAt: '2024-04-01' }, // Corona Príncipe
  { userId: 'user-maria', trophyId: 'trophy-12', earnedAt: '2024-05-15' }, // Corona Imperio

  // Roberto Mendoza (user-roberto) - Deep chain, has grandchildren with Llave
  { userId: 'user-roberto', trophyId: 'trophy-1', earnedAt: '2024-01-15' },
  { userId: 'user-roberto', trophyId: 'trophy-2', earnedAt: '2024-02-20' },
  { userId: 'user-roberto', trophyId: 'trophy-3', earnedAt: '2024-04-01' },
  { userId: 'user-roberto', trophyId: 'trophy-4', earnedAt: '2024-06-15' },  // Llave del Dragón
  { userId: 'user-roberto', trophyId: 'trophy-6', earnedAt: '2024-02-20' },
  { userId: 'user-roberto', trophyId: 'trophy-7', earnedAt: '2024-05-01' },
  { userId: 'user-roberto', trophyId: 'trophy-8', earnedAt: '2024-08-01' },  // Diamante Paragón
  { userId: 'user-roberto', trophyId: 'trophy-9', earnedAt: '2024-03-20' },
  { userId: 'user-roberto', trophyId: 'trophy-10', earnedAt: '2024-05-20' }, // Daga Ancestral
  { userId: 'user-roberto', trophyId: 'trophy-11', earnedAt: '2024-03-01' },
  { userId: 'user-roberto', trophyId: 'trophy-13', earnedAt: '2024-12-18', isCurrentHolder: true }, // Penacho (current)

  // Patricia Navarro (user-patricia)
  { userId: 'user-patricia', trophyId: 'trophy-1', earnedAt: '2024-03-01' },
  { userId: 'user-patricia', trophyId: 'trophy-2', earnedAt: '2024-04-15' },
  { userId: 'user-patricia', trophyId: 'trophy-6', earnedAt: '2024-04-15' },
  { userId: 'user-patricia', trophyId: 'trophy-11', earnedAt: '2024-05-01' },

  // Miguel Torres (user-miguel)
  { userId: 'user-miguel', trophyId: 'trophy-1', earnedAt: '2024-04-01' },
  { userId: 'user-miguel', trophyId: 'trophy-2', earnedAt: '2024-06-01' },
  { userId: 'user-miguel', trophyId: 'trophy-6', earnedAt: '2024-06-01' },

  // Ana López (user-ana) - Newer user, fewer trophies
  { userId: 'user-ana', trophyId: 'trophy-1', earnedAt: '2024-08-15' },

  // Carlos Ruiz (user-carlos)
  { userId: 'user-carlos', trophyId: 'trophy-1', earnedAt: '2024-07-01' },
  { userId: 'user-carlos', trophyId: 'trophy-2', earnedAt: '2024-09-15' },
  { userId: 'user-carlos', trophyId: 'trophy-6', earnedAt: '2024-09-15' },
]

// Helper functions
export function getAllTrophies(): Trophy[] {
  return trophies
}

export function getTrophyById(id: string): Trophy | undefined {
  return trophies.find(t => t.id === id)
}

export function getTrophyBySlug(slug: string): Trophy | undefined {
  return trophies.find(t => t.slug === slug)
}

export function getTrophiesByCategory(category: TrophyCategory): Trophy[] {
  return trophies.filter(t => t.category === category)
}

export function getUserTrophies(userId: string): UserTrophy[] {
  return mockUserTrophies.filter(ut => ut.userId === userId)
}

export function getUserEarnedTrophies(userId: string): Trophy[] {
  const userTrophyIds = getUserTrophies(userId).map(ut => ut.trophyId)
  return trophies.filter(t => userTrophyIds.includes(t.id))
}

export function getUserTrophyStatus(userId: string, trophyId: string): UserTrophy | undefined {
  return mockUserTrophies.find(ut => ut.userId === userId && ut.trophyId === trophyId)
}

export function getTrophyCount(userId: string): { earned: number; total: number } {
  const earned = getUserTrophies(userId).length
  return { earned, total: trophies.length }
}

export function getCurrentTopEarner(): { userId: string; trophy: Trophy } | undefined {
  const topEarnerTrophy = mockUserTrophies.find(ut => ut.trophyId === 'trophy-13' && ut.isCurrentHolder)
  if (!topEarnerTrophy) return undefined
  const trophy = getTrophyById('trophy-13')
  if (!trophy) return undefined
  return { userId: topEarnerTrophy.userId, trophy }
}

// Map of user IDs to names for display
const userNames: Record<string, string> = {
  'user-maria': 'María García',
  'user-roberto': 'Roberto Mendoza',
  'user-patricia': 'Patricia Navarro',
  'user-miguel': 'Miguel Torres',
  'user-ana': 'Ana López',
  'user-carlos': 'Carlos Ruiz',
}

export function getTopEarnerName(): string | undefined {
  const topEarner = getCurrentTopEarner()
  if (!topEarner) return undefined
  return userNames[topEarner.userId] || 'Unknown'
}

export const trophyCategories: { key: TrophyCategory; labelKey: string }[] = [
  { key: 'ventas', labelKey: 'trophies.categories.ventas' },
  { key: 'legado', labelKey: 'trophies.categories.legado' },
  { key: 'campanas', labelKey: 'trophies.categories.campanas' },
  { key: 'consistencia', labelKey: 'trophies.categories.consistencia' },
  { key: 'ingresos', labelKey: 'trophies.categories.ingresos' },
]
