# reshuffle-google-translate-connector
[Code](https://github.com/reshufflehq/reshuffle-google-translate-connector) |  [npm](https://www.npmjs.com/package/reshuffle-google-translate-connector) | [Code sample](https://github.com/reshufflehq/reshuffle/tree/master/examples/google/translate)

`npm install reshuffle-google-connectors`

This connector uses [Official Node Google Translate Client](https://www.npmjs.com/package/@google-cloud/translate) package.

### Reshuffle Google Translate Connector



_ES6 import_: `import { GoogleTranslateConnector } from 'reshuffle-google-connectors'` 

This is a [Reshuffle](https://dev.reshuffle.com) connector that provides an Interface to the Google Translate Client.

#### Setup
You need a project in Google Cloud that has the Cloud Translation API enabled and credentials to make authenticated calls. 
See more details [here](https://cloud.google.com/translate/docs/setup)


#### Configuration Options:
```typescript
interface GoogleTranslateConnectorConfigOptions {
  credentials: string
}
```

### Table of Contents

[Translate text - translateText](#translateText)

[Translate text array - translateTexts](#translateTexts)

[SDK](#sdk)

#### Connector events
N/A

#### Connector actions

##### <a name="translateText"></a>translateText
Returns the translated text response from source to target language

```typescript
translateText(
    text: string,
    source: string,    // e.g. 'en',
    target: string,    // e.g. 'fr',    
    location: string,  // Project's location like 'global' or 'us-central1'
    mimeType: string,  // mime types: text/plain, text/html
  ): Promise<string | undefined | null>
```

###### Example
```js
  const connector = new GoogleTranslateConnector(app, { credentials: credentials, location: 'global' })
  const result = await connector.translateText(['Hello world', 'Text to translate'], 'en', 'fr', 'global', 'text/plain' )
  console.log(`Translation: ${result}`)
  
```

##### <a name="translateTexts"></a>translateTexts
Returns the translated array text response from source to target language

```typescript
translateTexts(
    text: string[],
    source: string,    // e.g. 'en',
    target: string,    // e.g. 'fr',    
    location: string,  // Project's location like 'global' or 'us-central1'
    mimeType: string,  // mime types: text/plain, text/html
  ): Promise<google.cloud.translation.v3.TranslateTextResponse>
```

###### Example
```js
  const connector = new GoogleTranslateConnector(app, { credentials: credentials, location: 'global' })
  const result = await connector.translateTexts(['Hello world', 'Text to translate'], 'en', 'fr', 'global', 'text/plain' )
  for (const translation of result.translations) {
    console.log(`Translation: ${translation.translatedText}`)
  }
```

##### <a name="sdk"></a>sdk
Returns the Google Translate Service Client
```typescript
// See: https://googleapis.dev/nodejs/translate/latest/v3.TranslationServiceClient.html
sdk(): v3.TranslationServiceClient
```

###### Example
```js
  const [result] = await connector.sdk().translateText({
      parent: `projects/<project-id>/locations/<location>`,
      contents: ['Hello world', 'Text to translate'],
      mimeType: 'text/plain',
      sourceLanguageCode: 'en',
      targetLanguageCode: 'fr',
  })
  for (const translation of result.translations) {
      console.log(`Translation: ${translation.translatedText}`)
  }
```
`<project-id>` - Google Cloud Project Id, see https://cloud.google.com/resource-manager/docs/creating-managing-projects

`<location>` - Project's location like 'global' or 'us-central1'