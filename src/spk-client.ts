import { CeramicClient } from '@ceramicnetwork/http-client'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { IDX } from '@ceramicstudio/idx'
import { NotFoundException, NotImplementedException } from './common/exceptions'
import { ConfigService } from './config.service'
import { CeramicDocContent, DocumentView } from './spk-client.types'
import { SpkIndexerApi } from './spk-indexer-api.service'
import base64url from 'base64url'
import Crypto from 'crypto'
import { Timer } from './util/timer.service'

export class SpkClient {
  /**
   * @param ceramicHost The URL of the ceramic host
   * @param spkIndexerHost The URL of the SPK indexer host
   */

  readonly apiClient: SpkIndexerApi
  readonly idx: IDX
  constructor(private readonly spkIndexerHost: string, private readonly ceramic: CeramicClient) {
    this.apiClient = new SpkIndexerApi(spkIndexerHost)
    this.idx = new IDX({
      autopin: true,
      ceramic: ceramic,
      aliases: ConfigService.getConfig().idxAliases,
    })
  }

  public async updateDocument(streamId: string, content: unknown): Promise<void> {
    const doc = await TileDocument.load<CeramicDocContent>(this.ceramic, streamId)

    if (!doc) {
      throw new NotFoundException(`Could not find ceramic doc with stream id ${streamId}!`)
    }

    await doc.update({ content }, undefined, { anchor: true })

    await this.apiClient.requestDocumentReindex(streamId)
  }

  public async fetchDocument(documentId: string): Promise<DocumentView> {
    return await this.apiClient.getDocument(documentId)
  }

  public async getDocumentsForUser(
    userId: string,
    page?: number,
    pageSize?: number,
  ): Promise<DocumentView[]> {
    try {
      return await this.apiClient.getDocsForUser(userId, page, pageSize)
    } catch (err) {
      console.error(`Error getting docs for user!`, err)
      throw err
    }
  }

  public async getDocumentChildren(
    parentDocId: string,
    page?: number,
    pageSize?: number,
  ): Promise<DocumentView[]> {
    return await this.apiClient.getDocChildren(parentDocId, page, pageSize)
  }

  public async requestDocInitialIndex(streamId: string): Promise<void> {
    try {
      await this.apiClient.requestDocumentFirstIndex(streamId)
    } catch (err: any) {
      console.error(`Error requesting document reindex on spk indexer daemon! ${err.message}`)
      throw err
    }
  }

  public async requestDocReindex(streamId: string): Promise<void> {
    try {
      await this.apiClient.requestDocumentReindex(streamId)
    } catch (err: any) {
      console.error(`Error requesting document reindex on spk indexer daemon! ${err.message}`)
      throw err
    }
  }

  get loggedInDid(): string {
    if (!this.ceramic.did?.id) throw new Error(`User not logged in, could not retrieve DID`)

    return this.ceramic.did?.id
  }

  public async createDocument(
    content: unknown,
    parentId: string | undefined = undefined,
  ): Promise<DocumentView> {
    const creatorId = this.ceramic.did?.id
    if (!creatorId) {
      throw new Error(`User not authenticated with ceramic`)
    }

    const timer = new Timer()
    timer.start()
    const doc = await TileDocument.create<CeramicDocContent>(
      this.ceramic,
      {
        parent_id: parentId,
        content,
      },
      { tags: ['spk_network'], controllers: [creatorId] },
      { anchor: true, publish: false },
    )
    timer.stop('Tile doc created')

    // Add to root posts on ceramic
    try {
      timer.start()
      await this.recordDocToRootPosts(doc.id.toUrl(), creatorId)
      timer.stop('Root post recorded')
    } catch (err: any) {
      console.error(`Error recording doc to root posts!`, err.message)
      throw err
    }

    timer.start()
    await this.requestDocInitialIndex(doc.id.toString())
    timer.stop('Doc initial index requested')

    return {
      creatorId: creatorId,
      streamId: doc.id.toString(),
      parentId: doc.content.parent_id,
      content: doc.content.content,
    }
  }

  public async recordDocToRootPosts(streamIdUrl: string, userDid: string): Promise<void> {
    const permlink = base64url.encode(Crypto.randomBytes(6))

    let rootPosts = (await this.idx.get('rootPosts', userDid)) as Record<string, string>
    if (rootPosts) {
      rootPosts[permlink] = streamIdUrl
    } else {
      rootPosts = {
        [permlink]: streamIdUrl,
      }
    }

    await this.idx.set('rootPosts', rootPosts)
  }
}
