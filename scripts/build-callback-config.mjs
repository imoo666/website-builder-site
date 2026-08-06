import { readFile } from 'node:fs/promises'

const CONFIG_URL = new URL('../config/build-callback.json', import.meta.url)

export async function loadBuildCallbackConfig(environment = process.env) {
  if (environment.BUILD_CALLBACK_DISABLED === '1') {
    return { url: null, secret: null }
  }

  const stored = JSON.parse(await readFile(CONFIG_URL, 'utf8'))
  const url = normalize(environment.BUILD_CALLBACK_URL) || normalize(stored.url)
  const secret = normalize(environment.BUILD_CALLBACK_SECRET) || normalize(stored.secret)
  if (!url && !secret) return { url: null, secret: null }
  if (!url || !secret) throw new Error('Build callback URL and secret must be configured together')

  const parsedUrl = new URL(url)
  if (parsedUrl.protocol !== 'https:') throw new Error('Build callback URL must use HTTPS')
  if (secret.length < 32) throw new Error('Build callback secret must be at least 32 characters')
  return { url: parsedUrl.toString(), secret }
}

function normalize(value) {
  return typeof value === 'string' ? value.trim() : ''
}
