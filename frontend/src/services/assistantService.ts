import Anthropic from '@anthropic-ai/sdk'
import type { AssistantMessage, UserContext } from '@/types/assistant'
import {
  getUserById,
  getUserSales,
  hasLlave,
  isAtRisk,
  LLAVE_THRESHOLD,
  getUserCampaignsAsOwner,
  getUserCampaignsAsParticipant,
  getUserTotalBudgetThisWeek,
  mockUsers,
} from '@/data/mockData'
import type { Sale } from '@/data/mockData'

// Initialize Anthropic client
// In production, this should be called from a backend API
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true // Only for development - in production use backend
})

// System prompt - Platform Rules (language-agnostic content)
const PLATFORM_RULES_ES = `Eres el asistente de Pakoa, una plataforma de ventas MLM para servicios de telecomunicaciones. Tu objetivo es ayudar al usuario a maximizar sus ingresos.

REGLAS DE LA PLATAFORMA:

1. LLAVE DEL REINO
- Umbral: $15,000 en ventas (suma de últimos 30 días)
- Evaluación: Cada miércoles a las 00:00 CST (Ciudad de México)
- Estado binario: Activa o Inactiva para esa semana
- Debe mantenerse cada semana

2. COMISIONES POR COMUNIDAD
Solo se ganan si tienes la Llave activa.
- Hijos (Nivel 1): 8% de sus ventas
- Nietos (Nivel 2): 12% - requiere que el Hijo conectante tenga Llave
- Bisnietos (Nivel 3): 20% - requiere cadena completa (Hijo + Nieto con Llave)
- Máximo 3 niveles de profundidad, nunca se gana de tataranietos

REGLA DE CADENA: Las comisiones solo fluyen por cadenas ininterrumpidas donde cada persona en el camino tiene Llave activa.

3. CAMPAÑAS
- Se crea automáticamente cuando ganas la Llave por primera vez
- Primeras 2 semanas: presupuesto fijo de $200/semana
- Después: presupuesto = ventas de la campaña ÷ 2.5
- Tope de $800, excedente crea/fluye a campaña hija
- Cada campaña puede tener hasta 4 participantes (1 dueño + 3 invitados)
- Participantes pueden atribuir sus ventas a la campaña

4. EMBUDO DE VENTAS
Etapas: Prospecto → Cotizado → Agendado → Instalado
Solo "Instalado" cuenta para el KPI de 30 días.

IMPORTANTE: SIEMPRE responde en español. Sé conciso, amigable y orientado a acciones. Usa formato markdown cuando sea útil (listas, negritas, etc.).`

const PLATFORM_RULES_EN = `You are the Pakoa assistant, an MLM sales platform for telecommunications services. Your goal is to help the user maximize their income.

PLATFORM RULES:

1. KEY TO THE KINGDOM (Llave del Reino)
- Threshold: $15,000 in sales (sum of last 30 days)
- Evaluation: Every Wednesday at 00:00 CST (Mexico City time)
- Binary status: Active or Inactive for that week
- Must be maintained each week

2. COMMUNITY COMMISSIONS
Only earned if you have the Key active.
- Children (Level 1): 8% of their sales
- Grandchildren (Level 2): 12% - requires connecting Child to have Key
- Great-grandchildren (Level 3): 20% - requires complete chain (Child + Grandchild with Key)
- Maximum 3 levels deep, never earned from great-great-grandchildren

CHAIN RULE: Commissions only flow through unbroken chains where each person in the path has an active Key.

3. CAMPAIGNS
- Created automatically when you earn the Key for the first time
- First 2 weeks: fixed budget of $200/week
- After: budget = campaign sales ÷ 2.5
- Cap of $800, excess creates/flows to child campaign
- Each campaign can have up to 4 participants (1 owner + 3 guests)
- Participants can attribute their sales to the campaign

4. SALES FUNNEL
Stages: Prospect → Quoted → Scheduled → Installed
Only "Installed" counts towards the 30-day KPI.

IMPORTANT: ALWAYS respond in English. Be concise, friendly, and action-oriented. Use markdown formatting when helpful (lists, bold, etc.).`

