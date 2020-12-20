import { Reshuffle, BaseConnector } from 'reshuffle-base-connector'
import { TextToSpeechClient, v1 } from '@google-cloud/text-to-speech'

export interface GoogleTextToSpeechConnectorConfigOptions {
  credentials: string
}

export class GoogleTextToSpeechConnector extends BaseConnector<
  GoogleTextToSpeechConnectorConfigOptions,
  null
> {
  private readonly client: v1.TextToSpeechClient

  constructor(app: Reshuffle, options: GoogleTextToSpeechConnectorConfigOptions, id?: string) {
    super(app, options, id)
    const credentials = options && options.credentials && JSON.parse(options.credentials)
    this.client = credentials ? new TextToSpeechClient({ credentials }) : new TextToSpeechClient()
  }

  // Connector Actions

  sdk(): v1.TextToSpeechClient {
    return this.client
  }
}
