# SPK Graph Client

The javascript/typescript client for interacting with documents on SPK network.

# Usage

## Initialize the client

```ts
const spkClient = new SpkClient(SPK_INDEXER_HOST, ceramicClient), 
```

## Create a new document

```ts
const docContent = { key: "value" }
const parentId = "optionalParentStreamId"
const created = await spkClient.createDocument(docContent, parentId)
console.log(`Created new document with streamId ${created.streamId} and parent id ${parentId}`)
```

## Fetch a document

```ts
const fetched = await spkClient.fetchDocument(streamId)
```

## Update a document

```ts
const newContent = { key: "value2" }
await spkClient.updateDocument(streamId, newContent)
```

## Get documents belong to a user

```ts
const userDocs = await spkClient.getDocumentsForUser("[Owning User DID]")
```

## Get child documents of a parent

```ts
const childDocs = await spkClient.getDocumentChildren("[Parent document stream ID]")
```


