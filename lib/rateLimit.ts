import { createHash } from 'crypto'

// 인메모리 Rate Limit 저장소 (단일 서버 환경용)
// 프로덕션 트래픽 증가 시 Redis로 교체
const store = new Map<string, { count: number; resetAt: number }>()

const LIMITS = {
  perMinute: 3,
  perHour: 10,
}

export function hashIp(ip: string): string {
  return createHash('sha256').update(ip + (process.env.IP_HASH_SALT ?? 'solomap')).digest('hex').slice(0, 32)
}

export function checkRateLimit(ipHash: string): { allowed: boolean; reason: string } {
  const now = Date.now()
  const minuteKey = `${ipHash}:min:${Math.floor(now / 60000)}`
  const hourKey = `${ipHash}:hr:${Math.floor(now / 3600000)}`

  const min = store.get(minuteKey) ?? { count: 0, resetAt: now + 60000 }
  const hr = store.get(hourKey) ?? { count: 0, resetAt: now + 3600000 }

  if (min.count >= LIMITS.perMinute) return { allowed: false, reason: 'rate_limited' }
  if (hr.count >= LIMITS.perHour) return { allowed: false, reason: 'rate_limited' }

  store.set(minuteKey, { count: min.count + 1, resetAt: min.resetAt })
  store.set(hourKey, { count: hr.count + 1, resetAt: hr.resetAt })

  // 만료된 키 정리 (메모리 누수 방지)
  if (store.size > 10000) {
    for (const [k, v] of store) {
      if (v.resetAt < now) store.delete(k)
    }
  }

  return { allowed: true, reason: 'allowed' }
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    '0.0.0.0'
  )
}
