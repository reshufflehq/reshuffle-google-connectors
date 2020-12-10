import {
  GoogleSpreadsheet,
  GoogleSpreadsheetCell,
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
  ServiceAccountCredentials,
  WorksheetGridRange,
} from 'google-spreadsheet'
import { BaseConnector, EventConfiguration, Reshuffle } from 'reshuffle-base-connector'
import {
  detectChangesInSheet,
  extractCellData,
  GoogleSheetsSnapshot,
  RawWorkSheet,
} from './utilities'

const DEFAULT_CHECK_FOR_CHANGES_ELAPSE_TIME_MS = 10 * 1000 // 10 sec

export interface GoogleSheetsConnectorConfigOptions {
  credentials: ServiceAccountCredentials
  sheetId: string
}

export interface GoogleSheetsConnectorEventOptions {
  interval?: number
  sheetIdOrTitle?: string
}

export interface ReshuffleGoogleSheetsCell {
  value: string | number | boolean
  rowIndex: number
  columnIndex: number
  a1Row: number
  a1Column: string
  a1Address: string
}

export class GoogleSheetsConnector extends BaseConnector<
  GoogleSheetsConnectorConfigOptions,
  GoogleSheetsConnectorEventOptions
> {
  private readonly intervalIds: { [key: string]: NodeJS.Timer }

  constructor(app: Reshuffle, configOptions?: GoogleSheetsConnectorConfigOptions, id?: string) {
    super(app, configOptions, id)
    this.intervalIds = {}
  }

  async onStart(): Promise<void> {
    Object.values(this.eventConfigurations).forEach((event) => {
      this.intervalIds[event.id] = setInterval(() => {
        this.onTimer(event)
      }, event.options.interval)
    })
  }

  onStop(): void {
    Object.values(this.intervalIds).forEach(clearInterval)
  }

  // Your events
  on(
    options: GoogleSheetsConnectorEventOptions,
    handler: any,
    eventId?: string,
  ): EventConfiguration {
    options.interval = options.interval || DEFAULT_CHECK_FOR_CHANGES_ELAPSE_TIME_MS

    if (!eventId) {
      eventId = `GoogleSheets/${this.configOptions?.sheetId}/${options.interval}/${
        options.sheetIdOrTitle ? `${options.sheetIdOrTitle}/` : ''
      }${this.id}`
    }
    const event = new EventConfiguration(eventId, this, options)
    this.eventConfigurations[event.id] = event

    this.app.when(event, handler)

    return event
  }

  private async getSpreadSheetDocument(): Promise<GoogleSpreadsheet | undefined> {
    try {
      if (this.configOptions) {
        // spreadsheet key is the long id in the sheets URL
        const doc = new GoogleSpreadsheet(this.configOptions.sheetId)

        // use service account credentials
        await doc.useServiceAccountAuth(this.configOptions.credentials)

        await doc.loadInfo() // loads document properties and worksheets

        return doc
      }
    } catch (err) {
      this.app.getLogger().error(err, `Google Sheets - getSpreadSheetDocument error`)
      throw err
    }
  }

  public async getSheet(
    sheetIdOrTitle: number | string,
  ): Promise<GoogleSpreadsheetWorksheet | undefined> {
    try {
      if (this.configOptions) {
        // spreadsheet key is the long id in the sheets URL
        const doc = await this.getSpreadSheetDocument()

        const sheet =
          typeof sheetIdOrTitle === 'number'
            ? doc?.sheetsByIndex[sheetIdOrTitle]
            : doc?.sheetsByTitle[sheetIdOrTitle]
        this.app
          .getLogger()
          .info(
            `GoogleSheets ${this.configOptions.sheetId} (sheet title: ${sheet?.title}) loaded (${sheet?.rowCount} rows)`,
          )

        return sheet
      }
    } catch (err) {
      this.app.getLogger().error(err, `Google Sheets - getSheet error for sheet ${sheetIdOrTitle}`)
      throw err
    }
  }

  public async getRows(
    sheetIdOrTitle: number | string,
  ): Promise<GoogleSpreadsheetRow[] | undefined> {
    try {
      const worksheet = await this.getSheet(sheetIdOrTitle)
      return await worksheet?.getRows()
    } catch (err) {
      this.app.getLogger().error(err, `Google Sheets - getRows error for sheet ${sheetIdOrTitle}`)
      throw err
    }
  }

  public async getCell(
    sheetIdOrTitle: number | string,
    rowIndex: number,
    columnIndex: number,
  ): Promise<ReshuffleGoogleSheetsCell | undefined> {
    try {
      const worksheet = await this.getSheet(sheetIdOrTitle)
      await worksheet?.loadCells({
        startRowIndex: rowIndex,
        endRowIndex: rowIndex + 1,
        startColumnIndex: columnIndex,
        endColumnIndex: columnIndex + 1,
      })
      const cell = await worksheet?.getCell(rowIndex, columnIndex)

      return extractCellData(cell)
    } catch (err) {
      this.app
        .getLogger()
        .error(
          err,
          `Google Sheets - getCell error for sheet ${sheetIdOrTitle} [rowIndex: ${rowIndex}, columnIndex: ${columnIndex}]`,
        )
      throw err
    }
  }

  public async getCellByA1(
    sheetIdOrTitle: number | string,
    a1Address: string,
  ): Promise<ReshuffleGoogleSheetsCell | undefined> {
    try {
      const worksheet = await this.getSheet(sheetIdOrTitle)
      await worksheet?.loadCells(a1Address)
      const cell = await worksheet?.getCellByA1(a1Address)

      return extractCellData(cell)
    } catch (err) {
      this.app
        .getLogger()
        .error(
          err,
          `Google Sheets - getCell error for sheet ${sheetIdOrTitle} [a1Address: ${a1Address}]`,
        )
      throw err
    }
  }

  public async getCells(
    sheetIdOrTitle: string | number,
    filters: WorksheetGridRange,
  ): Promise<Partial<GoogleSpreadsheetCell>[][] | undefined> {
    if (
      filters.startRowIndex > filters.endRowIndex ||
      filters.startColumnIndex > filters.endColumnIndex
    ) {
      throw new Error('invalid range, start must be less than or equal to end')
    }

    try {
      const worksheet = await this.getSheet(sheetIdOrTitle)
      await worksheet?.loadCells(filters)
      const cells: Partial<GoogleSpreadsheetCell>[][] = []
      for (let rowIdx = filters.startRowIndex; rowIdx < filters.endRowIndex; rowIdx++) {
        const cellRow: Partial<GoogleSpreadsheetCell>[] = []
        cells.push(cellRow)
        for (
          let columnIdx = filters.startColumnIndex;
          columnIdx < filters.endColumnIndex;
          columnIdx++
        ) {
          const cell = worksheet?.getCell(rowIdx, columnIdx)
          const cellData = extractCellData(cell)
          cellData && cellRow.push(cellData)
        }
      }
      return cells
    } catch (err) {
      this.app.getLogger().error(err, `Google Sheets - getCells error for sheet ${sheetIdOrTitle}`)
      throw err
    }
  }

  public async addRow(
    sheetIdOrTitle: string | number,
    values:
      | {
          [header: string]: string | number | boolean
        }
      | Array<string | number | boolean>,
    options?: { raw: boolean; insert: boolean },
  ): Promise<void> {
    try {
      const worksheet = await this.getSheet(sheetIdOrTitle)
      worksheet?.addRow(values, options)
    } catch (err) {
      this.app
        .getLogger()
        .error(
          err,
          `Google Sheets - addRow error for sheet ${sheetIdOrTitle}  [values: ${values}, options: ${options}]`,
        )
      throw err
    }
  }

  private async getInfo() {
    try {
      if (this.configOptions) {
        // spreadsheet key is the long id in the sheets URL
        const doc = await this.getSpreadSheetDocument()

        return {
          sheetCount: doc?.sheetCount,
          sheetsByIndex: doc?.sheetsByIndex,
        }
      }
    } catch (err) {
      this.app
        .getLogger()
        .error(
          err,
          `Google Sheets - error loading info [sheetId: ${this.configOptions?.sheetId}]`,
        )
      throw err
    }
  }

  private async getStringifiedRowsFromWorksheet(sheetIdOrTitle?: string | number) {
    const rows: RawWorkSheet[] = []

    // TODO: Using sheetid as unique key assumes a 1-to-1 relation between
    // sheetid and connector when there might be two connections to the
    // same sheet with different credentials. Providing a
    // runtime.getUniqueConnectorId might work better for this purpose
    const sheetInfo = await this.getInfo()

    if (sheetInfo && sheetInfo.sheetsByIndex) {
      for (const worksheet of sheetInfo.sheetsByIndex) {
        if (
          !sheetIdOrTitle ||
          sheetIdOrTitle === worksheet.title ||
          sheetIdOrTitle === worksheet.index
        ) {
          const sheetRows = await worksheet.getRows()
          const pojoSheetRows = sheetRows.map(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ({ _sheet, _rawData, _rowNumber, ...restProp }) => restProp,
          )
          rows.push({ worksheetId: worksheet.sheetId, rows: pojoSheetRows })
        }
      }
    }

    return JSON.stringify(rows)
  }

  public async onTimer(event: EventConfiguration): Promise<void> {
    if (!this.configOptions) return

    const updater = async (oldRec: GoogleSheetsSnapshot) => {
      const newRec = {
        json: await this.getStringifiedRowsFromWorksheet(event.options.sheetIdOrTitle),
      }
      return !oldRec || oldRec.json !== newRec.json ? newRec : undefined
    }

    const [oldRecord, newRecord] = await this.app
      .getPersistentStore()
      .update(this.configOptions.sheetId, updater)

    if (oldRecord && newRecord) {
      const oldRows = JSON.parse(oldRecord.json)
      const newRows = JSON.parse(newRecord.json)

      const sheetId = this.configOptions?.sheetId
      this.app.getLogger().info(`Google Sheets - changes detected for sheets ${sheetId}`)

      const changes = detectChangesInSheet(oldRows, newRows)

      await this.app.handleEvent(event.id, {
        ...event,
        oldRows,
        newRows,
        ...changes,
      })
    }
  }

  public async sdk(): Promise<GoogleSpreadsheet | undefined> {
    try {
      if (this.configOptions) {
        // spreadsheet key is the long id in the sheets URL
        return this.getSpreadSheetDocument()
      }
    } catch (err) {
      this.app.getLogger().error(err, `Google Sheets - sdk error`)
      throw err
    }
  }
}
