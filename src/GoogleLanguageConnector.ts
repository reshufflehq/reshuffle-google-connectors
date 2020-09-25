import { Reshuffle, BaseConnector } from 'reshuffle-base-connector'
import language, { protos, v1 } from '@google-cloud/language'

export interface GoogleLanguageConnectorConfigOptions {
  credentials: string
}

export class GoogleLanguageConnector extends BaseConnector<
  GoogleLanguageConnectorConfigOptions,
  null
> {
  client: v1.LanguageServiceClient

  constructor(app: Reshuffle, options: GoogleLanguageConnectorConfigOptions, id?: string) {
    super(app, options, id)
    const credentials = JSON.parse(options.credentials)
    this.client = new language.LanguageServiceClient({ credentials })
  }

  async analyzeSentiment(
    text: string,
  ): Promise<protos.google.cloud.language.v1.IAnalyzeSentimentResponse> {
    this.app.getLogger().info(`Google Language - Sentiment Analyzed`)
    const [result] = await this.client.analyzeSentiment({
      document: {
        content: text,
        type: 'PLAIN_TEXT',
      },
      encodingType: 'UTF8',
    })
    return result
  }

  sdk(): v1.LanguageServiceClient {
    this.app.getLogger().info(`Google Language - SDK Returned`)
    return this.client
  }
}
