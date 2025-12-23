/**
 * Centralized mock data for the entire application.
 * This is the SINGLE SOURCE OF TRUTH for all user and sales data.
 * All components should import from here to ensure consistency.
 */

import type { User } from '@/types'

// Extended user type with all the fields needed across the app
export interface MockUser extends User {
  sales30d: number
  communitySize: number
  level: number
  parentName: string | undefined
  lastSaleDate: string | undefined
  llaveHistory: { week: string; sales: number; hasLlave: boolean }[]
  // Team-specific fields
  pendingCount: number
}

// Llave del Reino threshold
export const LLAVE_THRESHOLD = 15000

// Helper to check if user has Llave
export const hasLlave = (sales30d: number) => sales30d >= LLAVE_THRESHOLD

// Helper to check if user is at risk
export const isAtRisk = (sales30d: number) => sales30d >= 12000 && sales30d < LLAVE_THRESHOLD

// Helper to generate Llave history based on current sales
const generateLlaveHistory = (currentSales: number): { week: string; sales: number; hasLlave: boolean }[] => {
  const weeks = ['2024-12-18', '2024-12-11', '2024-12-04', '2024-11-27']
  return weeks.map((week, idx) => {
    // Add some variation to historical sales
    const variation = (Math.random() - 0.5) * 4000
    const historicalSales = Math.max(0, currentSales + variation - (idx * 1000))
    return {
      week,
      sales: Math.round(historicalSales),
      hasLlave: historicalSales >= LLAVE_THRESHOLD
    }
  })
}

/**
 * All users in the system with their complete data.
 *
 * Tree Structure (27 users total):
 *
 * María García (Level 0 - Root)
 * ├── Carlos Rodríguez (Level 1)
 * │   ├── Pedro López (Level 2)
 * │   │   ├── Diego Ramírez (Level 3) - bisnieto, gets 20% commission
 * │   │   │   └── Valentina Mora (Level 4) - tataranieto, NO commission
 * │   │   │       └── Andrés Jiménez (Level 5) - beyond, NO commission
 * │   │   └── Gabriela Torres (Level 3)
 * │   └── Laura Sánchez (Level 2)
 * │       └── Ricardo Vargas (Level 3)
 * ├── Ana Martínez (Level 1)
 * │   ├── Sofía Hernández (Level 2)
 * │   │   └── Miguel Ángel Reyes (Level 3)
 * │   │       └── Camila Ortiz (Level 4) - tataranieto, NO commission
 * │   └── Alejandro Flores (Level 2)
 * │       └── Isabella Cruz (Level 3)
 * ├── Roberto Mendoza (Level 1)
 * │   ├── Patricia Navarro (Level 2)
 * │   │   ├── Daniel Guerrero (Level 3)
 * │   │   │   └── Lucía Peña (Level 4) - tataranieto, NO commission
 * │   │   │       └── Mateo Silva (Level 5) - beyond, NO commission
 * │   │   └── Carmen Delgado (Level 3)
 * │   └── José Luis Ramos (Level 2)
 * │       └── Adriana Moreno (Level 3)
 * ├── Elena Vázquez (Level 1)
 * │   └── Raúl Herrera (Level 2)
 * │       └── Natalia Campos (Level 3)
 * └── Fernando Castro (Level 1)
 *     └── Jorge Ortiz (Level 2)
 *         └── Paula Medina (Level 3)
 *             └── Sebastián Rojas (Level 4) - tataranieto, NO commission
 *
 * Commission Rules:
 * - Hijo (Level 1 from viewer): 8%
 * - Nieto (Level 2 from viewer): 12%
 * - Bisnieto (Level 3 from viewer): 20%
 * - Tataranieto+ (Level 4+ from viewer): 0% - NO COMMISSION
 */
