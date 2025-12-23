import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import {
  mockUsers,
  LLAVE_THRESHOLD,
} from '@/data/mockData'

// Types
interface UserNode {
  id: string
  name: string
  email: string
  revenue30Days: number
  parentId: string | null
  children: UserNode[]
}

interface VisualNode {
  id: string
  name: string
  revenue30Days: number
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

interface SelectedNode extends VisualNode {
  email?: string
  childCount: number
}

// Build tree structure from flat mockUsers data
function buildUserTree(): UserNode {
  // Create platform root
  const platformRoot: UserNode = {
    id: 'platform',
    name: 'PAKOA',
    email: 'platform@pakoa.com',
    revenue30Days: mockUsers.reduce((sum, u) => sum + u.sales30d, 0),
    parentId: null,
    children: [],
  }

  // Build tree recursively
  function buildChildren(parentId: string | undefined): UserNode[] {
    const children = mockUsers.filter(u => u.parentId === parentId)
    return children.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      revenue30Days: user.sales30d,
      parentId: parentId || null,
      children: buildChildren(user.id),
    }))
  }

  // Get top-level users (those with no parent or with undefined parentId)
  platformRoot.children = buildChildren(undefined)

  return platformRoot
}

// Helper functions
function getNodeColor(revenue: number): string {
  if (revenue >= 17000) return '#22c55e' // green
  if (revenue >= LLAVE_THRESHOLD) return '#eab308' // yellow
  if (revenue >= 12000) return '#6b7280' // gray
  return '#ef4444' // red
}

function countAllNodes(node: UserNode): number {
  let count = 1
  node.children.forEach(child => {
    count += countAllNodes(child)
  })
  return count
}

