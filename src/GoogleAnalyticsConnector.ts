import { Reshuffle, BaseConnector } from 'reshuffle-base-connector'
import fetch from 'node-fetch'


export interface GoogleAnalyticsConnectorConfigOptions {
  GATrackingId: string // Google Analytics Tracking Identifier
  cid: string // Anonymous Client Identifier
  type?: string // Default is 'event'
}

export default class GoogleAnalyticsConnector extends BaseConnector<
    GoogleAnalyticsConnectorConfigOptions,
  null
  > {

  constructor(app: Reshuffle, options: GoogleAnalyticsConnectorConfigOptions, id?: string) {
    options.type = options.type || 'event'
    super(app, options, id)
  }

  async trackEvent(category: string, action: string, label: string, value: string): Promise<void> {
    const params = {
      v: '4', // API Version
      tid: this.configOptions?.GATrackingId,
      cid: this.configOptions?.cid,
      t: this.configOptions?.type,
      ec: category,
      ea: action,
      el: label,
      ev: value,
    }
    const resp = await fetch('http://www.google-analytics.com/debug/collect', { method: 'POST', body: JSON.stringify(params) })

    if(!resp.ok) {
      this.app.getLogger().error('Reshuffle - Google Analytics Connector: fail to track event')
    }
  }
}

export { GoogleAnalyticsConnector }