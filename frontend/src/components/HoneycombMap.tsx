import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  mockUsers,
  getUserById,
  hasLlave,
  LLAVE_THRESHOLD,
} from '@/data/mockData'

// Types
interface NodeData {
  name: string
  email: string
  revenue: number
  userId: string
}

interface HexNode {
  id: string
  x: number
  y: number
  size: number
  level: number
  parentId: string | null
}

interface Edge {
  from: string
  to: string
  x1: number
  y1: number
  x2: number
  y2: number
}

interface SelectedNode extends HexNode, NodeData {}

interface HoneycombMapProps {
  rootUserId: string
}

// Build filled slots from actual user data
function buildFilledSlots(rootUserId: string): Record<string, NodeData> {
  const slots: Record<string, NodeData> = {}
  const rootUser = getUserById(rootUserId)

  if (!rootUser) return slots

  // Root user
  slots['root'] = {
    name: rootUser.name,
    email: rootUser.email,
    revenue: rootUser.sales30d,
    userId: rootUser.id,
  }

  // Get direct children (hijos)
  const children = mockUsers.filter(u => u.parentId === rootUserId)
  children.forEach((child, i) => {
    if (i < 6) { // Max 6 children slots
      const childSlotId = `C${i}`
      slots[childSlotId] = {
        name: child.name,
        email: child.email,
        revenue: child.sales30d,
        userId: child.id,
      }

      // Get grandchildren (nietos)
      const grandchildren = mockUsers.filter(u => u.parentId === child.id)
      grandchildren.forEach((gc, j) => {
        if (j < 6) { // Max 6 grandchildren slots per child
          const gcSlotId = `C${i}-G${j}`
          slots[gcSlotId] = {
            name: gc.name,
            email: gc.email,
            revenue: gc.sales30d,
            userId: gc.id,
          }

          // Get great-grandchildren (bisnietos)
          const greatGrandchildren = mockUsers.filter(u => u.parentId === gc.id)
          greatGrandchildren.forEach((ggc, k) => {
            if (k < 6) { // Max 6 great-grandchildren slots per grandchild
              const ggcSlotId = `C${i}-G${j}-GG${k}`
              slots[ggcSlotId] = {
                name: ggc.name,
                email: ggc.email,
                revenue: ggc.sales30d,
                userId: ggc.id,
              }
            }
          })
        }
      })
    }
  })

  return slots
}

const getNodeColor = (revenue: number): string => {
  if (revenue >= 17000) return '#22c55e' // green - above threshold
  if (revenue >= LLAVE_THRESHOLD) return '#eab308' // yellow - at threshold
  if (revenue >= 12000) return '#6b7280' // gray - at risk
  return '#ef4444' // red - inactive
}