function countNodesByLevel(node: UserNode, level: number = 0): Record<number, number> {
  const counts: Record<number, number> = { [level]: 1 }
  node.children.forEach(child => {
    const childCounts = countNodesByLevel(child, level + 1)
    Object.entries(childCounts).forEach(([lvl, cnt]) => {
      counts[Number(lvl)] = (counts[Number(lvl)] || 0) + cnt
    })
  })
  return counts
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// Radial tree layout with strict DFS ordering to prevent edge crossings
// The key principle: nodes must maintain depth-first traversal order at every level
// Space is allocated dynamically based on subtree leaf counts
function generateRadialTree(
  root: UserNode,
  centerX: number,
  centerY: number,
  _scaleFactor: number
): { nodes: VisualNode[]; edges: Edge[] } {
  // Size decreases per level
  const sizes = [60, 38, 26, 18, 14, 12, 10]
  // Minimum base distances between levels
  const baseDistances = [0, 180, 120, 90, 70, 60, 50]
  // Minimum padding between nodes
  const nodePadding = 25

  // Step 1: Count leaves in each subtree (determines angular space allocation)
  const leafCounts: Map<string, number> = new Map()

  function countLeaves(node: UserNode): number {
    if (node.children.length === 0) {
      leafCounts.set(node.id, 1)
      return 1
    }
    const count = node.children.reduce((sum, child) => sum + countLeaves(child), 0)
    leafCounts.set(node.id, count)
    return count
  }
  countLeaves(root)

  // Step 2: Count nodes per level for radius calculation
  const nodesByLevel: Map<number, UserNode[]> = new Map()

  function collectByLevel(node: UserNode, level: number) {
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, [])
    }
    nodesByLevel.get(level)!.push(node)
    node.children.forEach(child => collectByLevel(child, level + 1))
  }
  collectByLevel(root, 0)

  // Step 3: Calculate radii for each level
  const maxLevel = Math.max(...nodesByLevel.keys())
  const levelRadii: number[] = [0]
  let cumulativeRadius = 0

  for (let level = 1; level <= maxLevel; level++) {
    const nodesAtLevel = nodesByLevel.get(level)?.length || 0
    const nodeSize = sizes[Math.min(level, sizes.length - 1)]
    const minDistance = baseDistances[Math.min(level, baseDistances.length - 1)]

    // Calculate minimum radius to fit all nodes at this level
    const circumferenceNeeded = nodesAtLevel * (2 * nodeSize + nodePadding)
    const minRadiusForNodes = circumferenceNeeded / (2 * Math.PI)

    cumulativeRadius = Math.max(
      cumulativeRadius + minDistance,
      minRadiusForNodes
    )
    levelRadii[level] = cumulativeRadius
  }

  // Step 4: Assign positions using recursive angular allocation
  // Each subtree gets a contiguous angular slice proportional to its leaf count
  interface NodePosition {
    id: string
    name: string
    revenue30Days: number
    level: number
    parentId: string | null
    angle: number
    startAngle: number
    endAngle: number
    radius: number
    size: number
    x: number
    y: number
  }

  const positions: Map<string, NodePosition> = new Map()

  function assignPositions(
    node: UserNode,
    level: number,
    parentId: string | null,
    startAngle: number,
    endAngle: number
  ) {
    const radius = levelRadii[level] || 0
    const size = sizes[Math.min(level, sizes.length - 1)]

    // Node is placed at the center of its allocated angular range
    const angle = (startAngle + endAngle) / 2

    positions.set(node.id, {
      id: node.id,
      name: node.name,
      revenue30Days: node.revenue30Days,
      level,
      parentId,
      angle,
      startAngle,
      endAngle,
      radius,
      size,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    })

    // Distribute angular space among children proportionally to their leaf counts
    if (node.children.length > 0) {
      const myLeafCount = leafCounts.get(node.id) || 1
      let currentAngle = startAngle

      node.children.forEach(child => {
        const childLeafCount = leafCounts.get(child.id) || 1
        const childProportion = childLeafCount / myLeafCount
        const childArcSpan = (endAngle - startAngle) * childProportion

        const childStartAngle = currentAngle
        const childEndAngle = currentAngle + childArcSpan

        assignPositions(child, level + 1, node.id, childStartAngle, childEndAngle)

        currentAngle = childEndAngle
      })
    }
  }

  // Start from top (-π/2), going full circle
  assignPositions(root, 0, null, -Math.PI / 2, 3 * Math.PI / 2)

  // Step 5: Relaxation pass - spread nodes within their allocated ranges
  // This ONLY adjusts spacing, never changes the relative order
  const iterations = 30

  for (let iter = 0; iter < iterations; iter++) {
    // For each level, check if adjacent nodes are too close
    for (let level = 1; level <= maxLevel; level++) {
      const nodesAtLevel = Array.from(positions.values())
        .filter(n => n.level === level)
        .sort((a, b) => a.angle - b.angle) // Already in DFS order, this just confirms

      const nodeSize = sizes[Math.min(level, sizes.length - 1)]
      const radius = levelRadii[level]
      const minAngularDist = (2 * nodeSize + nodePadding) / radius

      // Push apart nodes that are too close (within their allowed ranges)
      for (let i = 0; i < nodesAtLevel.length - 1; i++) {
        const current = nodesAtLevel[i]
        const next = nodesAtLevel[i + 1]

        const angleDiff = next.angle - current.angle

        if (angleDiff < minAngularDist) {
          const pushNeeded = (minAngularDist - angleDiff) / 2

          // Push current left (toward its startAngle) if there's room
          const currentCanMove = current.angle - current.startAngle
          const currentPush = Math.min(pushNeeded, currentCanMove * 0.5)

          // Push next right (toward its endAngle) if there's room
          const nextCanMove = next.endAngle - next.angle
          const nextPush = Math.min(pushNeeded, nextCanMove * 0.5)

          current.angle -= currentPush
          next.angle += nextPush

          // Update positions
          current.x = centerX + current.radius * Math.cos(current.angle)
          current.y = centerY + current.radius * Math.sin(current.angle)
          next.x = centerX + next.radius * Math.cos(next.angle)
          next.y = centerY + next.radius * Math.sin(next.angle)
        }
      }
    }

    // Parents adjust to stay centered among their children
    for (let level = maxLevel - 1; level >= 1; level--) {
      const nodesAtLevel = Array.from(positions.values()).filter(n => n.level === level)

      for (const node of nodesAtLevel) {
        const children = Array.from(positions.values()).filter(n => n.parentId === node.id)
        if (children.length > 0) {
          // Parent moves to midpoint between first and last child
          const sortedChildren = children.sort((a, b) => a.angle - b.angle)
          const firstChild = sortedChildren[0]
          const lastChild = sortedChildren[sortedChildren.length - 1]

          const targetAngle = (firstChild.angle + lastChild.angle) / 2

          // Stay within allocated range
          node.angle = Math.max(node.startAngle, Math.min(node.endAngle, targetAngle))
          node.x = centerX + node.radius * Math.cos(node.angle)
          node.y = centerY + node.radius * Math.sin(node.angle)
        }
      }
    }
  }

  // Step 6: Convert to output format
  const nodes: VisualNode[] = Array.from(positions.values()).map(pos => ({
    id: pos.id,
    name: pos.name,
    revenue30Days: pos.revenue30Days,
    x: pos.x,
    y: pos.y,
    size: pos.size,
    level: pos.level,
    parentId: pos.parentId,
  }))

  // Create edges
  const edges: Edge[] = []
  for (const node of nodes) {
    if (node.parentId) {
      const parent = positions.get(node.parentId)
      if (parent) {
        edges.push({
          from: node.parentId,
          to: node.id,
          x1: parent.x,
          y1: parent.y,
          x2: node.x,
          y2: node.y,
        })
      }
    }
  }

  return { nodes, edges }
}

