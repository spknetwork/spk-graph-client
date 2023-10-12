import { CeramicClient } from '@ceramicnetwork/http-client'
import { randomBytes } from '@stablelib/random'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import * as KeyResolver from 'key-did-resolver'
import { DID } from 'dids'

export async function getTestCeramicClient(host: string): Promise<CeramicClient> {
  const ceramic = new CeramicClient(host)
  const did = new DID({ resolver: KeyResolver.getResolver() as any })
  ceramic.did = did
  const seed = randomBytes(32)
  const provider = new Ed25519Provider(seed)
  ceramic.did.setProvider(provider)
  await ceramic.did.authenticate()
  return ceramic
}
