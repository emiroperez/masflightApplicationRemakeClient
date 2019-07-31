import { Injectable } from '@angular/core';

import * as XLSX from 'xlsx';

@Injectable({
    providedIn: 'root'
})
export class ExcelService {

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

  constructor() { }

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
        let minIntegerDigits, minFractionDigits, maxFractionDigits: number;
        let format: string = "";

        minIntegerDigits = 1;
        minFractionDigits = 0;
        maxFractionDigits = 2;

        // get the digits from the column format if available
        if (tableColumnFormat.format)
        {
          let digits: number[] = tableColumnFormat.format.match (/\d+/g).map (Number);

          if (tableColumnFormat.format.startsWith ("."))
          {
            if (digits[0])
              minFractionDigits = digits[0];

            if (digits[1])
              maxFractionDigits = digits[1];
          }
          else
          {
            if (digits[0])
              minIntegerDigits = digits[0];

            if (digits[1])
              minFractionDigits = digits[1];

            if (digits[2])
              maxFractionDigits = digits[2];
          }
        }

        if (tableColumnFormat.prefix)
          format += "\"" + tableColumnFormat.prefix + "\"";

        if (minIntegerDigits >= 4)
        {
          while (minIntegerDigits)
          {
            format += "0";
            minIntegerDigits--;

            if (minIntegerDigits && !(minIntegerDigits % 3))
              format += ",";
          }
        }
        else if (minIntegerDigits == 3) // Default number formats if the minimum number of integer digits is less than 4
          format += "#,000";
        else if (minIntegerDigits == 2)
          format += "#,#00";
        else
          format += "#,##0";

        if (minFractionDigits || maxFractionDigits)
        {
          format += ".";

          maxFractionDigits -= minFractionDigits;
          if (maxFractionDigits < 0)
            maxFractionDigits = 0;

          while (minFractionDigits)
          {
            format += "0";
            minFractionDigits--;
          }

          while (maxFractionDigits)
          {
            format += "#";
            maxFractionDigits--;
          }
        }

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
      else if (tableColumnFormat.type === "time")
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