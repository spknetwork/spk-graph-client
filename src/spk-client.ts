import { CeramicClient } from '@ceramicnetwork/http-client'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { IDX } from '@ceramicstudio/idx'
import { ConfigService } from './config.service'
import { CeramicDocContent, DocumentView } from './spk-client.model'
import { SpkIndexerApi } from './spk-indexer-api.service'
import base64url from 'base64url'
import { randomBytes } from '@stablelib/random'
import { IDX_ROOT_DOCS_KEY } from './common/constants'
import { DocSortOption } from '.'
import { SocialConnections } from './social-connections'

export class SpkClient {
  /**
   * @param ceramicHost The URL of the ceramic host
   * @param spkIndexerHost The URL of the SPK indexer host
   */

  readonly apiClient: SpkIndexerApi
  readonly idx: IDX
  social: SocialConnections
  constructor(private readonly spkIndexerHost: string, private readonly ceramic: CeramicClient) {
    this.apiClient = new SpkIndexerApi(spkIndexerHost)
    this.idx = new IDX({
      autopin: true,
      ceramic: ceramic,
      aliases: ConfigService.getConfig().idxAliases,
    })
    this.social = new SocialConnections(this)
  }

  public async updateDocument(streamId: string, content: unknown): Promise<void> {
    let doc: TileDocument<CeramicDocContent>
    try {
      doc = await TileDocument.load<CeramicDocContent>(this.ceramic, streamId)
    } catch (err: any) {
      console.error(`Could not load doc id '${streamId}' for update: `, err.message)
      throw err
    }

    await doc.update(
      { ...(doc.content as any), updated_at: new Date().toISOString(), content: content },
      undefined,
      { anchor: true },
    )

    await this.apiClient.requestDocumentReindex(streamId)
  }

  public async fetchDocument(documentId: string): Promise<DocumentView> {
    return await this.apiClient.getDocument(documentId)
  }

  public async getDocumentsForUser(
    userId: string,
    sort: DocSortOption = DocSortOption.createddesc,
    page = 1,
    pageSize = 25,
  ): Promise<DocumentView[]> {
    try {
      return await this.apiClient.getDocsForUser(userId, sort, page, pageSize)
    } catch (err) {
      console.error(`Error getting docs for user!`, err)
      throw err
    }
  }

  public async getDocumentChildren(
    parentDocId: string,
    sort: DocSortOption = DocSortOption.createddesc,
    page = 1,
    pageSize = 25,
  ): Promise<DocumentView[]> {
    return await this.apiClient.getDocChildren(parentDocId, sort, page, pageSize)
  }

  public async requestDocInitialIndex(streamId: string): Promise<void> {
    try {
      await this.apiClient.requestDocumentFirstIndex(streamId)
    } catch (err: any) {
      console.error(`Error requesting document reindex on spk indexer daemon! ${err.message}`)
      throw err
    }
  }

  public async getFeedDocs(options?: { page?: number; pageSize?: number }) {
    return await this.apiClient.getFeedDocs(options?.page, options?.pageSize)
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

    const now = new Date()

    const doc = await TileDocument.create<CeramicDocContent>(
      this.ceramic,
      {
        parent_id: parentId,
        content,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      },
      { tags: ['spk_network'], controllers: [creatorId] },
      { anchor: true, publish: false },
    )

    // TODO: restrict this to parent docs only once corresponding backend features are ready
    try {
      await this.recordDocToRootPosts(doc.id.toString(), creatorId)
    } catch (err: any) {
      console.error(`Error recording doc to root posts!`, err.message)
      throw err
    }

    await this.requestDocInitialIndex(doc.id.toString())

    return {
      creatorId: creatorId,
      streamId: doc.id.toString(),
      parentId: doc.content.parent_id,
      content: doc.content.content,
      createdAt: doc.content.created_at,
      updatedAt: doc.content.updated_at,
    }
  }

  public async recordDocToRootPosts(streamIdUrl: string, userDid: string): Promise<void> {
    const permlink = base64url.encode(randomBytes(6).buffer as Buffer)

    let rootDocs = (await this.idx.get(IDX_ROOT_DOCS_KEY, userDid)) as Record<string, string>
    if (rootDocs) {
      rootDocs[permlink] = streamIdUrl
    } else {
      rootDocs = {
        [permlink]: streamIdUrl,
      }
    }

    await this.idx.set(IDX_ROOT_DOCS_KEY, rootDocs)
  }
}
