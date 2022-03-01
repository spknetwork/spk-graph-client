export interface SpkClientConfig {
  idxAliases: {
    rootPosts: string
  }
}
export class ConfigService {
  static getConfig(): SpkClientConfig {
    return {
      idxAliases: {
        rootPosts: 'ceramic://kjzl6cwe1jw149xy2w2qycwts4xjpvyzrkptdw20iui7r486bd6sasqb9tgglzp',
      },
    }
  }
}
