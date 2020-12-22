## Reshuffle Google Analytics Connector

`npm install reshuffle-google-connectors`

_ES6 import_: `import { GoogleAnalyticsConnector } from 'reshuffle-google-connectors'`

This is a [Reshuffle](https://reshuffle.com) connector that provides an Interface to the Google Analytics Platform.

This connector uses [Universal Analytics](https://www.npmjs.com/package/universal-analytics) package.

#### Example
```js
const { GoogleAnalyticsConnector } = require('reshuffle-google-connectors')
const app = new Reshuffle()

const options = { trackingId: 'UA-XXXXXXXXX-Y' }

const gaConnector = new GoogleAnalyticsConnector(app, options)

gaConnector.trackEvent('my category', 'my action') // Capture an event in Google Analytics
```

### Table of Contents

[Setup Google Analytics (get a tracking id)](#setup)

[Configuration Options](#configuration)

#### Connector Events

N/A

#### Connector Actions

[Track Event](#trackevent)

[Track Page View](#trackpageview)

[SDK](#sdk) - Get a universal analytics client


### <a name="setup"></a>Setup Google Analytics (get a tracking id)
1. Log in to [Google Analytics Platform](https://analytics.google.com/analytics/web/)
2. 'Admin' > 'Create a property'
3. Enter a property name
4. Click on 'Show Advanced Options'
5. Switch on 'Create a Universal Analytics property'
6. Select 'Create a Universal Analytics property only'
7. In Website URL, use your Reshuffle runtime URL
8. Click 'Next' then 'Create'
9. Copy your tracking ID (e.g. UA-XXXXXXXXX-Y)
10. Provide this tracking ID when creating your Reshuffle connector (see below instructions) 

### <a name="configuration"></a>Configuration Options
```typescript
export interface GoogleAnalyticsConnectorConfigOptions {
    trackingId: string // Google Analytics Tracking Identifier (e.g. UA-XXXXXXXXX-Y)
    clientId?: string
    uaOptions?: ua.VisitorOptions
}
```

Example:
```typescript
const { GoogleAnalyticsConnector } = require('reshuffle-google-connectors')
const app = new Reshuffle()

const gaConnector = new GoogleAnalyticsConnector(app, { trackingId: 'UA-XXXXXXXXX-Y' })
```

### Connector events
N/A

#### <a name="trackevent"></a>Track Event

For tracking custom events
```typescript
trackEvent(category: string, action: string, label?: string, value?: string|number) : Promise<void>
```

#### <a name="trackpageview"></a>Track Page View

For tracking page views
```typescript
trackPageView(path: string, hostname?: string, title?: string): Promise<void>
```

#### <a name="sdk"></a>SDK

Returns a Universal Analytics client ([See details on npm](https://www.npmjs.com/package/universal-analytics))

```typescript
 sdk() : ua.Visitor
```
See ua.Visitor class in [Universal Analytics Visitor type](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/universal-analytics/index.d.ts#L375)

Example using the sdk:
```typescript
const app = new Reshuffle()
const options = { trackingId: 'UA-XXXXXXXXX-Y' }
const gaConnector = new GoogleAnalyticsConnector(app, options)

await gaConnector.sdk().event(category, action).send()
```