export const mockUsers: MockUser[] = [
  // ============ LEVEL 0 - ROOT ============
  {
    id: 'user-maria',
    name: 'María García',
    email: 'maria@pakoa.com',
    phone: '+521234567001',
    isActive: true,
    activatedAt: '2024-01-01T00:00:00Z',
    totalRevenue: 85000,
    role: 'agent',
    createdAt: '2024-01-01T00:00:00Z',
    sales30d: 18500,
    communitySize: 26,
    level: 0,
    parentName: undefined,
    parentId: undefined,
    lastSaleDate: '2024-12-20',
    pendingCount: 5,
    llaveHistory: generateLlaveHistory(18500),
  },

  // ============ LEVEL 1 - HIJOS (5 users) ============
  {
    id: 'user-carlos',
    name: 'Carlos Rodríguez',
    email: 'carlos@pakoa.com',
    phone: '+521234567002',
    isActive: true,
    activatedAt: '2024-02-15T00:00:00Z',
    totalRevenue: 52000,
    role: 'agent',
    createdAt: '2024-02-15T00:00:00Z',
    parentId: 'user-maria',
    sales30d: 16200,
    communitySize: 7,
    level: 1,
    parentName: 'María García',
    lastSaleDate: '2024-12-19',
    pendingCount: 3,
    llaveHistory: generateLlaveHistory(16200),
  },
  {
    id: 'user-ana',
    name: 'Ana Martínez',
    email: 'ana@pakoa.com',
    phone: '+521234567003',
    isActive: false,
    activatedAt: '2024-03-01T00:00:00Z',
    totalRevenue: 38000,
    role: 'agent',
    createdAt: '2024-03-01T00:00:00Z',
    parentId: 'user-maria',
    sales30d: 12800,
    communitySize: 4,
    level: 1,
    parentName: 'María García',
    lastSaleDate: '2024-12-18',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(12800),
  },
  {
    id: 'user-roberto',
    name: 'Roberto Mendoza',
    email: 'roberto@pakoa.com',
    phone: '+521234567008',
    isActive: true,
    activatedAt: '2024-02-20T00:00:00Z',
    totalRevenue: 67000,
    role: 'agent',
    createdAt: '2024-02-20T00:00:00Z',
    parentId: 'user-maria',
    sales30d: 19500,
    communitySize: 8,
    level: 1,
    parentName: 'María García',
    lastSaleDate: '2024-12-21',
    pendingCount: 4,
    llaveHistory: generateLlaveHistory(19500),
  },
  {
    id: 'user-elena',
    name: 'Elena Vázquez',
    email: 'elena@pakoa.com',
    phone: '+521234567009',
    isActive: true,
    activatedAt: '2024-03-10T00:00:00Z',
    totalRevenue: 41000,
    role: 'agent',
    createdAt: '2024-03-10T00:00:00Z',
    parentId: 'user-maria',
    sales30d: 15800,
    communitySize: 2,
    level: 1,
    parentName: 'María García',
    lastSaleDate: '2024-12-17',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(15800),
  },
  {
    id: 'user-fernando',
    name: 'Fernando Castro',
    email: 'fernando@pakoa.com',
    phone: '+521234567010',
    isActive: false,
    activatedAt: '2024-03-15T00:00:00Z',
    totalRevenue: 28000,
    role: 'agent',
    createdAt: '2024-03-15T00:00:00Z',
    parentId: 'user-maria',
    sales30d: 11200,
    communitySize: 3,
    level: 1,
    parentName: 'María García',
    lastSaleDate: '2024-12-14',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(11200),
  },

  // ============ LEVEL 2 - NIETOS (9 users) ============
  // Children of Carlos
  {
    id: 'user-pedro',
    name: 'Pedro López',
    email: 'pedro@pakoa.com',
    phone: '+521234567004',
    isActive: true,
    activatedAt: '2024-04-10T00:00:00Z',
    totalRevenue: 35000,
    role: 'agent',
    createdAt: '2024-04-10T00:00:00Z',
    parentId: 'user-carlos',
    sales30d: 17100,
    communitySize: 4,
    level: 2,
    parentName: 'Carlos Rodríguez',
    lastSaleDate: '2024-12-21',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(17100),
  },
  {
    id: 'user-laura',
    name: 'Laura Sánchez',
    email: 'laura@pakoa.com',
    phone: '+521234567005',
    isActive: false,
    activatedAt: '2024-04-20T00:00:00Z',
    totalRevenue: 18000,
    role: 'agent',
    createdAt: '2024-04-20T00:00:00Z',
    parentId: 'user-carlos',
    sales30d: 8500,
    communitySize: 1,
    level: 2,
    parentName: 'Carlos Rodríguez',
    lastSaleDate: '2024-12-15',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(8500),
  },
  // Children of Ana
  {
    id: 'user-sofia',
    name: 'Sofía Hernández',
    email: 'sofia@pakoa.com',
    phone: '+521234567006',
    isActive: true,
    activatedAt: '2024-05-15T00:00:00Z',
    totalRevenue: 29000,
    role: 'agent',
    createdAt: '2024-05-15T00:00:00Z',
    parentId: 'user-ana',
    sales30d: 15500,
    communitySize: 2,
    level: 2,
    parentName: 'Ana Martínez',
    lastSaleDate: '2024-12-20',
    pendingCount: 0,
    llaveHistory: generateLlaveHistory(15500),
  },
  {
    id: 'user-alejandro',
    name: 'Alejandro Flores',
    email: 'alejandro@pakoa.com',
    phone: '+521234567017',
    isActive: true,
    activatedAt: '2024-05-20T00:00:00Z',
    totalRevenue: 24000,
    role: 'agent',
    createdAt: '2024-05-20T00:00:00Z',
    parentId: 'user-ana',
    sales30d: 16800,
    communitySize: 1,
    level: 2,
    parentName: 'Ana Martínez',
    lastSaleDate: '2024-12-19',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(16800),
  },
  // Children of Roberto
  {
    id: 'user-patricia',
    name: 'Patricia Navarro',
    email: 'patricia@pakoa.com',
    phone: '+521234567019',
    isActive: true,
    activatedAt: '2024-04-25T00:00:00Z',
    totalRevenue: 42000,
    role: 'agent',
    createdAt: '2024-04-25T00:00:00Z',
    parentId: 'user-roberto',
    sales30d: 18200,
    communitySize: 4,
    level: 2,
    parentName: 'Roberto Mendoza',
    lastSaleDate: '2024-12-20',
    pendingCount: 3,
    llaveHistory: generateLlaveHistory(18200),
  },
  {
    id: 'user-joseluis',
    name: 'José Luis Ramos',
    email: 'joseluis@pakoa.com',
    phone: '+521234567024',
    isActive: false,
    activatedAt: '2024-05-10T00:00:00Z',
    totalRevenue: 19000,
    role: 'agent',
    createdAt: '2024-05-10T00:00:00Z',
    parentId: 'user-roberto',
    sales30d: 13500,
    communitySize: 1,
    level: 2,
    parentName: 'Roberto Mendoza',
    lastSaleDate: '2024-12-16',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(13500),
  },
  // Child of Elena
  {
    id: 'user-raul',
    name: 'Raúl Herrera',
    email: 'raul@pakoa.com',
    phone: '+521234567026',
    isActive: true,
    activatedAt: '2024-05-25T00:00:00Z',
    totalRevenue: 31000,
    role: 'agent',
    createdAt: '2024-05-25T00:00:00Z',
    parentId: 'user-elena',
    sales30d: 15200,
    communitySize: 1,
    level: 2,
    parentName: 'Elena Vázquez',
    lastSaleDate: '2024-12-18',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(15200),
  },
  // Child of Fernando
  {
    id: 'user-jorge',
    name: 'Jorge Ortiz',
    email: 'jorge@pakoa.com',
    phone: '+521234567028',
    isActive: true,
    activatedAt: '2024-06-01T00:00:00Z',
    totalRevenue: 27000,
    role: 'agent',
    createdAt: '2024-06-01T00:00:00Z',
    parentId: 'user-fernando',
    sales30d: 16500,
    communitySize: 2,
    level: 2,
    parentName: 'Fernando Castro',
    lastSaleDate: '2024-12-19',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(16500),
  },

  // ============ LEVEL 3 - BISNIETOS (8 users) - LAST LEVEL FOR COMMISSIONS ============
  // Children of Pedro
  {
    id: 'user-diego',
    name: 'Diego Ramírez',
    email: 'diego@pakoa.com',
    phone: '+521234567007',
    isActive: false,
    activatedAt: '2024-06-01T00:00:00Z',
    totalRevenue: 12000,
    role: 'agent',
    createdAt: '2024-06-01T00:00:00Z',
    parentId: 'user-pedro',
    sales30d: 9200,
    communitySize: 2,
    level: 3,
    parentName: 'Pedro López',
    lastSaleDate: '2024-12-17',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(9200),
  },
  {
    id: 'user-gabriela',
    name: 'Gabriela Torres',
    email: 'gabriela@pakoa.com',
    phone: '+521234567013',
    isActive: true,
    activatedAt: '2024-06-15T00:00:00Z',
    totalRevenue: 21000,
    role: 'agent',
    createdAt: '2024-06-15T00:00:00Z',
    parentId: 'user-pedro',
    sales30d: 15900,
    communitySize: 0,
    level: 3,
    parentName: 'Pedro López',
    lastSaleDate: '2024-12-20',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(15900),
  },
  // Child of Laura
  {
    id: 'user-ricardo',
    name: 'Ricardo Vargas',
    email: 'ricardo@pakoa.com',
    phone: '+521234567014',
    isActive: false,
    activatedAt: '2024-06-20T00:00:00Z',
    totalRevenue: 14000,
    role: 'agent',
    createdAt: '2024-06-20T00:00:00Z',
    parentId: 'user-laura',
    sales30d: 7800,
    communitySize: 0,
    level: 3,
    parentName: 'Laura Sánchez',
    lastSaleDate: '2024-12-12',
    pendingCount: 0,
    llaveHistory: generateLlaveHistory(7800),
  },
  // Child of Sofía
  {
    id: 'user-miguelangel',
    name: 'Miguel Ángel Reyes',
    email: 'miguelangel@pakoa.com',
    phone: '+521234567015',
    isActive: true,
    activatedAt: '2024-06-25T00:00:00Z',
    totalRevenue: 23000,
    role: 'agent',
    createdAt: '2024-06-25T00:00:00Z',
    parentId: 'user-sofia',
    sales30d: 17500,
    communitySize: 1,
    level: 3,
    parentName: 'Sofía Hernández',
    lastSaleDate: '2024-12-21',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(17500),
  },
  // Child of Alejandro
  {
    id: 'user-isabella',
    name: 'Isabella Cruz',
    email: 'isabella@pakoa.com',
    phone: '+521234567018',
    isActive: true,
    activatedAt: '2024-07-01T00:00:00Z',
    totalRevenue: 18000,
    role: 'agent',
    createdAt: '2024-07-01T00:00:00Z',
    parentId: 'user-alejandro',
    sales30d: 15100,
    communitySize: 0,
    level: 3,
    parentName: 'Alejandro Flores',
    lastSaleDate: '2024-12-18',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(15100),
  },
  // Children of Patricia
  {
    id: 'user-daniel',
    name: 'Daniel Guerrero',
    email: 'daniel@pakoa.com',
    phone: '+521234567020',
    isActive: true,
    activatedAt: '2024-06-10T00:00:00Z',
    totalRevenue: 32000,
    role: 'agent',
    createdAt: '2024-06-10T00:00:00Z',
    parentId: 'user-patricia',
    sales30d: 19800,
    communitySize: 2,
    level: 3,
    parentName: 'Patricia Navarro',
    lastSaleDate: '2024-12-21',
    pendingCount: 3,
    llaveHistory: generateLlaveHistory(19800),
  },
  {
    id: 'user-carmen',
    name: 'Carmen Delgado',
    email: 'carmen@pakoa.com',
    phone: '+521234567023',
    isActive: false,
    activatedAt: '2024-07-05T00:00:00Z',
    totalRevenue: 11000,
    role: 'agent',
    createdAt: '2024-07-05T00:00:00Z',
    parentId: 'user-patricia',
    sales30d: 8900,
    communitySize: 0,
    level: 3,
    parentName: 'Patricia Navarro',
    lastSaleDate: '2024-12-13',
    pendingCount: 0,
    llaveHistory: generateLlaveHistory(8900),
  },
  // Child of José Luis
  {
    id: 'user-adriana',
    name: 'Adriana Moreno',
    email: 'adriana@pakoa.com',
    phone: '+521234567025',
    isActive: true,
    activatedAt: '2024-07-10T00:00:00Z',
    totalRevenue: 16000,
    role: 'agent',
    createdAt: '2024-07-10T00:00:00Z',
    parentId: 'user-joseluis',
    sales30d: 15600,
    communitySize: 0,
    level: 3,
    parentName: 'José Luis Ramos',
    lastSaleDate: '2024-12-19',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(15600),
  },
  // Child of Raúl
  {
    id: 'user-natalia',
    name: 'Natalia Campos',
    email: 'natalia@pakoa.com',
    phone: '+521234567027',
    isActive: true,
    activatedAt: '2024-07-15T00:00:00Z',
    totalRevenue: 19000,
    role: 'agent',
    createdAt: '2024-07-15T00:00:00Z',
    parentId: 'user-raul',
    sales30d: 16200,
    communitySize: 0,
    level: 3,
    parentName: 'Raúl Herrera',
    lastSaleDate: '2024-12-20',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(16200),
  },
  // Child of Jorge
  {
    id: 'user-paula',
    name: 'Paula Medina',
    email: 'paula@pakoa.com',
    phone: '+521234567029',
    isActive: true,
    activatedAt: '2024-07-20T00:00:00Z',
    totalRevenue: 22000,
    role: 'agent',
    createdAt: '2024-07-20T00:00:00Z',
    parentId: 'user-jorge',
    sales30d: 17800,
    communitySize: 1,
    level: 3,
    parentName: 'Jorge Ortiz',
    lastSaleDate: '2024-12-21',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(17800),
  },

  // ============ LEVEL 4 - TATARANIETOS (4 users) - NO COMMISSION ============
  // Child of Diego
  {
    id: 'user-valentina',
    name: 'Valentina Mora',
    email: 'valentina@pakoa.com',
    phone: '+521234567011',
    isActive: true,
    activatedAt: '2024-08-01T00:00:00Z',
    totalRevenue: 15000,
    role: 'agent',
    createdAt: '2024-08-01T00:00:00Z',
    parentId: 'user-diego',
    sales30d: 16400,
    communitySize: 1,
    level: 4,
    parentName: 'Diego Ramírez',
    lastSaleDate: '2024-12-20',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(16400),
  },
  // Child of Miguel Ángel
  {
    id: 'user-camila',
    name: 'Camila Ortiz',
    email: 'camila@pakoa.com',
    phone: '+521234567016',
    isActive: false,
    activatedAt: '2024-08-10T00:00:00Z',
    totalRevenue: 9000,
    role: 'agent',
    createdAt: '2024-08-10T00:00:00Z',
    parentId: 'user-miguelangel',
    sales30d: 11500,
    communitySize: 0,
    level: 4,
    parentName: 'Miguel Ángel Reyes',
    lastSaleDate: '2024-12-15',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(11500),
  },
  // Child of Daniel
  {
    id: 'user-lucia',
    name: 'Lucía Peña',
    email: 'lucia@pakoa.com',
    phone: '+521234567021',
    isActive: true,
    activatedAt: '2024-08-15T00:00:00Z',
    totalRevenue: 17000,
    role: 'agent',
    createdAt: '2024-08-15T00:00:00Z',
    parentId: 'user-daniel',
    sales30d: 18100,
    communitySize: 1,
    level: 4,
    parentName: 'Daniel Guerrero',
    lastSaleDate: '2024-12-21',
    pendingCount: 3,
    llaveHistory: generateLlaveHistory(18100),
  },
  // Child of Paula
  {
    id: 'user-sebastian',
    name: 'Sebastián Rojas',
    email: 'sebastian@pakoa.com',
    phone: '+521234567030',
    isActive: true,
    activatedAt: '2024-08-20T00:00:00Z',
    totalRevenue: 14000,
    role: 'agent',
    createdAt: '2024-08-20T00:00:00Z',
    parentId: 'user-paula',
    sales30d: 15300,
    communitySize: 0,
    level: 4,
    parentName: 'Paula Medina',
    lastSaleDate: '2024-12-19',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(15300),
  },

  // ============ LEVEL 5 - BEYOND TATARANIETOS (2 users) - NO COMMISSION ============
  // Child of Valentina
  {
    id: 'user-andres',
    name: 'Andrés Jiménez',
    email: 'andres@pakoa.com',
    phone: '+521234567012',
    isActive: true,
    activatedAt: '2024-09-01T00:00:00Z',
    totalRevenue: 11000,
    role: 'agent',
    createdAt: '2024-09-01T00:00:00Z',
    parentId: 'user-valentina',
    sales30d: 15700,
    communitySize: 0,
    level: 5,
    parentName: 'Valentina Mora',
    lastSaleDate: '2024-12-18',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(15700),
  },
  // Child of Lucía
  {
    id: 'user-mateo',
    name: 'Mateo Silva',
    email: 'mateo@pakoa.com',
    phone: '+521234567022',
    isActive: false,
    activatedAt: '2024-09-10T00:00:00Z',
    totalRevenue: 8000,
    role: 'agent',
    createdAt: '2024-09-10T00:00:00Z',
    parentId: 'user-lucia',
    sales30d: 12200,
    communitySize: 0,
    level: 5,
    parentName: 'Lucía Peña',
    lastSaleDate: '2024-12-14',
    pendingCount: 0,
    llaveHistory: generateLlaveHistory(12200),
  },

  // ========================================================================
  // BRANCH 2: Juan Pérez (First Generation - Level 0)
  // ========================================================================
  {
    id: 'user-juan',
    name: 'Juan Pérez',
    email: 'juan@pakoa.com',
    phone: '+521234567100',
    isActive: true,
    activatedAt: '2024-01-10T00:00:00Z',
    totalRevenue: 78000,
    role: 'agent',
    createdAt: '2024-01-10T00:00:00Z',
    sales30d: 17800,
    communitySize: 9,
    level: 0,
    parentName: undefined,
    parentId: undefined,
    lastSaleDate: '2024-12-21',
    pendingCount: 4,
    llaveHistory: generateLlaveHistory(17800),
  },
  // Juan's children (Level 1)
  {
    id: 'user-marcos',
    name: 'Marcos Vega',
    email: 'marcos@pakoa.com',
    phone: '+521234567101',
    isActive: true,
    activatedAt: '2024-02-20T00:00:00Z',
    totalRevenue: 45000,
    role: 'agent',
    createdAt: '2024-02-20T00:00:00Z',
    parentId: 'user-juan',
    sales30d: 16500,
    communitySize: 3,
    level: 1,
    parentName: 'Juan Pérez',
    lastSaleDate: '2024-12-20',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(16500),
  },
  {
    id: 'user-isabel',
    name: 'Isabel Núñez',
    email: 'isabel@pakoa.com',
    phone: '+521234567102',
    isActive: true,
    activatedAt: '2024-03-05T00:00:00Z',
    totalRevenue: 38000,
    role: 'agent',
    createdAt: '2024-03-05T00:00:00Z',
    parentId: 'user-juan',
    sales30d: 15200,
    communitySize: 2,
    level: 1,
    parentName: 'Juan Pérez',
    lastSaleDate: '2024-12-19',
    pendingCount: 3,
    llaveHistory: generateLlaveHistory(15200),
  },
  {
    id: 'user-davidm',
    name: 'David Molina',
    email: 'davidm@pakoa.com',
    phone: '+521234567103',
    isActive: false,
    activatedAt: '2024-03-15T00:00:00Z',
    totalRevenue: 22000,
    role: 'agent',
    createdAt: '2024-03-15T00:00:00Z',
    parentId: 'user-juan',
    sales30d: 11800,
    communitySize: 1,
    level: 1,
    parentName: 'Juan Pérez',
    lastSaleDate: '2024-12-16',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(11800),
  },
  // Juan's grandchildren (Level 2)
  {
    id: 'user-claudia',
    name: 'Claudia Reyes',
    email: 'claudia@pakoa.com',
    phone: '+521234567104',
    isActive: true,
    activatedAt: '2024-04-20T00:00:00Z',
    totalRevenue: 28000,
    role: 'agent',
    createdAt: '2024-04-20T00:00:00Z',
    parentId: 'user-marcos',
    sales30d: 17200,
    communitySize: 1,
    level: 2,
    parentName: 'Marcos Vega',
    lastSaleDate: '2024-12-21',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(17200),
  },
  {
    id: 'user-arturo',
    name: 'Arturo Méndez',
    email: 'arturo@pakoa.com',
    phone: '+521234567105',
    isActive: true,
    activatedAt: '2024-05-10T00:00:00Z',
    totalRevenue: 21000,
    role: 'agent',
    createdAt: '2024-05-10T00:00:00Z',
    parentId: 'user-marcos',
    sales30d: 15600,
    communitySize: 0,
    level: 2,
    parentName: 'Marcos Vega',
    lastSaleDate: '2024-12-18',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(15600),
  },
  {
    id: 'user-veronica',
    name: 'Verónica Castillo',
    email: 'veronica@pakoa.com',
    phone: '+521234567106',
    isActive: false,
    activatedAt: '2024-05-25T00:00:00Z',
    totalRevenue: 15000,
    role: 'agent',
    createdAt: '2024-05-25T00:00:00Z',
    parentId: 'user-isabel',
    sales30d: 9800,
    communitySize: 1,
    level: 2,
    parentName: 'Isabel Núñez',
    lastSaleDate: '2024-12-14',
    pendingCount: 0,
    llaveHistory: generateLlaveHistory(9800),
  },
  {
    id: 'user-pablo',
    name: 'Pablo Aguilar',
    email: 'pablo@pakoa.com',
    phone: '+521234567107',
    isActive: true,
    activatedAt: '2024-06-01T00:00:00Z',
    totalRevenue: 19000,
    role: 'agent',
    createdAt: '2024-06-01T00:00:00Z',
    parentId: 'user-davidm',
    sales30d: 16100,
    communitySize: 0,
    level: 2,
    parentName: 'David Molina',
    lastSaleDate: '2024-12-20',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(16100),
  },
  // Juan's great-grandchildren (Level 3)
  {
    id: 'user-monica',
    name: 'Mónica Serrano',
    email: 'monica@pakoa.com',
    phone: '+521234567108',
    isActive: true,
    activatedAt: '2024-07-15T00:00:00Z',
    totalRevenue: 14000,
    role: 'agent',
    createdAt: '2024-07-15T00:00:00Z',
    parentId: 'user-claudia',
    sales30d: 15400,
    communitySize: 0,
    level: 3,
    parentName: 'Claudia Reyes',
    lastSaleDate: '2024-12-19',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(15400),
  },
  {
    id: 'user-oscar',
    name: 'Óscar Fuentes',
    email: 'oscar@pakoa.com',
    phone: '+521234567109',
    isActive: false,
    activatedAt: '2024-08-01T00:00:00Z',
    totalRevenue: 9000,
    role: 'agent',
    createdAt: '2024-08-01T00:00:00Z',
    parentId: 'user-veronica',
    sales30d: 8500,
    communitySize: 0,
    level: 3,
    parentName: 'Verónica Castillo',
    lastSaleDate: '2024-12-12',
    pendingCount: 0,
    llaveHistory: generateLlaveHistory(8500),
  },

  // ========================================================================
  // BRANCH 3: Rosa Díaz (First Generation - Level 0)
  // ========================================================================
  {
    id: 'user-rosa',
    name: 'Rosa Díaz',
    email: 'rosa@pakoa.com',
    phone: '+521234567110',
    isActive: true,
    activatedAt: '2024-01-20T00:00:00Z',
    totalRevenue: 65000,
    role: 'agent',
    createdAt: '2024-01-20T00:00:00Z',
    sales30d: 19200,
    communitySize: 7,
    level: 0,
    parentName: undefined,
    parentId: undefined,
    lastSaleDate: '2024-12-22',
    pendingCount: 3,
    llaveHistory: generateLlaveHistory(19200),
  },
  // Rosa's children (Level 1)
  {
    id: 'user-andres-castro',
    name: 'Andrés Castro',
    email: 'andrescastro@pakoa.com',
    phone: '+521234567111',
    isActive: true,
    activatedAt: '2024-03-01T00:00:00Z',
    totalRevenue: 42000,
    role: 'agent',
    createdAt: '2024-03-01T00:00:00Z',
    parentId: 'user-rosa',
    sales30d: 18500,
    communitySize: 3,
    level: 1,
    parentName: 'Rosa Díaz',
    lastSaleDate: '2024-12-21',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(18500),
  },
  {
    id: 'user-danielac',
    name: 'Daniela Cruz',
    email: 'danielac@pakoa.com',
    phone: '+521234567112',
    isActive: false,
    activatedAt: '2024-03-20T00:00:00Z',
    totalRevenue: 25000,
    role: 'agent',
    createdAt: '2024-03-20T00:00:00Z',
    parentId: 'user-rosa',
    sales30d: 13200,
    communitySize: 2,
    level: 1,
    parentName: 'Rosa Díaz',
    lastSaleDate: '2024-12-17',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(13200),
  },
  // Rosa's grandchildren (Level 2)
  {
    id: 'user-raulh',
    name: 'Raúl Herrera',
    email: 'raulh@pakoa.com',
    phone: '+521234567113',
    isActive: true,
    activatedAt: '2024-05-15T00:00:00Z',
    totalRevenue: 26000,
    role: 'agent',
    createdAt: '2024-05-15T00:00:00Z',
    parentId: 'user-andres-castro',
    sales30d: 16800,
    communitySize: 1,
    level: 2,
    parentName: 'Andrés Castro',
    lastSaleDate: '2024-12-20',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(16800),
  },
  {
    id: 'user-gabrielam',
    name: 'Gabriela Morales',
    email: 'gabrielam@pakoa.com',
    phone: '+521234567114',
    isActive: true,
    activatedAt: '2024-06-01T00:00:00Z',
    totalRevenue: 20000,
    role: 'agent',
    createdAt: '2024-06-01T00:00:00Z',
    parentId: 'user-andres-castro',
    sales30d: 15100,
    communitySize: 0,
    level: 2,
    parentName: 'Andrés Castro',
    lastSaleDate: '2024-12-18',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(15100),
  },
  {
    id: 'user-ricardoj',
    name: 'Ricardo Jiménez',
    email: 'ricardoj@pakoa.com',
    phone: '+521234567115',
    isActive: false,
    activatedAt: '2024-06-15T00:00:00Z',
    totalRevenue: 12000,
    role: 'agent',
    createdAt: '2024-06-15T00:00:00Z',
    parentId: 'user-danielac',
    sales30d: 10500,
    communitySize: 1,
    level: 2,
    parentName: 'Daniela Cruz',
    lastSaleDate: '2024-12-14',
    pendingCount: 0,
    llaveHistory: generateLlaveHistory(10500),
  },
  // Rosa's great-grandchildren (Level 3)
  {
    id: 'user-esteban',
    name: 'Esteban Paredes',
    email: 'esteban@pakoa.com',
    phone: '+521234567116',
    isActive: true,
    activatedAt: '2024-08-01T00:00:00Z',
    totalRevenue: 15000,
    role: 'agent',
    createdAt: '2024-08-01T00:00:00Z',
    parentId: 'user-raulh',
    sales30d: 16200,
    communitySize: 0,
    level: 3,
    parentName: 'Raúl Herrera',
    lastSaleDate: '2024-12-21',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(16200),
  },
  {
    id: 'user-lorena',
    name: 'Lorena Gutiérrez',
    email: 'lorena@pakoa.com',
    phone: '+521234567117',
    isActive: false,
    activatedAt: '2024-08-15T00:00:00Z',
    totalRevenue: 8000,
    role: 'agent',
    createdAt: '2024-08-15T00:00:00Z',
    parentId: 'user-ricardoj',
    sales30d: 7800,
    communitySize: 0,
    level: 3,
    parentName: 'Ricardo Jiménez',
    lastSaleDate: '2024-12-10',
    pendingCount: 0,
    llaveHistory: generateLlaveHistory(7800),
  },

  // ========================================================================
  // BRANCH 4: Miguel Torres (First Generation - Level 0)
  // ========================================================================
  {
    id: 'user-miguelt',
    name: 'Miguel Torres',
    email: 'miguelt@pakoa.com',
    phone: '+521234567120',
    isActive: true,
    activatedAt: '2024-01-25T00:00:00Z',
    totalRevenue: 72000,
    role: 'agent',
    createdAt: '2024-01-25T00:00:00Z',
    sales30d: 16900,
    communitySize: 7,
    level: 0,
    parentName: undefined,
    parentId: undefined,
    lastSaleDate: '2024-12-20',
    pendingCount: 3,
    llaveHistory: generateLlaveHistory(16900),
  },
  // Miguel's children (Level 1)
  {
    id: 'user-francisco',
    name: 'Francisco Ríos',
    email: 'francisco@pakoa.com',
    phone: '+521234567121',
    isActive: true,
    activatedAt: '2024-03-10T00:00:00Z',
    totalRevenue: 39000,
    role: 'agent',
    createdAt: '2024-03-10T00:00:00Z',
    parentId: 'user-miguelt',
    sales30d: 17600,
    communitySize: 3,
    level: 1,
    parentName: 'Miguel Torres',
    lastSaleDate: '2024-12-21',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(17600),
  },
  {
    id: 'user-alicia',
    name: 'Alicia Cervantes',
    email: 'alicia@pakoa.com',
    phone: '+521234567122',
    isActive: true,
    activatedAt: '2024-03-25T00:00:00Z',
    totalRevenue: 32000,
    role: 'agent',
    createdAt: '2024-03-25T00:00:00Z',
    parentId: 'user-miguelt',
    sales30d: 15800,
    communitySize: 2,
    level: 1,
    parentName: 'Miguel Torres',
    lastSaleDate: '2024-12-19',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(15800),
  },
  // Miguel's grandchildren (Level 2)
  {
    id: 'user-hugo',
    name: 'Hugo Salazar',
    email: 'hugo@pakoa.com',
    phone: '+521234567123',
    isActive: true,
    activatedAt: '2024-05-20T00:00:00Z',
    totalRevenue: 24000,
    role: 'agent',
    createdAt: '2024-05-20T00:00:00Z',
    parentId: 'user-francisco',
    sales30d: 16400,
    communitySize: 1,
    level: 2,
    parentName: 'Francisco Ríos',
    lastSaleDate: '2024-12-20',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(16400),
  },
  {
    id: 'user-marisol',
    name: 'Marisol Espinoza',
    email: 'marisol@pakoa.com',
    phone: '+521234567124',
    isActive: false,
    activatedAt: '2024-06-05T00:00:00Z',
    totalRevenue: 14000,
    role: 'agent',
    createdAt: '2024-06-05T00:00:00Z',
    parentId: 'user-francisco',
    sales30d: 11200,
    communitySize: 0,
    level: 2,
    parentName: 'Francisco Ríos',
    lastSaleDate: '2024-12-15',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(11200),
  },
  {
    id: 'user-emilio',
    name: 'Emilio Contreras',
    email: 'emilio@pakoa.com',
    phone: '+521234567125',
    isActive: true,
    activatedAt: '2024-06-20T00:00:00Z',
    totalRevenue: 18000,
    role: 'agent',
    createdAt: '2024-06-20T00:00:00Z',
    parentId: 'user-alicia',
    sales30d: 15300,
    communitySize: 1,
    level: 2,
    parentName: 'Alicia Cervantes',
    lastSaleDate: '2024-12-18',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(15300),
  },
  // Miguel's great-grandchildren (Level 3)
  {
    id: 'user-silvia',
    name: 'Silvia Orozco',
    email: 'silvia@pakoa.com',
    phone: '+521234567126',
    isActive: true,
    activatedAt: '2024-08-10T00:00:00Z',
    totalRevenue: 12000,
    role: 'agent',
    createdAt: '2024-08-10T00:00:00Z',
    parentId: 'user-hugo',
    sales30d: 15900,
    communitySize: 0,
    level: 3,
    parentName: 'Hugo Salazar',
    lastSaleDate: '2024-12-21',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(15900),
  },
  {
    id: 'user-tomas',
    name: 'Tomás Ávila',
    email: 'tomas@pakoa.com',
    phone: '+521234567127',
    isActive: false,
    activatedAt: '2024-08-25T00:00:00Z',
    totalRevenue: 7000,
    role: 'agent',
    createdAt: '2024-08-25T00:00:00Z',
    parentId: 'user-emilio',
    sales30d: 9200,
    communitySize: 0,
    level: 3,
    parentName: 'Emilio Contreras',
    lastSaleDate: '2024-12-13',
    pendingCount: 0,
    llaveHistory: generateLlaveHistory(9200),
  },

  // ========================================================================
  // BRANCH 5: Carmen Ruiz (First Generation - Level 0)
  // ========================================================================
  {
    id: 'user-carmenr',
    name: 'Carmen Ruiz',
    email: 'carmenr@pakoa.com',
    phone: '+521234567130',
    isActive: true,
    activatedAt: '2024-02-01T00:00:00Z',
    totalRevenue: 68000,
    role: 'agent',
    createdAt: '2024-02-01T00:00:00Z',
    sales30d: 18100,
    communitySize: 9,
    level: 0,
    parentName: undefined,
    parentId: undefined,
    lastSaleDate: '2024-12-21',
    pendingCount: 4,
    llaveHistory: generateLlaveHistory(18100),
  },
  // Carmen's children (Level 1)
  {
    id: 'user-gerardo',
    name: 'Gerardo Luna',
    email: 'gerardo@pakoa.com',
    phone: '+521234567131',
    isActive: true,
    activatedAt: '2024-03-15T00:00:00Z',
    totalRevenue: 36000,
    role: 'agent',
    createdAt: '2024-03-15T00:00:00Z',
    parentId: 'user-carmenr',
    sales30d: 16700,
    communitySize: 2,
    level: 1,
    parentName: 'Carmen Ruiz',
    lastSaleDate: '2024-12-20',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(16700),
  },
  {
    id: 'user-beatriz',
    name: 'Beatriz Montes',
    email: 'beatriz@pakoa.com',
    phone: '+521234567132',
    isActive: true,
    activatedAt: '2024-04-01T00:00:00Z',
    totalRevenue: 31000,
    role: 'agent',
    createdAt: '2024-04-01T00:00:00Z',
    parentId: 'user-carmenr',
    sales30d: 15500,
    communitySize: 3,
    level: 1,
    parentName: 'Carmen Ruiz',
    lastSaleDate: '2024-12-19',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(15500),
  },
  {
    id: 'user-nicolas',
    name: 'Nicolás Ibarra',
    email: 'nicolas@pakoa.com',
    phone: '+521234567133',
    isActive: false,
    activatedAt: '2024-04-15T00:00:00Z',
    totalRevenue: 18000,
    role: 'agent',
    createdAt: '2024-04-15T00:00:00Z',
    parentId: 'user-carmenr',
    sales30d: 12800,
    communitySize: 1,
    level: 1,
    parentName: 'Carmen Ruiz',
    lastSaleDate: '2024-12-16',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(12800),
  },
  // Carmen's grandchildren (Level 2)
  {
    id: 'user-rocio',
    name: 'Rocío Santana',
    email: 'rocio@pakoa.com',
    phone: '+521234567134',
    isActive: true,
    activatedAt: '2024-06-01T00:00:00Z',
    totalRevenue: 22000,
    role: 'agent',
    createdAt: '2024-06-01T00:00:00Z',
    parentId: 'user-gerardo',
    sales30d: 17100,
    communitySize: 1,
    level: 2,
    parentName: 'Gerardo Luna',
    lastSaleDate: '2024-12-21',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(17100),
  },
  {
    id: 'user-martin',
    name: 'Martín Acosta',
    email: 'martin@pakoa.com',
    phone: '+521234567135',
    isActive: true,
    activatedAt: '2024-06-15T00:00:00Z',
    totalRevenue: 19000,
    role: 'agent',
    createdAt: '2024-06-15T00:00:00Z',
    parentId: 'user-beatriz',
    sales30d: 15800,
    communitySize: 0,
    level: 2,
    parentName: 'Beatriz Montes',
    lastSaleDate: '2024-12-18',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(15800),
  },
  {
    id: 'user-fernandaz',
    name: 'Fernanda Zavala',
    email: 'fernandaz@pakoa.com',
    phone: '+521234567136',
    isActive: false,
    activatedAt: '2024-07-01T00:00:00Z',
    totalRevenue: 11000,
    role: 'agent',
    createdAt: '2024-07-01T00:00:00Z',
    parentId: 'user-beatriz',
    sales30d: 10200,
    communitySize: 1,
    level: 2,
    parentName: 'Beatriz Montes',
    lastSaleDate: '2024-12-14',
    pendingCount: 0,
    llaveHistory: generateLlaveHistory(10200),
  },
  {
    id: 'user-cristian',
    name: 'Cristian Ponce',
    email: 'cristian@pakoa.com',
    phone: '+521234567137',
    isActive: true,
    activatedAt: '2024-07-15T00:00:00Z',
    totalRevenue: 16000,
    role: 'agent',
    createdAt: '2024-07-15T00:00:00Z',
    parentId: 'user-nicolas',
    sales30d: 15200,
    communitySize: 0,
    level: 2,
    parentName: 'Nicolás Ibarra',
    lastSaleDate: '2024-12-19',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(15200),
  },
  // Carmen's great-grandchildren (Level 3)
  {
    id: 'user-adrian',
    name: 'Adrián Maldonado',
    email: 'adrian@pakoa.com',
    phone: '+521234567138',
    isActive: true,
    activatedAt: '2024-09-01T00:00:00Z',
    totalRevenue: 13000,
    role: 'agent',
    createdAt: '2024-09-01T00:00:00Z',
    parentId: 'user-rocio',
    sales30d: 16500,
    communitySize: 0,
    level: 3,
    parentName: 'Rocío Santana',
    lastSaleDate: '2024-12-20',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(16500),
  },
  {
    id: 'user-irene',
    name: 'Irene Bautista',
    email: 'irene@pakoa.com',
    phone: '+521234567139',
    isActive: false,
    activatedAt: '2024-09-15T00:00:00Z',
    totalRevenue: 6000,
    role: 'agent',
    createdAt: '2024-09-15T00:00:00Z',
    parentId: 'user-fernandaz',
    sales30d: 8100,
    communitySize: 0,
    level: 3,
    parentName: 'Fernanda Zavala',
    lastSaleDate: '2024-12-11',
    pendingCount: 0,
    llaveHistory: generateLlaveHistory(8100),
  },

  // ========================================================================
  // BRANCH 6: Antonio Vargas (First Generation - Level 0)
  // ========================================================================
  {
    id: 'user-antonio',
    name: 'Antonio Vargas',
    email: 'antonio@pakoa.com',
    phone: '+521234567140',
    isActive: true,
    activatedAt: '2024-02-10T00:00:00Z',
    totalRevenue: 58000,
    role: 'agent',
    createdAt: '2024-02-10T00:00:00Z',
    sales30d: 17400,
    communitySize: 8,
    level: 0,
    parentName: undefined,
    parentId: undefined,
    lastSaleDate: '2024-12-20',
    pendingCount: 3,
    llaveHistory: generateLlaveHistory(17400),
  },
  // Antonio's children (Level 1)
  {
    id: 'user-susana',
    name: 'Susana Valdez',
    email: 'susana@pakoa.com',
    phone: '+521234567141',
    isActive: true,
    activatedAt: '2024-04-01T00:00:00Z',
    totalRevenue: 34000,
    role: 'agent',
    createdAt: '2024-04-01T00:00:00Z',
    parentId: 'user-antonio',
    sales30d: 18200,
    communitySize: 4,
    level: 1,
    parentName: 'Antonio Vargas',
    lastSaleDate: '2024-12-21',
    pendingCount: 3,
    llaveHistory: generateLlaveHistory(18200),
  },
  {
    id: 'user-rene',
    name: 'René Figueroa',
    email: 'rene@pakoa.com',
    phone: '+521234567142',
    isActive: false,
    activatedAt: '2024-04-20T00:00:00Z',
    totalRevenue: 20000,
    role: 'agent',
    createdAt: '2024-04-20T00:00:00Z',
    parentId: 'user-antonio',
    sales30d: 13800,
    communitySize: 2,
    level: 1,
    parentName: 'Antonio Vargas',
    lastSaleDate: '2024-12-17',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(13800),
  },
  // Antonio's grandchildren (Level 2)
  {
    id: 'user-gloria',
    name: 'Gloria Pacheco',
    email: 'gloria@pakoa.com',
    phone: '+521234567143',
    isActive: true,
    activatedAt: '2024-06-10T00:00:00Z',
    totalRevenue: 21000,
    role: 'agent',
    createdAt: '2024-06-10T00:00:00Z',
    parentId: 'user-susana',
    sales30d: 16600,
    communitySize: 2,
    level: 2,
    parentName: 'Susana Valdez',
    lastSaleDate: '2024-12-20',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(16600),
  },
  {
    id: 'user-hector',
    name: 'Héctor Carrillo',
    email: 'hector@pakoa.com',
    phone: '+521234567144',
    isActive: true,
    activatedAt: '2024-06-25T00:00:00Z',
    totalRevenue: 17000,
    role: 'agent',
    createdAt: '2024-06-25T00:00:00Z',
    parentId: 'user-susana',
    sales30d: 15400,
    communitySize: 0,
    level: 2,
    parentName: 'Susana Valdez',
    lastSaleDate: '2024-12-18',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(15400),
  },
  {
    id: 'user-yolanda',
    name: 'Yolanda Estrada',
    email: 'yolanda@pakoa.com',
    phone: '+521234567145',
    isActive: false,
    activatedAt: '2024-07-10T00:00:00Z',
    totalRevenue: 10000,
    role: 'agent',
    createdAt: '2024-07-10T00:00:00Z',
    parentId: 'user-rene',
    sales30d: 11500,
    communitySize: 1,
    level: 2,
    parentName: 'René Figueroa',
    lastSaleDate: '2024-12-15',
    pendingCount: 0,
    llaveHistory: generateLlaveHistory(11500),
  },
  // Antonio's great-grandchildren (Level 3)
  {
    id: 'user-alberto',
    name: 'Alberto Sandoval',
    email: 'alberto@pakoa.com',
    phone: '+521234567146',
    isActive: true,
    activatedAt: '2024-08-20T00:00:00Z',
    totalRevenue: 14000,
    role: 'agent',
    createdAt: '2024-08-20T00:00:00Z',
    parentId: 'user-gloria',
    sales30d: 17300,
    communitySize: 1,
    level: 3,
    parentName: 'Gloria Pacheco',
    lastSaleDate: '2024-12-21',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(17300),
  },
  {
    id: 'user-nora',
    name: 'Nora Villanueva',
    email: 'nora@pakoa.com',
    phone: '+521234567147',
    isActive: false,
    activatedAt: '2024-09-05T00:00:00Z',
    totalRevenue: 7000,
    role: 'agent',
    createdAt: '2024-09-05T00:00:00Z',
    parentId: 'user-yolanda',
    sales30d: 9800,
    communitySize: 0,
    level: 3,
    parentName: 'Yolanda Estrada',
    lastSaleDate: '2024-12-12',
    pendingCount: 0,
    llaveHistory: generateLlaveHistory(9800),
  },
  // Antonio's tataranieto (Level 4) - NO COMMISSION
  {
    id: 'user-ivan',
    name: 'Iván Cabrera',
    email: 'ivan@pakoa.com',
    phone: '+521234567148',
    isActive: true,
    activatedAt: '2024-10-01T00:00:00Z',
    totalRevenue: 9000,
    role: 'agent',
    createdAt: '2024-10-01T00:00:00Z',
    parentId: 'user-alberto',
    sales30d: 15100,
    communitySize: 0,
    level: 4,
    parentName: 'Alberto Sandoval',
    lastSaleDate: '2024-12-19',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(15100),
  },

  // ========================================================================
  // BRANCH 7: Lucía Romero (First Generation - Level 0)
  // ========================================================================
  {
    id: 'user-luciar',
    name: 'Lucía Romero',
    email: 'luciar@pakoa.com',
    phone: '+521234567150',
    isActive: true,
    activatedAt: '2024-02-15T00:00:00Z',
    totalRevenue: 55000,
    role: 'agent',
    createdAt: '2024-02-15T00:00:00Z',
    sales30d: 16200,
    communitySize: 7,
    level: 0,
    parentName: undefined,
    parentId: undefined,
    lastSaleDate: '2024-12-19',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(16200),
  },
  // Lucía's children (Level 1)
  {
    id: 'user-enrique',
    name: 'Enrique Solís',
    email: 'enrique@pakoa.com',
    phone: '+521234567151',
    isActive: true,
    activatedAt: '2024-04-10T00:00:00Z',
    totalRevenue: 30000,
    role: 'agent',
    createdAt: '2024-04-10T00:00:00Z',
    parentId: 'user-luciar',
    sales30d: 17900,
    communitySize: 3,
    level: 1,
    parentName: 'Lucía Romero',
    lastSaleDate: '2024-12-21',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(17900),
  },
  {
    id: 'user-pilar',
    name: 'Pilar Guzmán',
    email: 'pilar@pakoa.com',
    phone: '+521234567152',
    isActive: true,
    activatedAt: '2024-04-25T00:00:00Z',
    totalRevenue: 26000,
    role: 'agent',
    createdAt: '2024-04-25T00:00:00Z',
    parentId: 'user-luciar',
    sales30d: 15600,
    communitySize: 2,
    level: 1,
    parentName: 'Lucía Romero',
    lastSaleDate: '2024-12-18',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(15600),
  },
  // Lucía's grandchildren (Level 2)
  {
    id: 'user-angel',
    name: 'Ángel Miranda',
    email: 'angel@pakoa.com',
    phone: '+521234567153',
    isActive: true,
    activatedAt: '2024-06-20T00:00:00Z',
    totalRevenue: 18000,
    role: 'agent',
    createdAt: '2024-06-20T00:00:00Z',
    parentId: 'user-enrique',
    sales30d: 16100,
    communitySize: 1,
    level: 2,
    parentName: 'Enrique Solís',
    lastSaleDate: '2024-12-20',
    pendingCount: 2,
    llaveHistory: generateLlaveHistory(16100),
  },
  {
    id: 'user-leticia',
    name: 'Leticia Domínguez',
    email: 'leticia@pakoa.com',
    phone: '+521234567154',
    isActive: false,
    activatedAt: '2024-07-05T00:00:00Z',
    totalRevenue: 12000,
    role: 'agent',
    createdAt: '2024-07-05T00:00:00Z',
    parentId: 'user-enrique',
    sales30d: 10800,
    communitySize: 0,
    level: 2,
    parentName: 'Enrique Solís',
    lastSaleDate: '2024-12-14',
    pendingCount: 0,
    llaveHistory: generateLlaveHistory(10800),
  },
  {
    id: 'user-bruno',
    name: 'Bruno Pedraza',
    email: 'bruno@pakoa.com',
    phone: '+521234567155',
    isActive: true,
    activatedAt: '2024-07-20T00:00:00Z',
    totalRevenue: 15000,
    role: 'agent',
    createdAt: '2024-07-20T00:00:00Z',
    parentId: 'user-pilar',
    sales30d: 15300,
    communitySize: 1,
    level: 2,
    parentName: 'Pilar Guzmán',
    lastSaleDate: '2024-12-19',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(15300),
  },
  // Lucía's great-grandchildren (Level 3)
  {
    id: 'user-regina',
    name: 'Regina Téllez',
    email: 'regina@pakoa.com',
    phone: '+521234567156',
    isActive: true,
    activatedAt: '2024-09-10T00:00:00Z',
    totalRevenue: 11000,
    role: 'agent',
    createdAt: '2024-09-10T00:00:00Z',
    parentId: 'user-angel',
    sales30d: 15800,
    communitySize: 0,
    level: 3,
    parentName: 'Ángel Miranda',
    lastSaleDate: '2024-12-21',
    pendingCount: 1,
    llaveHistory: generateLlaveHistory(15800),
  },
  {
    id: 'user-samuel',
    name: 'Samuel Coronado',
    email: 'samuel@pakoa.com',
    phone: '+521234567157',
    isActive: false,
    activatedAt: '2024-09-25T00:00:00Z',
    totalRevenue: 6000,
    role: 'agent',
    createdAt: '2024-09-25T00:00:00Z',
    parentId: 'user-bruno',
    sales30d: 8900,
    communitySize: 0,
    level: 3,
    parentName: 'Bruno Pedraza',
    lastSaleDate: '2024-12-13',
    pendingCount: 0,
    llaveHistory: generateLlaveHistory(8900),
  },
]

