// Object used to mantain data values for a datalake table card
export class DatalakeTableCardValues {
    tableName: string;
    descr: string;
    bucketName: string;
    schemaName: string;
    longName: string;
    lastHDI: string;
    lastDDI: string;
    nRows: string;
    lastUpdate: string;
    mb: string;

    constructor(tableName: string, descr: string, bucketName: string,
        schemaName: string, longName: string,
        lastHDI: string, lastDDI: string,
        nRows: string, lastUpdate: string,mb: string)
    {
        this.tableName = tableName;
        this.descr = descr;
        this.bucketName = bucketName;
        this.schemaName = schemaName;
        this.longName = longName;
        this.lastHDI = lastHDI;
        this.lastDDI = lastDDI;
        this.nRows = nRows;
        this.lastUpdate = lastUpdate;
        this.mb = mb;
    }
}
