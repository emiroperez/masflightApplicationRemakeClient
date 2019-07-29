import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { AnimationStyleMetadata } from '@angular/animations';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

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
        let format = "";

        if (tableColumnFormat.prefix)
          format += "\"" + tableColumnFormat.prefix + "\"";

        format += "0.##";

        if (tableColumnFormat.suffix)
          format += "\"" + tableColumnFormat.suffix + "\"";

        this.SheetSetColumnFormat (ws, tableColumnFormat.pos, format, "n");
      }
      else if (tableColumnFormat.type === "date")
      {
        if (tableColumnFormat.format === "M0/0000")
          this.SheetSetColumnFormat (ws, tableColumnFormat.pos, "mm/yyyy", "d");
        else if (tableColumnFormat.format == "0000/M0")
          this.SheetSetColumnFormat (ws, tableColumnFormat.pos, "yyyy/mm", "d");
        else
          this.SheetSetColumnFormat (ws, tableColumnFormat.pos, "m/d/yy", "d");
      }
      else if (tableColumnFormat.type === "time")
        this.SheetSetColumnFormat (ws, tableColumnFormat.pos, "h:mm", "d");

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