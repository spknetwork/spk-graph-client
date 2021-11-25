import CeramicClient from '@ceramicnetwork/http-client'
import { SpkClient } from '../../src/spk-client'
import { differenceInMilliseconds } from 'date-fns'
import { DocSortOption, DocumentView } from '../../src'

const INDEXER_API_HOST = 'http://localhost:4567'

jest.setTimeout(20000)

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

/**
 * Tests to ensure that within a doc array, the doc with firstId occurs first, and the one with secondId occurs second.
 */
function sortIsValid(docs: DocumentView[], firstId: string, secondId: string): boolean {
  let firstIndex
  let secondIndex

  for (let i = 0; i < docs.length; i++) {
    if (docs[i].streamId === firstId) {
      firstIndex = i
    } else if (docs[i].streamId === secondId) {
      secondIndex = i
    }
  }

  if (firstIndex == null || secondIndex == null) {
    throw new Error(
      `Could not determine sort order, one or both stream IDs are not present in doc array`,
    )
  }

  return secondIndex > firstIndex
}

describe('spk client should operate', () => {
  let spkClient: SpkClient
  beforeAll(async () => {
    const ceramic = global.ceramic as CeramicClient
    if (!global.ceramic) {
      throw new Error('ceramic session not available in the global namespace')
    }
    spkClient = new SpkClient(INDEXER_API_HOST, ceramic)
  })

  it('should index and return document', async () => {
    const docContent = { key: 'value' }
    const doc2Content = { key: 'value' }

    const created = await spkClient.createDocument(docContent)
    const created2 = await spkClient.createDocument(doc2Content)
    await sleep(300)
    try {
      const fetched = await spkClient.fetchDocument(created.streamId)

      expect(created.content).toEqual(fetched.content)
      expect(created.createdAt).toEqual(fetched.createdAt)
    } catch (err) {
      console.error(`error fetching doc ${err}`)
    }
  })

  it('should get user docs from spk client', async () => {
    const docContent = { key: 'value' }
    const doc2Content = { key: 'value2' }

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

  it('should get child docs from spk and sort by created and updated correctly', async () => {
    const parentContent = { key: 'value' }
    const child1Content = { key: 'value2' }
    const child2Content = { key: 'value3' }

    const parent = await spkClient.createDocument(parentContent)
    const firstChild = await spkClient.createDocument(child1Content, parent.streamId)
    const secondChild = await spkClient.createDocument(child2Content, parent.streamId)
    await sleep(300)

    const childDocs = await spkClient.getDocumentChildren(parent.streamId)
    const returnedStreamIds = childDocs.map((doc) => doc.streamId)
    expect(returnedStreamIds.includes(firstChild.streamId)).toBeTruthy()
    expect(returnedStreamIds.includes(secondChild.streamId)).toBeTruthy()

    // sort by created date
    const createdAsc = await spkClient.getDocumentChildren(
      parent.streamId,
      DocSortOption.createdasc,
    )

    expect(sortIsValid(createdAsc, firstChild.streamId, secondChild.streamId)).toBeTruthy()

    const createdDesc = await spkClient.getDocumentChildren(
      parent.streamId,
      DocSortOption.createddesc,
    )

    expect(sortIsValid(createdDesc, secondChild.streamId, firstChild.streamId)).toBeTruthy()

    // sort by updated date
    const updatedAsc = await spkClient.getDocumentChildren(
      parent.streamId,
      DocSortOption.updatedasc,
    )

    expect(sortIsValid(updatedAsc, firstChild.streamId, secondChild.streamId)).toBeTruthy()

    const updatedDesc = await spkClient.getDocumentChildren(
      parent.streamId,
      DocSortOption.updateddesc,
    )

    expect(sortIsValid(updatedDesc, secondChild.streamId, firstChild.streamId)).toBeTruthy()
  })

  it('should get user docs from spk client and verify sort', async () => {
    const docContent = { key: 'value' }
    const doc2Content = { key: 'value2' }

    const firstDoc = await spkClient.createDocument(docContent)
    const secondDoc = await spkClient.createDocument(doc2Content)
    await sleep(300)

    const userdocs = await spkClient.getDocumentsForUser(spkClient.loggedInDid)

    const returnedStreamIds = userdocs.map((doc) => doc.streamId)
    expect(returnedStreamIds.includes(firstDoc.streamId)).toBeTruthy()
    expect(returnedStreamIds.includes(secondDoc.streamId)).toBeTruthy()

    // sort by created date
    const createdAsc = await spkClient.getDocumentsForUser(
      spkClient.loggedInDid,
      DocSortOption.createdasc,
    )

    expect(sortIsValid(createdAsc, firstDoc.streamId, secondDoc.streamId)).toBeTruthy()

    const createdDesc = await spkClient.getDocumentsForUser(
      spkClient.loggedInDid,
      DocSortOption.createddesc,
    )

    expect(sortIsValid(createdDesc, secondDoc.streamId, firstDoc.streamId)).toBeTruthy()

    // sort by updated date
    const updatedAsc = await spkClient.getDocumentsForUser(
      spkClient.loggedInDid,
      DocSortOption.updatedasc,
    )

    expect(sortIsValid(updatedAsc, firstDoc.streamId, secondDoc.streamId)).toBeTruthy()

    const updatedDesc = await spkClient.getDocumentsForUser(
      spkClient.loggedInDid,
      DocSortOption.updateddesc,
    )

    expect(sortIsValid(updatedDesc, secondDoc.streamId, firstDoc.streamId)).toBeTruthy()
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
    expect(fetchedOne.createdAt).toEqual(fetchedTwo.createdAt)
    expect(fetchedOne.updatedAt).toBeDefined()
    expect(fetchedTwo.updatedAt).toBeDefined()
    expect(
      differenceInMilliseconds(new Date(fetchedTwo.updatedAt), new Date(fetchedOne.updatedAt)),
    ).toBeGreaterThan(0)
  })

  it('should throw error if no doc', async () => {
    await expect(async () => {
      await spkClient.updateDocument('nonexistentstreamid', {})
    }).rejects.toThrow(Error)
  })
})