// Get platform rules based on language
function getPlatformRules(language: string): string {
  return language === 'en' ? PLATFORM_RULES_EN : PLATFORM_RULES_ES
}

// Calculate days until next Wednesday
function getDaysUntilWednesday(): number {
  const now = new Date()
  const dayOfWeek = now.getDay()
  // Wednesday is 3
  const daysUntil = (3 - dayOfWeek + 7) % 7
  return daysUntil === 0 ? 7 : daysUntil
}

// Get team members (hijos, nietos, bisnietos) for a user
function getTeamMembers(userId: string) {
  const user = getUserById(userId)
  if (!user) return { hijos: [], nietos: [], bisnietos: [] }

  // Get direct children (hijos)
  const hijos = mockUsers.filter(u => u.parentId === userId)

  // Get grandchildren (nietos) - children of hijos
  const hijosIds = hijos.map(h => h.id)
  const nietos = mockUsers.filter(u => u.parentId && hijosIds.includes(u.parentId))

  // Get great-grandchildren (bisnietos) - children of nietos
  const nietosIds = nietos.map(n => n.id)
  const bisnietos = mockUsers.filter(u => u.parentId && nietosIds.includes(u.parentId))

  return { hijos, nietos, bisnietos }
}

// Calculate commissions
function calculateCommissions(userId: string) {
  const user = getUserById(userId)
  if (!user || !hasLlave(user.sales30d)) {
    return { total: 0, fromHijos: 0, fromNietos: 0, fromBisnietos: 0 }
  }

  const { hijos, nietos, bisnietos } = getTeamMembers(userId)

  // Weekly sales (approximate from 30-day)
  const getWeeklySales = (sales30d: number) => sales30d / 4

  // Hijos: 8%
  const fromHijos = hijos.reduce((sum, h) => sum + getWeeklySales(h.sales30d) * 0.08, 0)

  // Nietos: 12% (only if connecting hijo has Llave)
  const fromNietos = nietos.reduce((sum, n) => {
    const connectingHijo = hijos.find(h => h.id === n.parentId)
    if (connectingHijo && hasLlave(connectingHijo.sales30d)) {
      return sum + getWeeklySales(n.sales30d) * 0.12
    }
    return sum
  }, 0)

  // Bisnietos: 20% (only if full chain has Llave)
  const fromBisnietos = bisnietos.reduce((sum, b) => {
    const connectingNieto = nietos.find(n => n.id === b.parentId)
    if (!connectingNieto || !hasLlave(connectingNieto.sales30d)) return sum

    const connectingHijo = hijos.find(h => h.id === connectingNieto.parentId)
    if (!connectingHijo || !hasLlave(connectingHijo.sales30d)) return sum

    return sum + getWeeklySales(b.sales30d) * 0.20
  }, 0)

  return {
    total: Math.round((fromHijos + fromNietos + fromBisnietos) * 100) / 100,
    fromHijos: Math.round(fromHijos * 100) / 100,
    fromNietos: Math.round(fromNietos * 100) / 100,
    fromBisnietos: Math.round(fromBisnietos * 100) / 100
  }
}

// Get funnel stats from sales
function getFunnelStats(sales: Sale[]) {
  const prospectos = sales.filter(s => s.funnelStatus === 'PROSPECTO')
  const cotizados = sales.filter(s => s.funnelStatus === 'COTIZADO')
  const agendados = sales.filter(s => s.funnelStatus === 'AGENDADO')
  const instalados = sales.filter(s => s.funnelStatus === 'INSTALADO')

  return {
    prospectos: {
      count: prospectos.length,
      value: prospectos.reduce((sum, s) => sum + s.amount, 0)
    },
    cotizados: {
      count: cotizados.length,
      value: cotizados.reduce((sum, s) => sum + s.amount, 0)
    },
    agendados: {
      count: agendados.length,
      value: agendados.reduce((sum, s) => sum + s.amount, 0)
    },
    instalados: {
      count: instalados.length,
      value: instalados.reduce((sum, s) => sum + s.amount, 0)
    }
  }
}

