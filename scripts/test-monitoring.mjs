import assert from 'node:assert/strict'
import test from 'node:test'
import { build } from 'esbuild'

await build({
  entryPoints: ['src/lib/server/monitoring.ts'],
  outfile: 'scratch/monitoring.mjs',
  bundle: true,
  format: 'esm',
  platform: 'node',
  logLevel: 'silent',
})

const { monitoring } = await import('../scratch/monitoring.mjs')

test('monitoring abstraction dispatches across all six domains and supports custom backends', async () => {
  const events = []
  const testBackend = {
    name: 'test-collector',
    isConfigured: () => true,
    captureEvent: (p) => {
      events.push(p)
    },
    captureException: () => {},
  }

  monitoring.registerBackend(testBackend)

  // 1. API Failure
  const apiErrId = monitoring.notifyApiFailure('GET /api/test', new Error('Database connection failed'), { userId: 'usr_123' })
  assert.match(apiErrId, /^E-[A-F0-9]{8}$/)

  // 2. Ingestion Failure
  const ingErrId = monitoring.notifyIngestionFailure('catalog-stripe', new Error('HTTP 502 Bad Gateway from Greenhouse'), { attempt: 3 })
  assert.match(ingErrId, /^E-[A-F0-9]{8}$/)

  // 3. Billing Webhook Failure
  monitoring.notifyBillingWebhookFailure('razorpay', 'invalid_signature', { eventId: 'evt_test' })

  // 4. AI Provider Failure
  const aiErrId = monitoring.notifyAiFailure('groq', 'interview.feedback', new Error('Rate limit 429'), { model: 'llama-3.3-70b' })
  assert.match(aiErrId, /^E-[A-F0-9]{8}$/)

  // 5. Resume Processing Failure
  const resErrId = monitoring.notifyResumeProcessingFailure('corrupt_pdf_structure', new Error('Invalid xref table'), { resumeId: 'res_456' })
  assert.match(resErrId, /^E-[A-F0-9]{8}$/)

  // 6. Security Event
  monitoring.notifySecurityEvent('auth.lockout', 'warn', { ip: '192.168.1.1', email: 'test@example.com' })

  // Assert events collected by our backend
  assert.equal(events.length, 6)
  assert.equal(events[0].category, 'api')
  assert.equal(events[0].errorId, apiErrId)
  assert.equal(events[1].category, 'ingestion')
  assert.equal(events[2].category, 'billing')
  assert.equal(events[3].category, 'ai')
  assert.equal(events[4].category, 'resume')
  assert.equal(events[5].category, 'security')

  // Status check
  const status = monitoring.externalMonitoringStatus()
  assert.equal(status.provider, 'NOT CONFIGURED')
  assert.ok(status.activeBackends.includes('structured-logger'))
  assert.ok(status.activeBackends.includes('test-collector'))
})
