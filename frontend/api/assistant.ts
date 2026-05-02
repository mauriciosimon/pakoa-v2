// Vercel serverless function: proxies assistant requests to MiniMax M2
// (Anthropic-compatible endpoint). Keeps the API key server-side.

interface ProxyRequestBody {
  systemPrompt: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  maxTokens?: number
}

const MINIMAX_URL = 'https://api.minimax.io/anthropic/v1/messages'
const DEFAULT_MODEL = 'MiniMax-M2'
const DEFAULT_MAX_TOKENS = 1000

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = process.env.MINIMAX_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'MINIMAX_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: ProxyRequestBody
  try {
    body = (await req.json()) as ProxyRequestBody
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!body.systemPrompt || !Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: 'systemPrompt and messages required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const upstream = await fetch(MINIMAX_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: body.maxTokens ?? DEFAULT_MAX_TOKENS,
        system: body.systemPrompt,
        messages: body.messages,
      }),
    })

    const data = await upstream.json()

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: 'Upstream error', status: upstream.status, detail: data }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const textBlock = Array.isArray(data?.content)
      ? data.content.find((block: { type: string; text?: string }) => block.type === 'text')
      : null

    return new Response(
      JSON.stringify({ text: textBlock?.text ?? '' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Proxy fetch failed', detail: String(err) }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export const config = { runtime: 'edge' }
