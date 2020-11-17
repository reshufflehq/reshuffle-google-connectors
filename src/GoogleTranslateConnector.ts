import { Reshuffle, BaseConnector, EventConfiguration } from 'reshuffle-base-connector'
import TranslationServiceClient, { protos, v3 } from '@google-cloud/translate'

export interface GoogleTranslateConnectorConfigOptions {
  credentials: string
}

export default class GoogleTranslateConnector extends BaseConnector<
  GoogleTranslateConnectorConfigOptions,
  null
  > {

  private client: v3.TranslationServiceClient

  constructor(app: Reshuffle, options?: GoogleTranslateConnectorConfigOptions, id?: string) {
    super(app, options, id)
    this.client = new v3.TranslationServiceClient()
  }

  async translate(
    text: string,
    projectId: string,
    location: string,
    mimeType: string,
    source: string,
    target: string,
  ) {

    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: Array.isArray(text) ? text : [text],
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