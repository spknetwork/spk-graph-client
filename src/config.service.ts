export interface SpkClientConfig {
  idxAliases: {
    rootPosts: string
    socialConnectionIndex: string
  }
}
export class ConfigService {
  static getConfig(): SpkClientConfig {
    return {
      idxAliases: {
        rootPosts: 'ceramic://kjzl6cwe1jw149xy2w2qycwts4xjpvyzrkptdw20iui7r486bd6sasqb9tgglzp',
        //'socialConnectionIndex': 'ceramic://kjzl6cwe1jw14813g8zgi9mfqq5nsjjqzc58z5kubi57zkukwkep69fehezagct'
        'socialConnectionIndex': 'ceramic://kjzl6cwe1jw145f1327br2k7lkd5acrn6d2omh88xjt70ovnju491moahrxddns'
      },
    }
  }
}
