import { CeramicClient } from "@ceramicnetwork/http-client"
import { TileDocument } from "@ceramicnetwork/stream-tile"
import { NotFoundException, NotImplementedException } from "./common/exceptions"
import { CeramicDocContent, DocumentView } from "./spk-client.types"
import { SpkIndexerApi } from "./spk-indexer-api.service"
export class SpkClient {
  /**
   * @param ceramicHost The URL of the ceramic host
   * @param spkIndexerHost The URL of the SPK indexer host
   */

  apiClient: SpkIndexerApi
  constructor(
    private readonly spkIndexerHost: string,
    private readonly ceramic: CeramicClient
  ) {
    this.apiClient = new SpkIndexerApi(spkIndexerHost)
  }

  public async updateDocument(
    streamId: string,
    content: unknown
  ): Promise<void> {
    const doc = await TileDocument.load<CeramicDocContent>(
      this.ceramic,
      streamId
    )

    if (!doc) {
      throw new NotFoundException(
        `Could not find ceramic doc with stream id ${streamId}!`
      )
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
    pageSize?: number
  ): Promise<DocumentView[]> {
    throw new NotImplementedException()
  }

  public async getDocumentChildren(
    parentDocId: string,
    page?: number,
    pageSize?: number
  ): Promise<DocumentView[]> {
    throw new NotImplementedException()
  }

  public async requestDocInitialIndex(streamId: string): Promise<void> {
    try {
      await this.apiClient.requestDocumentFirstIndex(streamId)
    } catch (err: any) {
      console.error(
        `Error requesting document reindex on spk indexer daemon! ${err.message}`
      )
      throw err
    }
  }

  public async requestDocReindex(streamId: string): Promise<void> {
    try {
      await this.apiClient.requestDocumentReindex(streamId)
    } catch (err: any) {
      console.error(
        `Error requesting document reindex on spk indexer daemon! ${err.message}`
      )
      throw err
    }
  }

  public async createDocument(
    content: unknown,
    parentId: string | undefined = undefined
  ): Promise<DocumentView> {
    const creatorId = this.ceramic.did?.id
    if (!creatorId) {
      throw new Error(`User not authenticated with ceramic`)
    }

    const doc = await TileDocument.create<CeramicDocContent>(
      this.ceramic,
      {
        parent_id: parentId,
        content,
      },
      { tags: ["spk_network"], controllers: [creatorId] },
      { anchor: true, publish: false }
    )

    await this.requestDocInitialIndex(doc.id.toString())

    return {
      creator_id: creatorId,
      streamId: doc.id.toString(),
      parent_id: doc.content.parent_id,
      content: doc.content.content,
    }
  }
}