// Get team members at risk or close to Llave
function getTeamAtRisk(userId: string) {
  const { hijos, nietos, bisnietos } = getTeamMembers(userId)
  const allTeam = [...hijos, ...nietos, ...bisnietos]

  const atRisk: UserContext['teamAtRisk'] = []

  allTeam.forEach(member => {
    const relationship = hijos.includes(member) ? 'hijo/a' :
      nietos.includes(member) ? 'nieto/a' : 'bisnieto/a'

    if (isAtRisk(member.sales30d)) {
      // Close to Llave but at risk of not reaching it
      atRisk.push({
        name: member.name,
        relationship,
        sales30d: member.sales30d,
        status: 'at_risk'
      })
    } else if (member.sales30d >= LLAVE_THRESHOLD * 0.7 && member.sales30d < LLAVE_THRESHOLD) {
      // Close to achieving Llave
      atRisk.push({
        name: member.name,
        relationship,
        sales30d: member.sales30d,
        status: 'close_to_llave'
      })
    } else if (member.sales30d < LLAVE_THRESHOLD * 0.3 && member.sales30d > 0) {
      // Low activity
      atRisk.push({
        name: member.name,
        relationship,
        sales30d: member.sales30d,
        status: 'inactive'
      })
    }
  })

  return atRisk.slice(0, 5) // Top 5
}

// Build user context for the prompt
function buildUserContext(userId: string): UserContext {
  const user = getUserById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  const sales = getUserSales(userId)
  const { hijos, nietos, bisnietos } = getTeamMembers(userId)
  const commissions = calculateCommissions(userId)
  const funnel = getFunnelStats(sales)
  const teamAtRisk = getTeamAtRisk(userId)

  const ownedCampaigns = getUserCampaignsAsOwner(userId)
  const participatingCampaigns = getUserCampaignsAsParticipant(userId)
  const totalBudget = getUserTotalBudgetThisWeek(userId)

  return {
    name: user.name,
    hasLlave: hasLlave(user.sales30d),
    sales30d: user.sales30d,
    llavePercentage: Math.round((user.sales30d / LLAVE_THRESHOLD) * 100),
    daysUntilWednesday: getDaysUntilWednesday(),
    team: {
      hijos: {
        total: hijos.length,
        withLlave: hijos.filter(h => hasLlave(h.sales30d)).length
      },
      nietos: {
        total: nietos.length,
        withLlave: nietos.filter(n => hasLlave(n.sales30d)).length
      },
      bisnietos: {
        total: bisnietos.length
      }
    },
    commissions,
    campaigns: {
      owned: ownedCampaigns.length,
      participating: participatingCampaigns.length,
      totalBudget
    },
    funnel,
    teamAtRisk
  }
}