// Helper to get user by ID
export const getUserById = (id: string): MockUser | undefined => {
  return mockUsers.find(u => u.id === id)
}

// Helper to get user by email
export const getUserByEmail = (email: string): MockUser | undefined => {
  return mockUsers.find(u => u.email === email)
}

// Helper to get team members for a user (their direct and indirect referrals)
// maxDepth limits how many levels deep to include (default 3 = hijos, nietos, bisnietos)
export const getTeamMembers = (userId: string, maxDepth: number = 3): MockUser[] => {
  const collectChildren = (parentId: string, currentDepth: number): MockUser[] => {
    if (currentDepth > maxDepth) return []

    const directChildren = mockUsers.filter(u => u.parentId === parentId)
    const allDescendants: MockUser[] = [...directChildren]

    directChildren.forEach(child => {
      allDescendants.push(...collectChildren(child.id, currentDepth + 1))
    })
    return allDescendants
  }

  return collectChildren(userId, 1)
}

// Helper to get ALL team members (including tataranietos+) for display purposes
export const getAllTeamMembers = (userId: string): MockUser[] => {
  const collectChildren = (parentId: string): MockUser[] => {
    const directChildren = mockUsers.filter(u => u.parentId === parentId)
    const allDescendants: MockUser[] = [...directChildren]
    directChildren.forEach(child => {
      allDescendants.push(...collectChildren(child.id))
    })
    return allDescendants
  }
  return collectChildren(userId)
}

