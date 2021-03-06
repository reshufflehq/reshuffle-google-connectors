import { Reshuffle, BaseConnector, EventConfiguration } from 'reshuffle-base-connector'
import TranslationServiceClient, { protos, v3 } from '@google-cloud/translate'

export interface GoogleTranslateConnectorConfigOptions {
  credentials: string
  location: string
}

export default class GoogleTranslateConnector extends BaseConnector<
  GoogleTranslateConnectorConfigOptions,
  null
> {
  private client: v3.TranslationServiceClient
  private projectId: string
  private location: string

  constructor(app: Reshuffle, options: GoogleTranslateConnectorConfigOptions, id?: string) {
    super(app, options, id)
    const credentials = JSON.parse(options.credentials)
    this.client = new v3.TranslationServiceClient({ credentials })
    this.projectId = credentials.project_id
    this.location = options?.location || 'global'
  }

  async translateText(
    text: string,
    source: string,
    target: string,
    location = this.location,
    mimeType = 'text/plain',
  ): Promise<string | undefined | null> {
    const request = {
      parent: `projects/${this.projectId}/locations/${location}`,
      contents: [text],
      mimeType: mimeType,
      sourceLanguageCode: source,
      targetLanguageCode: target,
    }

    try {
      const [response] = await this.client.translateText(request)
      return response.translations ? response.translations[0].translatedText : ''
    } catch (error) {
      this.app.getLogger().error(error.details)
    }
  }

  async translateTexts(
    text: string[],
    source: string,
    target: string,
    location = this.location,
    mimeType = 'text/plain',
  ) {
    const request = {
      parent: `projects/${this.projectId}/locations/${location}`,
      contents: text,
      mimeType: mimeType,
      sourceLanguageCode: source,
      targetLanguageCode: target,
    }

    try {
      const [response] = await this.client.translateText(request)
      return response
    } catch (error) {
      this.app.getLogger().error(error.details)
    }
  }

  sdk(): v3.TranslationServiceClient {
    this.app.getLogger().info(`Google Translate - SDK Returned`)
    return this.client
  }
}

export { GoogleTranslateConnector }