// Format user context as prompt text (Spanish)
function formatUserContextPromptES(ctx: UserContext): string {
  const teamAtRiskText = ctx.teamAtRisk.length > 0
    ? ctx.teamAtRisk.map(m => {
        const statusText = m.status === 'at_risk' ? 'en riesgo de perder Llave' :
          m.status === 'close_to_llave' ? 'cerca de obtener Llave' : 'baja actividad'
        return `- ${m.name} (${m.relationship}): $${m.sales30d.toLocaleString()} - ${statusText}`
      }).join('\n')
    : 'Ninguno requiere atención urgente'

  return `
DATOS DEL USUARIO ACTUAL:

Nombre: ${ctx.name}
Llave del Reino: ${ctx.hasLlave ? 'Activa' : 'Inactiva'}
Ventas 30 días: $${ctx.sales30d.toLocaleString()} (${ctx.llavePercentage}% del umbral de $15,000)
${!ctx.hasLlave ? `Faltan: $${(LLAVE_THRESHOLD - ctx.sales30d).toLocaleString()} para activar la Llave` : ''}
Días para próximo miércoles: ${ctx.daysUntilWednesday}

Equipo:
- Hijos: ${ctx.team.hijos.total} (${ctx.team.hijos.withLlave} con Llave)
- Nietos: ${ctx.team.nietos.total} (${ctx.team.nietos.withLlave} con Llave)
- Bisnietos: ${ctx.team.bisnietos.total}

Comisiones esta semana: $${ctx.commissions.total.toLocaleString()}
- De Hijos (8%): $${ctx.commissions.fromHijos.toLocaleString()}
- De Nietos (12%): $${ctx.commissions.fromNietos.toLocaleString()}
- De Bisnietos (20%): $${ctx.commissions.fromBisnietos.toLocaleString()}

Campañas:
- Propias: ${ctx.campaigns.owned}
- Donde participa: ${ctx.campaigns.participating}
- Presupuesto total esta semana: $${ctx.campaigns.totalBudget.toLocaleString()}

Embudo actual:
- Prospectos: ${ctx.funnel.prospectos.count} ($${ctx.funnel.prospectos.value.toLocaleString()} potencial)
- Cotizados: ${ctx.funnel.cotizados.count} ($${ctx.funnel.cotizados.value.toLocaleString()} potencial)
- Agendados: ${ctx.funnel.agendados.count} ($${ctx.funnel.agendados.value.toLocaleString()} potencial)
- Instalados: ${ctx.funnel.instalados.count} ($${ctx.funnel.instalados.value.toLocaleString()})

Miembros del equipo que necesitan atención:
${teamAtRiskText}`
}

// Format user context as prompt text (English)
function formatUserContextPromptEN(ctx: UserContext): string {
  const teamAtRiskText = ctx.teamAtRisk.length > 0
    ? ctx.teamAtRisk.map(m => {
        const relationship = m.relationship === 'hijo/a' ? 'child' :
          m.relationship === 'nieto/a' ? 'grandchild' : 'great-grandchild'
        const statusText = m.status === 'at_risk' ? 'at risk of losing Key' :
          m.status === 'close_to_llave' ? 'close to earning Key' : 'low activity'
        return `- ${m.name} (${relationship}): $${m.sales30d.toLocaleString()} - ${statusText}`
      }).join('\n')
    : 'No one needs urgent attention'

  return `
CURRENT USER DATA:

Name: ${ctx.name}
Key to the Kingdom: ${ctx.hasLlave ? 'Active' : 'Inactive'}
30-day Sales: $${ctx.sales30d.toLocaleString()} (${ctx.llavePercentage}% of $15,000 threshold)
${!ctx.hasLlave ? `Needed: $${(LLAVE_THRESHOLD - ctx.sales30d).toLocaleString()} to activate the Key` : ''}
Days until next Wednesday: ${ctx.daysUntilWednesday}

Team:
- Children: ${ctx.team.hijos.total} (${ctx.team.hijos.withLlave} with Key)
- Grandchildren: ${ctx.team.nietos.total} (${ctx.team.nietos.withLlave} with Key)
- Great-grandchildren: ${ctx.team.bisnietos.total}

Commissions this week: $${ctx.commissions.total.toLocaleString()}
- From Children (8%): $${ctx.commissions.fromHijos.toLocaleString()}
- From Grandchildren (12%): $${ctx.commissions.fromNietos.toLocaleString()}
- From Great-grandchildren (20%): $${ctx.commissions.fromBisnietos.toLocaleString()}

Campaigns:
- Owned: ${ctx.campaigns.owned}
- Participating in: ${ctx.campaigns.participating}
- Total budget this week: $${ctx.campaigns.totalBudget.toLocaleString()}

Current Funnel:
- Prospects: ${ctx.funnel.prospectos.count} ($${ctx.funnel.prospectos.value.toLocaleString()} potential)
- Quoted: ${ctx.funnel.cotizados.count} ($${ctx.funnel.cotizados.value.toLocaleString()} potential)
- Scheduled: ${ctx.funnel.agendados.count} ($${ctx.funnel.agendados.value.toLocaleString()} potential)
- Installed: ${ctx.funnel.instalados.count} ($${ctx.funnel.instalados.value.toLocaleString()})

Team members needing attention:
${teamAtRiskText}`
}