// Helper to convert level number to label
export const getLevelLabel = (level: number): 'hijo' | 'nieto' | 'bisnieto' | 'tataranieto' | 'self' => {
  switch (level) {
    case 0: return 'self'
    case 1: return 'hijo'
    case 2: return 'nieto'
    case 3: return 'bisnieto'
    default: return 'tataranieto'
  }
}

// Helper to get relative level label (from viewer's perspective)
export const getRelativeLevelLabel = (memberLevel: number, viewerLevel: number): 'hijo' | 'nieto' | 'bisnieto' | 'tataranieto' => {
  const diff = memberLevel - viewerLevel
  switch (diff) {
    case 1: return 'hijo'
    case 2: return 'nieto'
    case 3: return 'bisnieto'
    default: return 'tataranieto'
  }
}

// Helper to check if a user is within commission range (max 3 levels deep)
export const isWithinCommissionRange = (memberLevel: number, viewerLevel: number): boolean => {
  const diff = memberLevel - viewerLevel
  return diff >= 1 && diff <= 3
}

// Get commission rate based on relative level
export const getCommissionRate = (memberLevel: number, viewerLevel: number): number => {
  const diff = memberLevel - viewerLevel
  switch (diff) {
    case 1: return 0.08  // Hijo: 8%
    case 2: return 0.12  // Nieto: 12%
    case 3: return 0.20  // Bisnieto: 20%
    default: return 0    // Tataranieto+: 0%
  }
}

