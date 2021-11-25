import { DocumentView } from './spk-client.model'
import axios, { AxiosRequestConfig } from 'axios'
import { DocSortOption } from '.'

export class SpkIndexerApi {
  constructor(private readonly apiHost: string) {}

  get apiBaseUrl(): string {
    return `${this.apiHost}/api/v0`
  }

  public async requestDocumentReindex(streamId: string): Promise<void> {
    try {
      await axios.put<DocumentView>(`${this.apiBaseUrl}/indexer/index/${streamId}`)
    } catch (err: any) {
      console.error(err)
      throw new Error(`Problem reindexing document with streamId ${streamId}: ${err.message}`)
    }
  }

  public async requestDocumentFirstIndex(streamId: string): Promise<void> {
    try {
      await axios.post<DocumentView>(`${this.apiBaseUrl}/indexer/index/${streamId}`)
    } catch (err: any) {
      console.error(err)
      throw new Error(`Problem reindexing document with streamId ${streamId}: ${err.message}`)
    }
  }

  public async getDocument(streamId: string): Promise<DocumentView> {
    try {
      const res = await axios.get<DocumentView>(`${this.apiBaseUrl}/indexer/documents/${streamId}`)
      return res.data
    } catch (err: any) {
      console.error(err)
      throw new Error(`Problem getting document with streamId ${streamId}, ${err.message}`)
    }
  }

  public async getDocsForUser(
    userId: string,
    sort: DocSortOption,
    page: number,
    pageSize: number,
  ): Promise<DocumentView[]> {
    const config: AxiosRequestConfig = {
      params: {
        page,
        pageSize,
        userId,
        sort,
      },
    }

    try {
      const res = await axios.get<DocumentView[]>(
        `${this.apiBaseUrl}/indexer/foruser/userdocuments`,
        config,
      )
      return res.data
    } catch (err: any) {
      throw new Error(`Problem getting user docs for user ID ${userId}, ${err.message}`)
    }
  }

  public async getDocChildren(
    parentId: string,
    sort: DocSortOption,
    page: number,
    pageSize: number,
  ): Promise<DocumentView[]> {
    const config: AxiosRequestConfig = {
      params: {
        page,
        pageSize,
        parentId,
        sort,
      },
    }
    try {
      const res = await axios.get<DocumentView[]>(`${this.apiBaseUrl}/indexer/children`, config)
      return res.data
    } catch (err: any) {
      throw new Error(`Problem getting doc children with parent id ${parentId}: ${err.message}`)
    }
  }

  public async getFeedDocs(page?: number, pageSize?: number) {
    const config: AxiosRequestConfig = {
      params: {
        page,
        pageSize,
      },
    }
    try {
      const res = await axios.get<DocumentView[]>(`${this.apiBaseUrl}/indexer/feed`, config)
      return res.data
    } catch (err: any) {
      throw new Error(`Problem fetching document feed: ${err.message}`)
    }
  }
}
