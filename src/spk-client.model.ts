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
  createdAt: string
  updatedAt: string
}

export interface CeramicDocContent {
  parent_id?: string
  created_at: string
  updated_at: string
  content: unknown
}

export enum DocSortOption {
  createdasc = 'createdasc',
  createddesc = 'createddesc',
  updatedasc = 'updatedasc',
  updateddesc = 'updateddesc',
}

export interface SocialConnection {
  connection_type?: string
  target: string
  target_type: string
  namespace?: string
  created_at?: Date
  alias?: string
}