// Mock weekly data for charts
export const mockWeeklyData = [
  { week: 'Sem 40', sales: 4200 },
  { week: 'Sem 41', sales: 3800 },
  { week: 'Sem 42', sales: 5100 },
  { week: 'Sem 43', sales: 4600 },
  { week: 'Sem 44', sales: 3200 },
  { week: 'Sem 45', sales: 4900 },
  { week: 'Sem 46', sales: 5500 },
  { week: 'Sem 47', sales: 4100 },
  { week: 'Sem 48', sales: 6200 },
  { week: 'Sem 49', sales: 5800 },
  { week: 'Sem 50', sales: 4500 },
  { week: 'Sem 51', sales: 5200 },
]

// Mock product sales data
export const mockProductSalesData = [
  { product: 'Internet 100MB', sales: 12500, percentage: 28 },
  { product: 'Paquete TV+Internet', sales: 9800, percentage: 22 },
  { product: 'Internet 200MB', sales: 8200, percentage: 18 },
  { product: 'Paquete Familiar', sales: 7500, percentage: 17 },
  { product: 'Otros', sales: 6800, percentage: 15 },
]

// Types for funnel/sales
export type FunnelStatus = 'PROSPECTO' | 'COTIZADO' | 'AGENDADO' | 'INSTALADO' | 'CANCELADO'

