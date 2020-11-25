## Reshuffle Google Text to Speech Connector

`npm install reshuffle-google-connectors`

_ES6 import_: `import { GoogleTextToSpeechConnector } from 'reshuffle-google-connectors'` 

This is a [Reshuffle](https://dev.reshuffle.com) connector that provides an Interface to the Google Text to Speech  Client.

#### Example
```js
const connector = new GoogleText2SpeechConnector(app, {})
const sdk = connector.sdk()
const request = {
  input: { text: "Hello, pleased to meet you. Have a seat" },
  voice: { languageCode: 'en-US', ssmlGender: 'FEMALE' },
  audioConfig: { audioEncoding: 'MP3', effectsProfileId: ['handset-class-device'] }
}
const [response] = await sdk.synthesizeSpeech(request)

// an mp3 file is returned as response.audioContent
```

### Configuration Options:
```typescript
interface GoogleTextToSpeechConnectorConfigOptions {
  credentials: string
}
```
### Connector events
N/A

### Connector actions

#### sdk
Returns a Text to Speech client ([See details on npm](https://www.npmjs.com/package/@google-cloud/text-to-speech))
```typescript
sdk() : TextToSpeechClient
```
