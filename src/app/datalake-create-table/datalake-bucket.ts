export class DatalakeBucket
{
    bucketName: string;
    schemaName: string;

    constructor (bucketName: string, schemaName: string)
    {
        this.bucketName = bucketName;
        this.schemaName = schemaName;
    }
}