import { CeramicClient } from "@ceramicnetwork/http-client"
import { randomBytes } from "@stablelib/random"
import { Ed25519Provider } from "key-did-provider-ed25519"
import KeyDidResolver from "key-did-resolver"
import { DID } from "dids"
import { SpkClient } from "../spk-client"

const CERAMIC_HOST = "http://localhost:7007"
const INDEXER_API_HOST = "http://localhost:4567"

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

describe("spk client should operate", () => {
  let spkClient: SpkClient
  beforeAll(async () => {
    const ceramic = await getTestCeramicClient(CERAMIC_HOST)
    spkClient = new SpkClient(INDEXER_API_HOST, ceramic)
  })

  it("should index and return document", async () => {
    const docContent = { key: "value" }

    const created = await spkClient.createDocument(docContent)
    await sleep(100)
    const fetched = await spkClient.fetchDocument(created.streamId)
    expect(created.content).toEqual(fetched.content)
  })

  it("should update document to new value", async () => {
    const docContent = { key: "value1" }

    const created = await spkClient.createDocument(docContent)
    await sleep(100)
    const fetchedOne = await spkClient.fetchDocument(created.streamId)
    expect(created.content).toEqual(fetchedOne.content)

    const newContent = { key: "value2" }

    await spkClient.updateDocument(created.streamId, newContent)
    await sleep(100)
    const fetchedTwo = await spkClient.fetchDocument(created.streamId)

    expect(fetchedTwo.content).toEqual(newContent)
  })
})

async function getTestCeramicClient(host: string): Promise<CeramicClient> {
  const ceramic = new CeramicClient(host)
  const resolver = { ...KeyDidResolver.getResolver() }
  const did = new DID({ resolver })
  ceramic.did = did
  const seed = randomBytes(32)
  const provider = new Ed25519Provider(seed)
  ceramic.did.setProvider(provider)
  await ceramic.did.authenticate()
  return ceramic
}
