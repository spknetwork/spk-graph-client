// To compensate for missing TextEncoder in jsdom per https://github.com/jsdom/jsdom/issues/2524

import { getTestCeramicClient } from './util/get-test-ceramic-client.function'

const Environment = require('jest-environment-jsdom')
const CERAMIC_HOST = process.env.CERAMIC_HOST

if (!CERAMIC_HOST) {
  throw new Error('CERAMIC_HOST not provided in environment!')
}

class CustomJsDomEnvironment extends Environment {
  async setup() {
    await super.setup()
    if (typeof this.global.TextEncoder === 'undefined') {
      const { TextEncoder, TextDecoder } = require('util')
      this.global.TextEncoder = TextEncoder
      this.global.TextDecoder = TextDecoder
    }

    const CERAMIC_HOST = process.env.CERAMIC_HOST

    if (!CERAMIC_HOST) {
      throw new Error('CERAMIC_HOST not provided in environment!')
    }

    this.global.ceramic = await getTestCeramicClient(CERAMIC_HOST)
  }
}

export default CustomJsDomEnvironment