const hexPoints = (cx: number, cy: number, size: number): string => {
  const points: string[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6
    points.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`)
  }
  return points.join(' ')
}

interface HierarchyConfig {
  sizes: number[]
  levelDistances: number[]
}

const generateHierarchy = (
  centerX: number,
  centerY: number,
  config: HierarchyConfig
): { nodes: HexNode[]; edges: Edge[] } => {
  const nodes: HexNode[] = []
  const edges: Edge[] = []

  const { sizes, levelDistances } = config

  // Root
  nodes.push({
    id: 'root',
    x: centerX,
    y: centerY,
    size: sizes[0],
    level: 0,
    parentId: null,
  })

  // Level 1: 6 Children
  for (let i = 0; i < 6; i++) {
    const angle = ((i * 60 - 90) * Math.PI) / 180
    const distance = levelDistances[1]
    const childX = centerX + distance * Math.cos(angle)
    const childY = centerY + distance * Math.sin(angle)
    const childId = `C${i}`

    nodes.push({
      id: childId,
      x: childX,
      y: childY,
      size: sizes[1],
      level: 1,
      parentId: 'root',
    })
    edges.push({
      from: 'root',
      to: childId,
      x1: centerX,
      y1: centerY,
      x2: childX,
      y2: childY,
    })

    // Level 2: 6 Grandchildren per child
    for (let j = 0; j < 6; j++) {
      const gcAngle = ((j * 60 - 90) * Math.PI) / 180
      const gcDistance = levelDistances[2]
      const gcX = childX + gcDistance * Math.cos(gcAngle)
      const gcY = childY + gcDistance * Math.sin(gcAngle)
      const gcId = `C${i}-G${j}`

      nodes.push({
        id: gcId,
        x: gcX,
        y: gcY,
        size: sizes[2],
        level: 2,
        parentId: childId,
      })
      edges.push({
        from: childId,
        to: gcId,
        x1: childX,
        y1: childY,
        x2: gcX,
        y2: gcY,
      })

      // Level 3: 6 Great-grandchildren per grandchild
      for (let k = 0; k < 6; k++) {
        const ggcAngle = ((k * 60 - 90) * Math.PI) / 180
        const ggcDistance = levelDistances[3]
        const ggcX = gcX + ggcDistance * Math.cos(ggcAngle)
        const ggcY = gcY + ggcDistance * Math.sin(ggcAngle)
        const ggcId = `C${i}-G${j}-GG${k}`

        nodes.push({
          id: ggcId,
          x: ggcX,
          y: ggcY,
          size: sizes[3],
          level: 3,
          parentId: gcId,
        })
        edges.push({
          from: gcId,
          to: ggcId,
          x1: gcX,
          y1: gcY,
          x2: ggcX,
          y2: ggcY,
        })
      }
    }
  }

  return { nodes, edges }
}

const DEFAULT_ZOOM = 4

export function HoneycombMap({ rootUserId }: HoneycombMapProps) {
  const { t } = useTranslation()
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null)
  const [zoom, setZoom] = useState(DEFAULT_ZOOM)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Build slots from actual user data
  const filledSlots = useMemo(() => buildFilledSlots(rootUserId), [rootUserId])

  // Fixed parameters
  const sizes = [90, 45, 22, 11] // Root, Child, Grandchild, Great-grandchild
  const levelDistances = [0, 415, 135, 46] // Distance from parent to child at each level

  const centerX = 3000
  const centerY = 3000

  const config = { sizes, levelDistances }

  const { nodes, edges } = useMemo(
    () => generateHierarchy(centerX, centerY, config),
    [centerX, centerY]
  )

  const stats = useMemo(() => {
    const filledNodes = nodes.filter((n) => filledSlots[n.id])
    return {
      hijosActivos: filledNodes.filter(
        (n) => n.level === 1 && hasLlave(filledSlots[n.id]?.revenue || 0)
      ).length,
      hijosAsignados: filledNodes.filter((n) => n.level === 1).length,
      nietosAsignados: filledNodes.filter((n) => n.level === 2).length,
      bisnietosAsignados: filledNodes.filter((n) => n.level === 3).length,
      totalSlots: nodes.length,
      filledSlots: Object.keys(filledSlots).length,
    }
  }, [nodes, filledSlots])

  // Handle trackpad gestures: pinch-to-zoom and two-finger scroll
  const handleWheelEvent = useCallback((e: WheelEvent) => {
    e.preventDefault()

    // Pinch-to-zoom: ctrlKey is true when using trackpad pinch gesture
    if (e.ctrlKey || e.metaKey) {
      // Zoom - pinch gesture
      const zoomSensitivity = 0.02
      setZoom(z => {
        const newZoom = z * (1 - e.deltaY * zoomSensitivity)
        return Math.max(0.5, Math.min(15, newZoom))
      })
    } else {
      // Pan - two-finger scroll
      const panSensitivity = 1.5
      setPan(p => ({
        x: p.x - e.deltaX * panSensitivity,
        y: p.y - e.deltaY * panSensitivity,
      }))
    }
  }, [])

  // Attach wheel event listener with { passive: false } to allow preventDefault
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheelEvent, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheelEvent)
    }
  }, [handleWheelEvent])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleReset = () => {
    setZoom(DEFAULT_ZOOM)
    setPan({ x: 0, y: 0 })
  }

  const viewBoxSize = 6000 / zoom
  const viewBoxOffset = 3000 - viewBoxSize / 2
  const panScaled = { x: (pan.x / zoom) * -1, y: (pan.y / zoom) * -1 }

  const levelNames = [t('map.levelNames.you'), t('map.levelNames.child'), t('map.levelNames.grandchild'), t('map.levelNames.greatGrandchild')]

  // Get root user name for the title
  const rootUser = getUserById(rootUserId)

  return (
    <div className="flex h-[700px] rounded-lg overflow-hidden border border-border bg-gradient-to-br from-slate-800 via-cyan-900 to-slate-900 text-white">
      {/* Main visualization */}
      <div ref={containerRef} className="flex-1 relative">
        {/* Controls */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium shadow-lg transition-colors"
          >
            {t('common.reset')}
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(z * 1.5, 15))}
            className="px-4 py-2 bg-slate-700/80 hover:bg-slate-600 rounded-lg transition-colors"
          >
            +
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z / 1.5, 0.1))}
            className="px-4 py-2 bg-slate-700/80 hover:bg-slate-600 rounded-lg transition-colors"
          >
            −
          </button>
        </div>

        {/* Title */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-center">
          <h2 className="text-xl font-bold">{t('map.title')}</h2>
          <p className="text-sm text-white/50">
            {rootUser?.name || 'Usuario'} - Trackpad: {t('map.trackpadInstructions')}
          </p>
        </div>

        <svg
          width="100%"
          height="100%"
          viewBox={`${viewBoxOffset + panScaled.x} ${viewBoxOffset + panScaled.y} ${viewBoxSize} ${viewBoxSize}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect x="-1000" y="-1000" width="8000" height="8000" fill="#1a3545" />

          {/* Draw edges first */}
          {edges.map((edge, i) => {
            const isFilled =
              filledSlots[edge.from] && filledSlots[edge.to]
            return (
              <line
                key={i}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke={
                  isFilled ? 'rgba(80,180,220,0.9)' : 'rgba(60,110,140,0.25)'
                }
                strokeWidth={isFilled ? 5 : 2}
              />
            )
          })}

          {/* Draw hexagons by level */}
          {[3, 2, 1, 0].map((level) => (
            <g key={level}>
              {nodes
                .filter((n) => n.level === level)
                .map((node) => {
                  const data = filledSlots[node.id]
                  const isFilled = !!data
                  const isSelected = selectedNode?.id === node.id
                  const color = isFilled
                    ? getNodeColor(data.revenue)
                    : 'transparent'

                  return (
                    <g
                      key={node.id}
                      onClick={() =>
                        isFilled &&
                        setSelectedNode({ ...node, ...data } as SelectedNode)
                      }
                      className={isFilled ? 'cursor-pointer' : ''}
                    >
                      <polygon
                        points={hexPoints(node.x, node.y, node.size)}
                        fill={isFilled ? color : 'rgba(35,65,85,0.6)'}
                        stroke={
                          isSelected
                            ? '#fff'
                            : isFilled
                              ? 'rgba(255,255,255,0.8)'
                              : 'rgba(70,110,140,0.5)'
                        }
                        strokeWidth={isSelected ? 5 : isFilled ? 3 : 1.5}
                        filter={isFilled ? 'url(#glow)' : ''}
                        className="transition-all duration-150 hover:brightness-110"
                      />

                      {isFilled && node.size >= 15 && (
                        <text
                          x={node.x}
                          y={node.y + node.size * 0.12}
                          textAnchor="middle"
                          fill="white"
                          fontSize={node.size * 0.5}
                          fontWeight="bold"
                          className="pointer-events-none"
                        >
                          {data.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </text>
                      )}

                      {!isFilled && node.size >= 15 && (
                        <text
                          x={node.x}
                          y={node.y + node.size * 0.15}
                          textAnchor="middle"
                          fill="rgba(90,130,160,0.5)"
                          fontSize={node.size * 0.5}
                          className="pointer-events-none"
                        >
                          +
                        </text>
                      )}
                    </g>
                  )
                })}
            </g>
          ))}
        </svg>

        {/* Stats */}
        <div className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur rounded-lg px-4 py-2 text-sm flex gap-4">
          <div>
            <span className="text-white/50">{t('map.totalSlots')} </span>
            <span className="font-bold">{stats.totalSlots}</span>
          </div>
          <div>
            <span className="text-white/50">{t('map.occupied')} </span>
            <span className="font-bold text-green-400">{stats.filledSlots}</span>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-64 bg-slate-800/30 p-4 space-y-4 border-l border-white/10">
        <div className="bg-slate-700/30 rounded-xl p-4">
          <h3 className="font-bold mb-3">{t('legend.title')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>{t('legend.above17k')}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span>{t('legend.15kTo17k')}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-gray-500"></div>
              <span>{t('legend.12kTo15k')}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>{t('legend.below12k')}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-700/30 rounded-xl p-4">
          <h3 className="font-bold mb-3">{t('team.myCommunity')}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">{t('team.activeChildren')}</span>
              <span className="font-bold text-green-400">{stats.hijosActivos}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">{t('team.totalChildren')}</span>
              <span className="font-bold">{stats.hijosAsignados}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">{t('team.grandchildren')}</span>
              <span className="font-bold">{stats.nietosAsignados}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">{t('team.greatGrandchildren')}</span>
              <span className="font-bold">{stats.bisnietosAsignados}</span>
            </div>
          </div>
        </div>

        {selectedNode && (
          <div className="bg-cyan-600/20 rounded-xl p-4 border border-cyan-500/30">
            <h3 className="font-bold mb-2">{selectedNode.name}</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-white/70">{t('team.level')}</span>
                <span>{levelNames[selectedNode.level]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">{t('llave.sales30d')}</span>
                <span
                  className="font-bold"
                  style={{ color: getNodeColor(selectedNode.revenue) }}
                >
                  ${selectedNode.revenue?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">{t('common.status')}</span>
                <span className={hasLlave(selectedNode.revenue) ? 'text-green-400' : 'text-red-400'}>
                  {hasLlave(selectedNode.revenue) ? t('common.active') : t('common.inactive')}
                </span>
              </div>
              {selectedNode.email && (
                <div className="pt-2 border-t border-white/10">
                  <span className="text-white/50 text-xs break-all">{selectedNode.email}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
