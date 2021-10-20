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
const created = await spkClient.createDocument(docContent)
console.log(`Created new document with streamId ${created.streamId}`)
```

## Fetch a document

```ts
const fetched = await spkClient.fetchDocument(streamId)
```

## Update a document

```ts
const newContent = { key: "value2" }
await spkClient.updateDocument(streamId, newContent)
``