// Get formatted user context based on language
function formatUserContextPrompt(ctx: UserContext, language: string): string {
  return language === 'en' ? formatUserContextPromptEN(ctx) : formatUserContextPromptES(ctx)
}

// Convert messages to Anthropic format
function formatMessagesForAPI(messages: AssistantMessage[]): Array<{ role: 'user' | 'assistant'; content: string }> {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }))
}

// Main function to send message to assistant
export async function sendAssistantMessage(
  userMessage: string,
  conversationHistory: AssistantMessage[],
  userId: string,
  language: string = 'es'
): Promise<string> {
  // Check if API key is configured
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    // Return mock response for development without API key
    return getMockResponse(userMessage, userId, language)
  }

  try {
    // Build user context
    const userContext = buildUserContext(userId)
    const userContextPrompt = formatUserContextPrompt(userContext, language)

    // Build full system prompt with language-specific rules
    const systemPrompt = `${getPlatformRules(language)}\n\n${userContextPrompt}`

    // Format conversation history
    const formattedHistory = formatMessagesForAPI(conversationHistory)

    // Add current message
    const messages = [
      ...formattedHistory,
      { role: 'user' as const, content: userMessage }
    ]

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages
    })

    // Extract text from response
    const textBlock = response.content.find(block => block.type === 'text')
    return textBlock?.text || 'Lo siento, no pude generar una respuesta.'
  } catch (error) {
    console.error('Error calling Claude API:', error)
    throw error
  }
}