export interface Sale {
  id: string
  userId: string
  customerName: string
  customerPhone: string
  productType: string
  amount: number
  funnelStatus: FunnelStatus
  capturedAt: string
  quotedAt: string | null
  scheduledAt: string | null
  installedAt: string | null
  cancelledAt: string | null
  notes: string | null
}

// Generate sales for a specific user based on their sales30d value
const generateUserSales = (user: MockUser): Sale[] => {
  const products = [
    'Internet 50MB', 'Internet 100MB', 'Internet 200MB', 'Internet 300MB',
    'Paquete TV+Internet 100MB', 'Paquete TV+Internet 200MB',
    'Paquete Familiar (TV+Internet+Teléfono)', 'Internet Empresarial 500MB'
  ]
  const names = [
    'Juan Pérez', 'María González', 'Carlos López', 'Ana Martínez',
    'Roberto Sánchez', 'Laura Torres', 'Miguel Flores', 'Sofía Rivera',
    'Diego Ramírez', 'Carmen Vega', 'José Hernández', 'Patricia Mendoza'
  ]

  const sales: Sale[] = []
  const now = new Date()

  // Generate enough INSTALADO sales to match sales30d
  let remainingValue = user.sales30d
  let saleIndex = 0

  while (remainingValue > 0) {
    const saleAmount = Math.min(remainingValue, 800 + Math.random() * 1700)
    remainingValue -= saleAmount

    const capturedAt = new Date(now.getTime() - Math.random() * 25 * 24 * 60 * 60 * 1000)
    const quotedAt = new Date(capturedAt.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000)
    const scheduledAt = new Date(quotedAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000)
    const installedAt = new Date(scheduledAt.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000)

    sales.push({
      id: `sale-${user.id}-${saleIndex}`,
      userId: user.id,
      customerName: names[Math.floor(Math.random() * names.length)],
      customerPhone: `+52 55 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
      productType: products[Math.floor(Math.random() * products.length)],
      amount: Math.round(saleAmount * 100) / 100,
      funnelStatus: 'INSTALADO',
      capturedAt: capturedAt.toISOString(),
      quotedAt: quotedAt.toISOString(),
      scheduledAt: scheduledAt.toISOString(),
      installedAt: installedAt.toISOString(),
      cancelledAt: null,
      notes: null,
    })
    saleIndex++
  }

  // Add some pending sales (PROSPECTO, COTIZADO, AGENDADO)
  const pendingStatuses: FunnelStatus[] = ['PROSPECTO', 'COTIZADO', 'AGENDADO']
  for (let i = 0; i < user.pendingCount; i++) {
    const status = pendingStatuses[i % 3]
    const capturedAt = new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000)

    let quotedAt = null, scheduledAt = null

    if (['COTIZADO', 'AGENDADO'].includes(status)) {
      quotedAt = new Date(capturedAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString()
    }
    if (status === 'AGENDADO') {
      scheduledAt = new Date(new Date(quotedAt!).getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString()
    }

    sales.push({
      id: `sale-${user.id}-pending-${i}`,
      userId: user.id,
      customerName: names[Math.floor(Math.random() * names.length)],
      customerPhone: `+52 55 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
      productType: products[Math.floor(Math.random() * products.length)],
      amount: Math.round((800 + Math.random() * 1700) * 100) / 100,
      funnelStatus: status,
      capturedAt: capturedAt.toISOString(),
      quotedAt,
      scheduledAt,
      installedAt: null,
      cancelledAt: null,
      notes: Math.random() > 0.7 ? 'Seguimiento pendiente' : null,
    })
  }

  // Add a couple cancelled sales
  for (let i = 0; i < 2; i++) {
    const capturedAt = new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000)
    const cancelledAt = new Date(capturedAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)

    sales.push({
      id: `sale-${user.id}-cancelled-${i}`,
      userId: user.id,
      customerName: names[Math.floor(Math.random() * names.length)],
      customerPhone: `+52 55 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
      productType: products[Math.floor(Math.random() * products.length)],
      amount: Math.round((800 + Math.random() * 1700) * 100) / 100,
      funnelStatus: 'CANCELADO',
      capturedAt: capturedAt.toISOString(),
      quotedAt: null,
      scheduledAt: null,
      installedAt: null,
      cancelledAt: cancelledAt.toISOString(),
      notes: 'Cliente canceló',
    })
  }

  return sales
}

// Pre-generate all sales for all users
const allSalesMap = new Map<string, Sale[]>()
mockUsers.forEach(user => {
  allSalesMap.set(user.id, generateUserSales(user))
})

// Get sales for a specific user
export const getUserSales = (userId: string): Sale[] => {
  return allSalesMap.get(userId) || []
}

// Get all sales (for admin views)
export const getAllSales = (): Sale[] => {
  const allSales: Sale[] = []
  allSalesMap.forEach(sales => allSales.push(...sales))
  return allSales
}
