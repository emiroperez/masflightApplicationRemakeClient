import { Injectable } from '@angular/core';

import * as XLSX from 'xlsx';
import { Utils } from '../commons/utils';

@Injectable({
    providedIn: 'root'
})
export class ExcelService {

  utils: Utils;

  predefinedTimeFormats: any = {
    "short": "h:mm AM/PM",
    "medium": "h:mm:ss AM/PM",
    "long": "h:mm:ss AM/PM",
    "full": "h:mm:ss AM/PM",
    "shortDate": "h:mm AM/PM",
    "mediumDate": "h:mm:ss AM/PM",
    "longDate": "h:mm:ss AM/PM",
    "fullDate": "h:mm:ss AM/PM",
    "shortTime": "h:mm AM/PM",
    "mediumTime": "h:mm:ss AM/PM",
    "longTime": "h:mm:ss AM/PM",
    "fullTime": "h:mm:ss AM/PM"
  };

  predefinedDateFormats: any = {
    "short": "m/d/yy",
    "medium": "MMM d, yy",
    "long": "MMMM d, yy",
    "full": "NNNNMMMM d, y",
    "shortDate": "m/d/yy",
    "mediumDate": "MMM d, yy",
    "longDate": "MMMM d, yy",
    "fullDate": "NNNNMMMM d, yy",
    "shortTime": "m/d/yy",
    "mediumTime": "MMM d, yy",
    "longTime": "MMMM d, yy",
    "fullTime": "NNNNMMMM d, yy"
  };

  constructor()
  {
    this.utils = new Utils ();
  }

  public exportAsExcelFile(tableSource: any, excelFileName: string, tableColumnFormats: any): void
  {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet (tableSource);
    const wb: XLSX.WorkBook = XLSX.utils.book_new ();
    let wscols: any[] = [];

    XLSX.utils.book_append_sheet (wb, ws, 'Sheet1');

    for (let tableColumnFormat of tableColumnFormats)
    {
      if (tableColumnFormat.type === "number")
      {
        let format: string = "";

        if (tableColumnFormat.prefix)
          format += "\"" + tableColumnFormat.prefix + "\"";

        format += this.utils.convertNumberFormat (tableColumnFormat.format);

        if (tableColumnFormat.suffix)
          format += "\"" + tableColumnFormat.suffix + "\"";

        this.SheetSetColumnFormat (ws, tableColumnFormat.pos, format, "n");
      }
      else if (tableColumnFormat.type === "date")
      {
        if (this.predefinedDateFormats[tableColumnFormat.format])
          this.SheetSetColumnFormat (ws, tableColumnFormat.pos, this.predefinedDateFormats[tableColumnFormat.format], "d");
        else
          this.SheetSetColumnFormat (ws, tableColumnFormat.pos, tableColumnFormat.format.toLowerCase (), "d");
      }
      else if (tableColumnFormat.type === "time" && tableColumnFormat.format !== "min")
      {
        if (this.predefinedTimeFormats[tableColumnFormat.format])
          this.SheetSetColumnFormat (ws, tableColumnFormat.pos, this.predefinedTimeFormats[tableColumnFormat.format], "d");
        else
          this.SheetSetColumnFormat (ws, tableColumnFormat.pos, tableColumnFormat.format.toLowerCase (), "d");
      }

      wscols.push ({ wch: tableColumnFormat.width });
    }

    /* set column width */
    ws['!cols'] = wscols;

    /* save to file */
    XLSX.writeFile (wb, excelFileName + '.xlsx'); 
  }

  private SheetSetColumnFormat(ws, C, Z, T)
  {
    let range = XLSX.utils.decode_range (ws["!ref"]);

    /* this loop starts on the second row, as it assumes the first row is a header */
    for(let R = range.s.r + 1; R <= range.e.r; R++)
    {
      let cell = ws[XLSX.utils.encode_cell ({ r: R, c: C })];

      if (!cell)
        continue;

      cell.t = T;
      cell.z = Z;
    }
  }
}