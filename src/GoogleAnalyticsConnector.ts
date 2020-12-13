import { Reshuffle, BaseConnector } from 'reshuffle-base-connector'
import Analytics, {AnalyticsInstance} from 'analytics'
// @ts-ignore
import googleAnalytics from '@analytics/google-analytics'


export interface GoogleAnalyticsConnectorConfigOptions {
  GATrackingId: string // Google Analytics Tracking Identifier
}

export default class GoogleAnalyticsConnector extends BaseConnector<
    GoogleAnalyticsConnectorConfigOptions,
  null
  > {
  private readonly analytics: AnalyticsInstance

  constructor(app: Reshuffle, options: GoogleAnalyticsConnectorConfigOptions, id?: string) {
    super(app, options, id)

    this.analytics = Analytics({
      plugins: [
        googleAnalytics({
          trackingId: options.GATrackingId,
        }),
      ]
    })
  }

  async trackEvent(eventName: string, payload: object): Promise<any> {
   return this.analytics.track(eventName, payload)
  }
}

export { GoogleAnalyticsConnector }