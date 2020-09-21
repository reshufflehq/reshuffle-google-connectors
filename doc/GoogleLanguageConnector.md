# reshuffle-google-language-connector

### Reshuffle GoogleLanguageConnector

This connector provides an Interface to the Google Language Client.

#### Configuration Options:
```typescript
interface GoogleLanguageConnectorConfigOptions {
  credentials: string
}
```
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
const connector = new GoogleLanguageConnector({ credentials })
const result = await connector.analyzeSentiment("The text I want analzed")
console.log("Language:", result.language, " Sentiment score: ", result.documentSentiment.score)
```

##### sdk
Returns the Google Language Service Client
```typescript
sdk(): v1.LanguageServiceClient
```

###### Example
```js
const document = {
  content: 'The text I want analzed',
  type: 'PLAIN_TEXT',
};
const connector = new GoogleLanguageConnector({ credentials })
const [result] = await connector.sdk().analyzeEntities({ document });
const entities = result.entities;
entities.forEach(entity => {
  console.log(entity.name);
}
```