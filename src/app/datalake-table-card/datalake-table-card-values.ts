// Object used to mantain data values for a datalake table card
export class DatalakeTableCardValues {
    tableName: string;
    descr: string;
    bucketName: string;
    schemaName: string;
    longName: string;

    constructor(tableName: string, descr: string, bucketName: string,
        schemaName: string, longName: string)
    {
        this.tableName = tableName;
        this.descr = descr;
        this.bucketName = bucketName;
        this.schemaName = schemaName;
        this.longName = longName;
    }
}