// Calculate canvas size based on tree structure
function calculateCanvasSize(root: UserNode): number {
  const levelCounts = countNodesByLevel(root)
  const sizes = [60, 38, 26, 18, 14, 12, 10]
  const minDistances = [0, 180, 120, 90, 70, 60, 50]
  const nodePadding = 15

  let cumulativeRadius = 0
  const maxLevel = Math.max(...Object.keys(levelCounts).map(Number))

  for (let level = 1; level <= maxLevel; level++) {
    const nodeCount = levelCounts[level] || 0
    const nodeSize = sizes[Math.min(level, sizes.length - 1)]
    const minDistance = minDistances[Math.min(level, minDistances.length - 1)]
    const minRadiusForLevel = ((2 * nodeSize + nodePadding) * nodeCount) / (Math.PI * 2)

    cumulativeRadius = Math.max(cumulativeRadius + minDistance, minRadiusForLevel)
  }

  // Add padding around the edges
  const maxRadius = cumulativeRadius + 100
  return Math.max(3000, maxRadius * 2 + 200)
}

// Helper to find user by ID in tree
function findUserById(node: UserNode, id: string): UserNode | null {
  if (node.id === id) return node
  for (const child of node.children) {
    const found = findUserById(child, id)
    if (found) return found
  }
  return null
}

