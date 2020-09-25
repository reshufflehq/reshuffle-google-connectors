## Reshuffle Google Language Connector

`npm install reshuffle-google-connectors`

_Commonjs_: `const { GoogleLanguageConnector } = require('reshuffle-google-connectors')`

_ES6 import_: `import { GoogleLanguageConnector } from 'reshuffle-google-connectors'` 

This connector provides an Interface to the Google Language Client.

#### Configuration Options:
```typescript
interface GoogleLanguageConnectorConfigOptions {
  credentials: string
}
```
#### Connector events
N/A

#### Connector actions

##### analyzeSentiment
Returns the analyzed sentiment response
```typescript
analyzeSentiment(
    text: string,
  ): Promise<protos.google.cloud.language.v1.IAnalyzeSentimentResponse>
```

Analyzes the sentiment of the provided text

###### Example
```js
const connector = new GoogleLanguageConnector(app, { credentials })
const result = await connector.analyzeSentiment("The text I want analyzed")
console.log("Language:", result.language, " Sentiment score: ", result.documentSentiment.score)
```

##### sdk
Returns the Google Language Service Client
```typescript
// See: https://googleapis.dev/nodejs/language/latest/v1.LanguageServiceClient.html
sdk(): v1.LanguageServiceClient
```

###### Example
```js
const document = {
  content: 'The text I want analyzed',
  type: 'PLAIN_TEXT',
};
const connector = new GoogleLanguageConnector(app, { credentials })
const [result] = await connector.sdk().analyzeEntities({ document });
const entities = result.entities;
entities.forEach(entity => {
  console.log(entity.name);
}
```
