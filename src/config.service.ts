export interface SpkClientConfig {
  idxAliases: {
    rootPosts: string
  }
}
export class ConfigService {
  static getConfig(): SpkClientConfig {
    return {
      idxAliases: {
        rootPosts: 'ceramic://kjzl6cwe1jw147fikhkjs9qysmv6dkdsu5i6zbgk4x9p47gt9uedru1755y76dg',
      },
    }
  }
}
