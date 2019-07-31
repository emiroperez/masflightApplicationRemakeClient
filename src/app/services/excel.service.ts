import { Injectable } from '@angular/core';

import * as XLSX from 'xlsx';

@Injectable({
    providedIn: 'root'
})
export class ExcelService {

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
        else // Default number format if the minimum number of integer digits is less than 4
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
      else if (tableColumnFormat.type === "date" || tableColumnFormat.type === "time")
        this.SheetSetColumnFormat (ws, tableColumnFormat.pos, tableColumnFormat.format.toLowerCase (), "d");

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