// Mock responses for development without API key
function getMockResponse(message: string, userId: string, language: string = 'es'): string {
  const userContext = buildUserContext(userId)
  const messageLower = message.toLowerCase()
  const isEnglish = language === 'en'

  // Llave/Key questions
  if (messageLower.includes('llave') || messageLower.includes('key') || messageLower.includes('funciona') || messageLower.includes('how')) {
    if (isEnglish) {
      return `**The Key to the Kingdom** is activated when you accumulate **$15,000** in sales over the last 30 days.

It's evaluated every Wednesday at midnight. When active, you earn commissions from your community:
- **8%** from your children
- **12%** from grandchildren (if connecting child has Key)
- **20%** from great-grandchildren (if the entire chain has Key)

Currently you have **$${userContext.sales30d.toLocaleString()}** of the $15,000 needed (${userContext.llavePercentage}%).${!userContext.hasLlave ? ` You need **$${(LLAVE_THRESHOLD - userContext.sales30d).toLocaleString()}** more to activate it.` : ' You already have the Key active!'}`
    }
    return `**La Llave del Reino** se activa cuando acumulas **$15,000** en ventas en los últimos 30 días.

Se evalúa cada miércoles a medianoche. Si la tienes activa, ganas comisiones de tu comunidad:
- **8%** de tus hijos
- **12%** de nietos (si el hijo conectante tiene Llave)
- **20%** de bisnietos (si toda la cadena tiene Llave)

Actualmente llevas **$${userContext.sales30d.toLocaleString()}** de los $15,000 necesarios (${userContext.llavePercentage}%).${!userContext.hasLlave ? ` Te faltan **$${(LLAVE_THRESHOLD - userContext.sales30d).toLocaleString()}** para activarla.` : ' ¡Ya tienes la Llave activa!'}`
  }

  // Sales questions
  if (messageLower.includes('ventas') || messageLower.includes('sales') || messageLower.includes('cómo voy') || messageLower.includes('como voy') || messageLower.includes('how am i')) {
    const pipelineTotal = userContext.funnel.prospectos.value + userContext.funnel.cotizados.value + userContext.funnel.agendados.value

    if (isEnglish) {
      return `**Your sales summary:**

- 30-day Sales: **$${userContext.sales30d.toLocaleString()}** (${userContext.llavePercentage}% of Key threshold)
${!userContext.hasLlave ? `- You need: **$${(LLAVE_THRESHOLD - userContext.sales30d).toLocaleString()}**` : '- **Key is active!**'}
- Days until Wednesday: **${userContext.daysUntilWednesday}**

**Your funnel:**
- ${userContext.funnel.prospectos.count} prospects ($${userContext.funnel.prospectos.value.toLocaleString()})
- ${userContext.funnel.cotizados.count} quoted ($${userContext.funnel.cotizados.value.toLocaleString()})
- ${userContext.funnel.agendados.count} scheduled ($${userContext.funnel.agendados.value.toLocaleString()})

You have **$${pipelineTotal.toLocaleString()}** in potential in your funnel.`
    }

    return `**Resumen de tus ventas:**

- Ventas 30 días: **$${userContext.sales30d.toLocaleString()}** (${userContext.llavePercentage}% de la Llave)
${!userContext.hasLlave ? `- Te faltan: **$${(LLAVE_THRESHOLD - userContext.sales30d).toLocaleString()}**` : '- **¡Llave activa!**'}
- Días hasta el miércoles: **${userContext.daysUntilWednesday}**

**Tu embudo:**
- ${userContext.funnel.prospectos.count} prospectos ($${userContext.funnel.prospectos.value.toLocaleString()})
- ${userContext.funnel.cotizados.count} cotizados ($${userContext.funnel.cotizados.value.toLocaleString()})
- ${userContext.funnel.agendados.count} agendados ($${userContext.funnel.agendados.value.toLocaleString()})

Tienes **$${pipelineTotal.toLocaleString()}** en potencial en tu embudo.`
  }

  // Team questions
  if (messageLower.includes('equipo') || messageLower.includes('team') || messageLower.includes('ayuda') || messageLower.includes('help') || messageLower.includes('quién necesita') || messageLower.includes('who needs')) {
    if (userContext.teamAtRisk.length === 0) {
      if (isEnglish) {
        return `Your team is in good shape. You have:
- **${userContext.team.hijos.total}** children (${userContext.team.hijos.withLlave} with Key)
- **${userContext.team.nietos.total}** grandchildren (${userContext.team.nietos.withLlave} with Key)
- **${userContext.team.bisnietos.total}** great-grandchildren

Everyone seems to be on track. Keep it up!`
      }
      return `Tu equipo está en buen estado. Tienes:
- **${userContext.team.hijos.total}** hijos (${userContext.team.hijos.withLlave} con Llave)
- **${userContext.team.nietos.total}** nietos (${userContext.team.nietos.withLlave} con Llave)
- **${userContext.team.bisnietos.total}** bisnietos

Todos parecen estar en camino. ¡Sigue así!`
    }

    const atRiskList = userContext.teamAtRisk.map(m => {
      const statusEmoji = m.status === 'at_risk' ? '⚠️' : m.status === 'close_to_llave' ? '📈' : '💤'
      const relationship = isEnglish
        ? (m.relationship === 'hijo/a' ? 'child' : m.relationship === 'nieto/a' ? 'grandchild' : 'great-grandchild')
        : m.relationship
      return `${statusEmoji} **${m.name}** (${relationship}): $${m.sales30d.toLocaleString()}`
    }).join('\n')

    if (isEnglish) {
      return `**Team members needing attention:**

${atRiskList}

I recommend contacting those close to the Key (📈) first - one more sale could activate it and generate commissions for you.`
    }

    return `**Miembros que necesitan atención:**

${atRiskList}

Te recomiendo contactar primero a quienes están cerca de la Llave (📈) - una venta más podría activarla y generar comisiones para ti.`
  }

  // Campaign questions
  if (messageLower.includes('campaña') || messageLower.includes('campaign')) {
    if (isEnglish) {
      return `**Your campaigns:**

- Owned campaigns: **${userContext.campaigns.owned}**
- Participating in: **${userContext.campaigns.participating}**
- Total budget this week: **$${userContext.campaigns.totalBudget.toLocaleString()}**

Campaigns give you marketing budget based on your sales. During the first 2 weeks you receive $200/week, after that your budget = sales ÷ 2.5 (max $800).`
    }

    return `**Tus campañas:**

- Campañas propias: **${userContext.campaigns.owned}**
- Donde participas: **${userContext.campaigns.participating}**
- Presupuesto total esta semana: **$${userContext.campaigns.totalBudget.toLocaleString()}**

Las campañas te dan presupuesto de marketing basado en tus ventas. Durante las primeras 2 semanas recibes $200/semana, después tu presupuesto = ventas ÷ 2.5 (máximo $800).`
  }

  // Commission questions
  if (messageLower.includes('comision') || messageLower.includes('commission')) {
    if (!userContext.hasLlave) {
      if (isEnglish) {
        return `Currently **you don't have the Key active**, so you're not earning commissions from your team.

To activate it you need **$${(LLAVE_THRESHOLD - userContext.sales30d).toLocaleString()}** more in sales.

Once active, you could earn:
- 8% from your ${userContext.team.hijos.total} children
- 12% from your ${userContext.team.nietos.total} grandchildren
- 20% from your ${userContext.team.bisnietos.total} great-grandchildren`
      }
      return `Actualmente **no tienes la Llave activa**, por lo que no estás generando comisiones de tu equipo.

Para activarla necesitas **$${(LLAVE_THRESHOLD - userContext.sales30d).toLocaleString()}** más en ventas.

Una vez activa, podrías ganar:
- 8% de tus ${userContext.team.hijos.total} hijos
- 12% de tus ${userContext.team.nietos.total} nietos
- 20% de tus ${userContext.team.bisnietos.total} bisnietos`
    }

    if (isEnglish) {
      return `**Your commissions this week:**

- Total: **$${userContext.commissions.total.toLocaleString()}**
- From children (8%): $${userContext.commissions.fromHijos.toLocaleString()}
- From grandchildren (12%): $${userContext.commissions.fromNietos.toLocaleString()}
- From great-grandchildren (20%): $${userContext.commissions.fromBisnietos.toLocaleString()}

Remember that you only receive commissions from levels where the chain is complete (each person in the path must have Key).`
    }

    return `**Tus comisiones esta semana:**

- Total: **$${userContext.commissions.total.toLocaleString()}**
- De hijos (8%): $${userContext.commissions.fromHijos.toLocaleString()}
- De nietos (12%): $${userContext.commissions.fromNietos.toLocaleString()}
- De bisnietos (20%): $${userContext.commissions.fromBisnietos.toLocaleString()}

Recuerda que solo recibes comisiones de niveles donde la cadena está completa (cada persona en el camino debe tener Llave).`
  }

  // Default response
  if (isEnglish) {
    return `Hi ${userContext.name}! I'm your Pakoa assistant. I can help you with:

- **Key to the Kingdom**: How it works and your progress
- **Sales**: Your current status and funnel
- **Team**: Who needs help
- **Campaigns**: Budget and overflow
- **Commissions**: How much you're earning

How can I help you?`
  }

  return `¡Hola ${userContext.name}! Soy tu asistente de Pakoa. Puedo ayudarte con:

- **Llave del Reino**: Cómo funciona y tu progreso
- **Ventas**: Tu estado actual y embudo
- **Equipo**: Quién necesita ayuda
- **Campañas**: Presupuesto y overflow
- **Comisiones**: Cuánto estás ganando

¿En qué te puedo ayudar?`
}
