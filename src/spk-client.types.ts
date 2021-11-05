export interface CreateDocument {
  /**
   * The content of the document
   */
  content: unknown
  /**
   *The parent ID of the document (optional)
   */
  parentId?: string
}

export interface UpdateDocument {
  /**
   * Updated content of the document
   */
  content: unknown
  /**
   * the ceramic streamId of the document to update
   */
  streamId: string
}

export interface DocumentView {
  streamId: string
  parentId?: string
  content: unknown
  creatorId: string
  createdAt: Date
}

export interface CeramicDocContent {
  parent_id?: string
  created_at: Date
  content: unknown
}
