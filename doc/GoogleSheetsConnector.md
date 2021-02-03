## Reshuffle Google Sheets Connector

`npm install reshuffle-google-connectors`


This is a [Reshuffle](https://dev.reshuffle.com) connector that allows you to Interact with online Google Sheets.

The connector is designed to work with Google Sheets in the form of a table,
where the header row (first row) is defined.

The following example listens to changes in online spreadsheet:
```js
const { GoogleSheetsConnector } = require('reshuffle-google-connectors')

const myGoogleSheetsConnector = new GoogleSheetsConnector(app, {
  credentials: {
    client_email: '<your_client_email>',
    private_key: '<your_private_key>',
  },
  documentId: '<your_documentId>',
})

const myHandler = (event, app) => {
  // event is { oldRows, newRows, worksheetsRemoved: WorkSheetChanges[], worksheetsAdded: WorkSheetChanges[], worksheetsChanged: WorkSheetChanges[] }
  // WorkSheetChanges is { worksheetId, rowsRemoved, rowsAdded, rowsChanged }
  console.log('New rows detected!')
  event.options.sheetIdOrTitle &&
    console.log(
      `'sheetIdOrTitle' is set in event options so it only checks for changes in sheet ${event.options.sheetIdOrTitle}`,
    )

  event.newRows.forEach(({ worksheetId, rows }) => {
    console.log(`workSheetId: ${worksheetId}`)

    rows.forEach((row, index) => {
      let rowString = `line ${index + 1}\t`
      Object.values(row).forEach((val) => (rowString += `${val}\t`))
      console.log(rowString)
    })
  })

  event.worksheetsChanged[0] &&
    event.worksheetsChanged[0].rowsAdded[0] &&
    console.log(
      `Example of new line values ${JSON.stringify(
        event.worksheetsChanged[0].rowsAdded[0],
      )}`,
    )
}

/** Trigger a handler when changes are detected in document <sheetId> (it will check for changes every 10 seconds) */
myGoogleSheetsConnector.on({}, myHandler)

app.start()
```

#### Configuration Options:
```typescript
interface GoogleSheetsConnectorConfigOptions {
  credentials: ServiceAccountCredentials
  sheetId: string
}
```

#### Connector events

##### rows changed
This event is fired when rows have changed in the online Sheets.

You can trigger a handler on rows changed by providing the following options to the `on` method:
```typescript
interface GoogleSheetsConnectorEventOptions {
  interval?: number
  sheetIdOrTitle?: string
  keyColumn?: string
}
```

Event is an object containing attribute:
```typescript
oldRows: cellValue[]
newRows: cellValue[]
worksheetsRemoved: WorkSheetChanges[]
worksheetsAdded: WorkSheetChanges[]
worksheetsChanged: WorkSheetChanges[]

export interface cellValue {
  headerName: string
  value: string
}

export interface WorkSheetChanges {
  worksheetId: string
  rowsRemoved: any[]
  rowsAdded: any[]
  rowsChanged: RowChange[]
}

export interface RowChange {
  prev: any
  curr: any
}
```

##### Example:
```js
const myHandler = (event, app) => {
  console.log('New rows detected!')
  event.options.sheetIdOrTitle && console.log(`'sheetIdOrTitle' is set in event options so it only checks for changes in sheet ${event.options.sheetIdOrTitle}`)

  event.newRows.forEach(({worksheetId, rows}) => {
    console.log(`workSheetId: ${worksheetId}`)

    rows.forEach((row, index) => {
      let rowString = `line ${index + 1}\t`
      Object.values(row).forEach(val => rowString += `${val}\t`)
      console.log(rowString)
    })
  })

  event.worksheetsChanged[0]
    && event.worksheetsChanged[0].rowsAdded[0]
    && console.log(`Example of new line values ${JSON.stringify(event.worksheetsChanged[0].rowsAdded[0])}`)
}

/** Trigger a handler when changes are detected in document <sheetId> (it will check for changes every 10 seconds) */
myGoogleSheetsConnector.on({}, myHandler)

/** Check for changes every minute (it overrides the default timer set to 10 sec) */
const aMinuteMs = 60 * 1000
myGoogleSheetsConnector.on({interval: aMinuteMs}, myHandler)

/** Check for changes in a specific sheet by id */
myGoogleSheetsConnector.on({sheetIdOrTitle: 0}, myHandler)

/** Check for changes only in a specific sheet by title and every 30 seconds */
myGoogleSheetsConnector.on({sheetIdOrTitle: 'Sheet1', interval: 30 * 1000}, myHandler)

/** Check for changes using a key column for more accuracy, see Known Issues below */
myGoogleSheetsConnector.on({keyColumn: 'Identifier'}, myHandler)
```

##### Known Issues:
Since Google Sheets does not provide rows identifiers, it is hard to identify which events caused the rows changes,for example when deleting a row which is not at the bottom of the spreadsheet, the rows below are shifted up. This can be interpritated as an update of all the rows below including the "deleted" row and a deletion of the last row.
These are the options to handle such cases:
1. Add or delete rows just from the bottom of the spreadsheet.
2. Consider the `event.oldRows` & `event.newRows`, these attributes will provide you all the information about the spreadsheet rows before and after the changes. Now it is up to you to decide how to handle the events.
3. Set a Key column in your spreadsheet with a unique identifier and provide it's name as the `GoogleSheetsConnectorEventOptions.keyColumn`. Using this column the connector will make an accurate decision about the spreadsheet events.
In case of duplicated identifiers only the last identifier's row will be considered.

When using the `keyColumn` and having multiple sheets, the same column name should be used in all the sheets. In every sheet the column can have different types of identifiers but the column name should be the same, for example `keyColumn` is set to be 'RS-Identifier', in Sheet1 it can be email address while in Sheet2 it can be a serial number.

#### Connector actions
This connector provides all the common actions to interact with a Google Sheets document.
It also provides the sdk (which return a Google Sheets instance) for more advanced operations.

##### getRows
Get all rows of a sheet id|title. This action returns an array of rows. Each row
is an object, with properties matching the column names set by the header row.

###### Example
```js
const sheetTitle = 'Sheet1'
const rows = await myGoogleSheetsConnector.getRows(sheetTitle)
console.log(`Sheet ${sheetTitle} contains ${rows.length} row(s)`)
rows.forEach(row => console.log(row._rawData))
```

##### getCell
Get data of a cell at rowIndex/columnIndex of a sheet id|title

###### Example
```js
const rowIndex = 2
const columnIndex = 1
const cell = await myGoogleSheetsConnector.getCell(sheetId, rowIndex, columnIndex)
console.log(`Cell details [value: ${cell.value}, a1Address: ${cell.a1Address},` +
   ` rowIndex: ${cell.rowIndex}, columnIndex: ${cell.columnIndex}, a1Row: ${cell.a1Row}, a1Column:${cell.a1Column}]`)
```

##### getCellByA1
Get data of a cell by a1 address of a sheet id|title

###### Example
```js
const a1Address = 'B2'
const cell = await myGoogleSheetsConnector.getCellByA1(sheetTitle, a1Address)
console.log(`Cell has properties ${JSON.stringify(cell)}`)
```

##### getCells
Get cells data for range in sheet by id|title

###### Example
```js
const range = {startRowIndex: 1, endRowIndex: 5, startColumnIndex: 0, endColumnIndex: 2}
const rows = await myGoogleSheetsConnector.getCells(sheetTitle, range)
console.log(`Sheets contains ${rows.length} row(s)`)
rows.forEach(row => console.log(row))
```

##### addRow
Adds a new row to a sheet identified by its id|title

###### Example
```js
const sheetId = 0
const values = ['value 1', 'value 2', 'value 3']
await myGoogleSheetsConnector.addRow(sheetId, values)
```

##### getInfo
Get document info (returns an object with sheetCount and sheetsByIndex)

###### Example
```js
const docInfo = await myGoogleSheetsConnector.getInfo()
console.log(`Document has ${docInfo.sheetCount} sheets.`)
docInfo.sheetsByIndex.forEach(
  sheetDetails => console.log(`[id: ${sheetDetails.sheetId}, title: ${sheetDetails.title}]`)
)
```

##### sdk
returns a Google Sheets instance for sheetId

See documentation in github: https://github.com/theoephraim/node-google-spreadsheet

###### Examples
```js
/** Add new sheet using the sdk */
const newSheetTitle = 'new sheet'
const newSheetProperties = {title: newSheetTitle, headerValues: ['header 1', 'header 2', 'header 3']}
const doc = await myGoogleSheetsConnector.sdk()
await doc.addSheet(newSheetProperties)

/** Delete sheet by id|title using the sdk */
const sheetTitleToDelete = 'new sheet'
const doc = await myGoogleSheetsConnector.sdk()
const sheet = doc.sheetsByTitle[sheetTitleToDelete]
// const sheet = doc.sheetsByIndex[2] // Use this line for deleting by sheet id
await sheet.delete()
```

More examples on how to use this connector can be [found here](https://github.com/reshufflehq/reshuffle/blob/master/examples/google/sheets/GoogleSheetsExamples.js).
