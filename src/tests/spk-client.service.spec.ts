import { create } from 'domain'
import { SpkClient } from '../spk-client'
import { getTestCeramicClient } from '../util/get-test-ceramic-client.function'
import { Timer } from '../util/timer.service'

const CERAMIC_HOST = 'http://localhost:7007'
// const CERAMIC_HOST = 'https://ceramic-clay.3boxlabs.com'
const INDEXER_API_HOST = 'http://localhost:4567'

jest.setTimeout(20000)

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

describe('spk client should operate', () => {
  let spkClient: SpkClient
  beforeAll(async () => {
    const ceramic = await getTestCeramicClient(CERAMIC_HOST)
    spkClient = new SpkClient(INDEXER_API_HOST, ceramic)
  })

  it('should index and return document', async () => {
    const docContent = { key: 'value' }
    const doc2Content = { key: 'value' }

    const timer = new Timer()
    const created = await spkClient.createDocument(docContent)
    const created2 = await spkClient.createDocument(doc2Content)
    await sleep(300)
    try {
      const fetched = await spkClient.fetchDocument(created.streamId)

      expect(created.content).toEqual(fetched.content)
    } catch (err) {
      console.error(`error fetching doc ${err}`)
    }
  })

  it('should get user docs from spk client', async () => {
    const docContent = { key: 'value' }
    const doc2Content = { key: 'value2' }

    const timer = new Timer()
    const created = await spkClient.createDocument(docContent)
    const created2 = await spkClient.createDocument(doc2Content)
    await sleep(300)

    const userdocs = await spkClient.getDocumentsForUser(spkClient.loggedInDid)

    const returnedStreamIds = userdocs.map((doc) => doc.streamId)
    expect(returnedStreamIds.includes(created.streamId)).toBeTruthy()
    expect(returnedStreamIds.includes(created2.streamId)).toBeTruthy()
  })

  it('should get child docs from spk client', async () => {
    const parentContent = { key: 'value' }
    const child1Content = { key: 'value2' }
    const child2Content = { key: 'value3' }

    const parent = await spkClient.createDocument(parentContent)
    const child1 = await spkClient.createDocument(child1Content, parent.streamId)
    const child2 = await spkClient.createDocument(child2Content, parent.streamId)
    await sleep(300)

    const childDocs = await spkClient.getDocumentChildren(parent.streamId)
    const returnedStreamIds = childDocs.map((doc) => doc.streamId)
    expect(returnedStreamIds.includes(child1.streamId)).toBeTruthy()
    expect(returnedStreamIds.includes(child2.streamId)).toBeTruthy()
  })

  it('should update document to new value', async () => {
    const docContent = { key: 'value1' }

    const created = await spkClient.createDocument(docContent)
    await sleep(100)
    const fetchedOne = await spkClient.fetchDocument(created.streamId)
    expect(created.content).toEqual(fetchedOne.content)

    const newContent = { key: 'value2' }

    await spkClient.updateDocument(created.streamId, newContent)
    await sleep(100)
    const fetchedTwo = await spkClient.fetchDocument(created.streamId)

    expect(fetchedTwo.content).toEqual(newContent)
  })
})
