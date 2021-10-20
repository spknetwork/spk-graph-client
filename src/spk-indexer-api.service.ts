import { DocumentView } from "./spk-client.types"
import axios, { AxiosRequestConfig } from "axios"

export class SpkIndexerApi {
  constructor(private readonly apiHost: string) {}

  get apiBaseUrl(): string {
    return `${this.apiHost}/api/v0`
  }

  public async requestDocumentReindex(streamId: string): Promise<void> {
    try {
      await axios.put<DocumentView>(
        `${this.apiBaseUrl}/indexer/index/${streamId}`
      )
    } catch (err: any) {
      console.log(err)
      throw new Error(
        `Problem reindexing document with streamId ${streamId}: ${err.message}`
      )
    }
  }

  public async requestDocumentFirstIndex(streamId: string): Promise<void> {
    try {
      await axios.post<DocumentView>(
        `${this.apiBaseUrl}/indexer/index/${streamId}`
      )
    } catch (err: any) {
      console.log(err)
      throw new Error(
        `Problem reindexing document with streamId ${streamId}: ${err.message}`
      )
    }
  }

  public async getDocument(streamId: string): Promise<DocumentView> {
    try {
      const res = await axios.get<DocumentView>(
        `${this.apiBaseUrl}/indexer/${streamId}`
      )
      return res.data
    } catch (err: any) {
      console.log(err)
      throw new Error(
        `Problem getting document with streamId ${streamId}, ${err.message}`
      )
    }
  }

  public async getDocsForUser(
    userId: string,
    page?: number,
    pageSize?: number
  ): Promise<DocumentView[]> {
    const config: AxiosRequestConfig = {
      params: {
        page,
        pageSize,
      },
    }

    try {
      const res = await axios.get<DocumentView[]>(
        `${this.apiBaseUrl}/foruser/userdocuments/${userId}`,
        config
      )
      return res.data
    } catch (err) {
      throw new Error(`Problem getting document with streamId ${userId}`)
    }
  }

  public async getDocChildren(
    parentStreamId: string,
    page?: number,
    pageSize?: number
  ): Promise<DocumentView[]> {
    const config: AxiosRequestConfig = {
      params: {
        page,
        pageSize,
      },
    }
    try {
      const res = await axios.get<DocumentView[]>(
        `${this.apiHost}/children/${parentStreamId}`,
        config
      )
      return res.data
    } catch (err) {
      throw new Error(
        `Problem getting document with streamId ${parentStreamId}`
      )
    }
  }
}