export function WorldMap() {
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Build user tree from centralized data
  const platformUsers = useMemo(() => buildUserTree(), [])

  const totalUsers = useMemo(() => countAllNodes(platformUsers), [platformUsers])
  const levelCounts = useMemo(() => countNodesByLevel(platformUsers), [platformUsers])

  // Calculate dynamic canvas size based on tree structure
  const canvasSize = useMemo(() => calculateCanvasSize(platformUsers), [platformUsers])
  const centerX = canvasSize / 2
  const centerY = canvasSize / 2

  // Scale factor (kept for compatibility)
  const scaleFactor = useMemo(() => Math.sqrt(totalUsers / 30), [totalUsers])

  const { nodes, edges } = useMemo(
    () => generateRadialTree(platformUsers, centerX, centerY, scaleFactor),
    [platformUsers, scaleFactor, centerX, centerY]
  )

  // Handle trackpad gestures: pinch-to-zoom and two-finger scroll
  const handleWheelEvent = useCallback((e: WheelEvent) => {
    e.preventDefault()

    // Pinch-to-zoom: ctrlKey is true when using trackpad pinch gesture
    if (e.ctrlKey || e.metaKey) {
      // Zoom - pinch gesture
      const zoomSensitivity = 0.01
      setZoom(z => {
        const newZoom = z * (1 - e.deltaY * zoomSensitivity)
        return Math.max(0.2, Math.min(8, newZoom))
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
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleNodeClick = (node: VisualNode) => {
    const userData = findUserById(platformUsers, node.id)
    setSelectedNode({
      ...node,
      email: userData?.email,
      childCount: userData?.children.length || 0,
    })
  }

  const viewBoxSize = canvasSize / zoom
  const viewBoxOffset = centerX - viewBoxSize / 2
  const panScaled = { x: (pan.x / zoom) * -1, y: (pan.y / zoom) * -1 }

  const levelNames: Record<number, string> = {
    0: 'Plataforma',
    1: 'Nivel 1',
    2: 'Nivel 2',
    3: 'Nivel 3',
    4: 'Nivel 4',
    5: 'Nivel 5',
    6: 'Nivel 6+',
  }

  return (
    <div className="flex h-[700px] rounded-lg overflow-hidden border border-border bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white">
      {/* Main visualization */}
      <div ref={containerRef} className="flex-1 relative">
        {/* Controls */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg font-medium shadow-lg transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => setZoom(z => Math.min(z * 1.5, 8))}
            className="px-4 py-2 bg-slate-700/80 hover:bg-slate-600 rounded-lg transition-colors"
          >
            +
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z / 1.5, 0.2))}
            className="px-4 py-2 bg-slate-700/80 hover:bg-slate-600 rounded-lg transition-colors"
          >
            −
          </button>
        </div>

        {/* Title */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-center">
          <h2 className="text-xl font-bold">Mundo PAKOA</h2>
          <p className="text-sm text-white/50">
            {totalUsers} usuarios • Pinch para zoom, scroll para navegar
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
            <filter id="worldGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="globeGradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </radialGradient>
          </defs>

          {/* Background */}
          <rect x="0" y="0" width={canvasSize} height={canvasSize} fill="#0f172a" />

          {/* Draw edges */}
          {edges.map((edge, i) => (
            <line
              key={i}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              stroke="rgba(99, 102, 241, 0.4)"
              strokeWidth={2}
            />
          ))}

          {/* Draw nodes from highest level to lowest (so center is on top) */}
          {[...nodes].reverse().map((node) => {
            const isCenter = node.level === 0
            const isSelected = selectedNode?.id === node.id
            const color = isCenter ? '#6366f1' : getNodeColor(node.revenue30Days)

            return (
              <g
                key={node.id}
                onClick={() => handleNodeClick(node)}
                className="cursor-pointer"
              >
                {/* Outer circle (background) */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size}
                  fill={isCenter ? 'url(#globeGradient)' : '#1e293b'}
                  stroke={isSelected ? '#fff' : 'rgba(255,255,255,0.2)'}
                  strokeWidth={isSelected ? 3 : 1}
                  filter={isCenter || isSelected ? 'url(#worldGlow)' : ''}
                  className="transition-all duration-150 hover:brightness-110"
                />

                {/* Inner colored ring */}
                {!isCenter && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size * 0.75}
                    fill="none"
                    stroke={color}
                    strokeWidth={node.size * 0.15}
                    opacity={0.8}
                  />
                )}

                {/* Initials or icon */}
                {node.size >= 12 && (
                  <text
                    x={node.x}
                    y={node.y + node.size * 0.12}
                    textAnchor="middle"
                    fill="white"
                    fontSize={node.size * 0.45}
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {isCenter ? '🌐' : getInitials(node.name)}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Stats */}
        <div className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur rounded-lg px-4 py-2 text-sm flex gap-4">
          <div>
            <span className="text-white/50">Usuarios: </span>
            <span className="font-bold">{totalUsers}</span>
          </div>
          <div>
            <span className="text-white/50">Niveles: </span>
            <span className="font-bold">{Object.keys(levelCounts).length}</span>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-64 bg-slate-800/30 p-4 space-y-4 border-l border-white/10">
        {/* Legend */}
        <div className="bg-slate-700/30 rounded-xl p-4">
          <h3 className="font-bold mb-3">Ventas 30 Días</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Mayor a $17,000</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span>$15,000 - $17,000</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-gray-500"></div>
              <span>$12,000 - $15,000</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>Menor a $12,000</span>
            </div>
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-slate-700/30 rounded-xl p-4">
          <h3 className="font-bold mb-3">Distribución</h3>
          <div className="space-y-2 text-sm">
            {Object.entries(levelCounts)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([level, count]) => (
                <div key={level} className="flex justify-between">
                  <span className="text-white/70">
                    {levelNames[Number(level)] || `Nivel ${level}`}:
                  </span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Selected node details */}
        {selectedNode && (
          <div className="bg-indigo-600/20 rounded-xl p-4 border border-indigo-500/30">
            <h3 className="font-bold mb-2">{selectedNode.name}</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-white/70">Nivel:</span>
                <span>{levelNames[selectedNode.level] || `Nivel ${selectedNode.level}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Ventas 30d:</span>
                <span
                  className="font-bold"
                  style={{ color: selectedNode.level === 0 ? '#6366f1' : getNodeColor(selectedNode.revenue30Days) }}
                >
                  ${selectedNode.revenue30Days.toLocaleString()}
                </span>
              </div>
              {selectedNode.email && selectedNode.level > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/70">Email:</span>
                  <span className="text-xs truncate max-w-[120px]">{selectedNode.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/70">Referidos:</span>
                <span className="font-bold">{selectedNode.childCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
