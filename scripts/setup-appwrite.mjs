/**
 * One-time Appwrite bootstrap for Jobappy.
 * Needs APPWRITE_API_KEY in .env (never commit this key).
 *
 * Create the key in Console → Overview → API keys
 * Scopes: databases.read, databases.write
 */
import { config } from 'dotenv'
import { Client, Databases, Permission, Role } from 'node-appwrite'

config()

const endpoint = process.env.VITE_APPWRITE_ENDPOINT
const projectId = process.env.VITE_APPWRITE_PROJECT_ID
const apiKey = process.env.APPWRITE_API_KEY
const databaseId = process.env.VITE_APPWRITE_DATABASE_ID || 'jobappy'
const collectionId = process.env.VITE_APPWRITE_COLLECTION_ID || 'app_state'

function fail(message) {
  console.error(`\n✗ ${message}\n`)
  process.exit(1)
}

async function main() {
  if (!endpoint || !projectId) fail('Missing VITE_APPWRITE_ENDPOINT or VITE_APPWRITE_PROJECT_ID in .env')
  if (!apiKey) {
    fail(
      [
        'Missing APPWRITE_API_KEY in .env',
        '',
        'Create it here:',
        `  https://cloud.appwrite.io/console/project-${projectId}/overview/keys`,
        '',
        'Scopes needed: databases.read, databases.write',
        'Then add to .env:',
        '  APPWRITE_API_KEY=your_key_here',
      ].join('\n'),
    )
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
  const databases = new Databases(client)

  console.log('→ Endpoint:', endpoint)
  console.log('→ Project:', projectId)
  console.log('→ Database:', databaseId)
  console.log('→ Collection:', collectionId)
  console.log('')

  try {
    await databases.get(databaseId)
    console.log('✓ Database already exists')
  } catch {
    await databases.create(databaseId, 'Jobappy')
    console.log('✓ Created database')
  }

  try {
    await databases.getCollection(databaseId, collectionId)
    console.log('✓ Collection already exists')
  } catch {
    await databases.createCollection(
      databaseId,
      collectionId,
      'App state',
      [
        Permission.create(Role.users()),
        Permission.read(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      true,
      true,
    )
    console.log('✓ Created collection')
  }

  await databases.updateCollection(
    databaseId,
    collectionId,
    'App state',
    [
      Permission.create(Role.users()),
      Permission.read(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ],
    true,
    true,
  )
  console.log('✓ Collection permissions updated')

  try {
    await databases.getAttribute(databaseId, collectionId, 'data')
    console.log('✓ Attribute "data" already exists')
  } catch {
    await databases.createStringAttribute(databaseId, collectionId, 'data', 1_000_000, true)
    console.log('✓ Created attribute "data" (waiting for it to become available…)')

    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 1000))
      try {
        const attr = await databases.getAttribute(databaseId, collectionId, 'data')
        if (attr.status === 'available') {
          console.log('✓ Attribute "data" is available')
          break
        }
      } catch {
        // keep waiting
      }
      if (i === 29) console.log('⚠ Attribute still provisioning — check Console in a minute')
    }
  }

  console.log('\nDone. Still do these 2 clicks in Console (API cannot):')
  console.log('  1. Auth → Settings → enable Email/Password')
  console.log('  2. Overview → Platforms → Web:')
  console.log('       - localhost')
  console.log('       - townsfattakapp.github.io')
  console.log(`\nConsole: https://cloud.appwrite.io/console/project-${projectId}/overview\n`)
}

main().catch((err) => {
  console.error('\nSetup failed:', err?.message || err)
  process.exit(1)
})
