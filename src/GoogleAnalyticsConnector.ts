import { Reshuffle, BaseConnector } from 'reshuffle-base-connector'
import ua from 'universal-analytics'

export interface GoogleAnalyticsConnectorConfigOptions {
  trackingId: string // Google Analytics Tracking Identifier
  clientId?: string
  uaOptions?: ua.VisitorOptions
}

export default class GoogleAnalyticsConnector extends BaseConnector<
  GoogleAnalyticsConnectorConfigOptions,
  null
> {
  private readonly analytics: ua.Visitor

  constructor(app: Reshuffle, options: GoogleAnalyticsConnectorConfigOptions, id?: string) {
    super(app, options, id)
    this.analytics =
      options.clientId && options.uaOptions
        ? ua(options.trackingId, options.clientId, options.uaOptions)
        : options.clientId
        ? ua(options.trackingId, options.clientId)
        : ua(options.trackingId)
  }

  async trackEvent(
    category: string,
    action: string,
    label?: string,
    value?: string | number,
  ): Promise<void> {
    return label && value
      ? this.analytics.event(category, action, label, value).send()
      : label
      ? this.analytics.event(category, action, label).send()
      : this.analytics.event(category, action).send()
  }

  async trackPageView(path: string, hostname?: string, title?: string): Promise<void> {
    if (!path.startsWith('/')) {
      throw new Error("path should begin wih '/'")
    }
    return title && hostname
      ? this.analytics.pageview(path, hostname, title).send()
      : hostname
      ? this.analytics.pageview(path, hostname).send()
      : this.analytics.pageview(path).send()
  }

  sdk(): ua.Visitor {
    return this.analytics
  }
}

export { GoogleAnalyticsConnector }
