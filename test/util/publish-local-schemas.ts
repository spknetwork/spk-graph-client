import { ModelManager } from '@glazed/devtools'
import { getTestCeramicClient } from './get-test-ceramic-client.function'
import { PublishedSchemas } from './published-schemas.interface'
import fs from 'fs/promises'
import path from 'path'

void (async () => {
  const ceramic = await getTestCeramicClient('http://localhost:7007')
  const manager = new ModelManager({ceramic})
  const schema = await manager.createSchema('rootPosts', {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'rootPosts',
    type: 'object',
    description: 'root Posts',
    properties: {
      '^([a-zA-Z]+(-[a-zA-Z]+)+)': {
        type: 'string',
        pattern: '^ceramic://.+',
        maxLength: 128,
      },
    },
  })
  await manager.createDefinition('rootPosts', {
    name: 'My note',
    description: 'A simple text note',
    schema: manager.getSchemaURL(schema) as string,
  })
  const schemaUrl = manager.getSchemaURL(schema)
  console.log(schema)
  console.log(`SCHEMA URL`, schemaUrl)
  const model = await manager.model()
  console.log(model)

  const schemas: PublishedSchemas = {
    rootPosts: schemaUrl as string,
  }

  const schemaFilePath = path.join(__dirname, '../../temp/schemas.json')

  await fs.writeFile(schemaFilePath, JSON.stringify(schemas), {
    encoding: 'utf-8',
  })
})()
