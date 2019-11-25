import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';

@Injectable({
    providedIn: 'root'
})
export class DatalakeService {
    host: string;

    constructor(private http: ApiClient, private globals: Globals)
    {
        this.host = this.globals.baseUrl;
    }

    getDatalakeTables(_this, handlerSuccess, handlerError): void
    {
        // let url = this.host + "/GetDatalakeTables?token="+this.globals.token; //kp21/11/2019 ing luis
        let url = this.host + "/GetDatalakeTables?user="+this.globals.userName;
        this.http.get(_this, url, handlerSuccess, handlerError, null);
    }

    getDatalakeTableColumns(_this, schemaName, tableName, handlerSuccess, handlerError): void
    {
        // let url = this.host + "/GetDatalakeTableColumns?token="+this.globals.token +"&schemaName="+ schemaName + "&tableName=" + tableName;
        let url = this.host + "/GetDatalakeTableColumns?user="+this.globals.userName +"&schemaName="+ schemaName + "&tableName=" + tableName;
        this.http.get(_this, url, handlerSuccess, handlerError, null);
    }

    getDatalakeTableData(_this, schemaName, tableName, limit, handlerSuccess, handlerError): void
    {        
        // let url = this.host + "/GetDatalakeTableData?userName=erich&token="+this.globals.token+"&schemaName=" + schemaName + "&tableName=" + tableName + "&limit=" + limit;
        let url = this.host + "/GetDatalakeTableData?userName="+this.globals.userName+"&schemaName=" + schemaName + "&tableName=" + tableName + "&limit=" + limit;
        this.http.get(_this, url, handlerSuccess, handlerError, null);
    }

    getDatalakeSchemas(_this, handlerSuccess, handlerError): void
    {
        let url = this.host + "/GetSchemas";

        let request = {
            Schema: "",
            // userName: "erich",
            userName: this.globals.userName
            // Token: this.globals.token
        };

        this.http.post(_this, url, request, handlerSuccess, handlerError);
    }

    getDatalakeBuckets(_this, handlerSuccess, handlerError): void {
        // let url = this.host + "/GetDatalakeBuckets?token="+this.globals.token;
        let url = this.host + "/GetDatalakeBuckets?user="+this.globals.userName;
        this.http.get(_this, url, handlerSuccess, handlerError, null);
    }

    getDatalakeSchemaTables(_this, schemaName, handlerSuccess, handlerError): void
    {
        let url = this.host + "/GetSchemaTables";

        let request = {
            Schema: schemaName,
            // userName: "erich",
            userName: this.globals.userName
            // Token: this.globals.token
        };
        this.http.post(_this, url, request, handlerSuccess, handlerError);
    }

    datalakeExecuteQuery(_this, schemaName, queryInput, handlerSuccess, handlerError): void
    {
        let url = this.host + "/executeQuery";

        let request = {
            Schema: schemaName,
            userName: this.globals.userName,
            // userName: "erich",
            // Token: this.globals.token,
            Raw: queryInput
        };

        this.http.post(_this, url, request, handlerSuccess, handlerError);
    }

    createDatalakeTable(_this, request, handlerSuccess, handlerError): void
    {
        let url = this.host + "/createDatalakeTable";

        // request.username = "erich";
        request.username = this.globals.userName
        // request.token = this.globals.token;
        this.http.post (_this, url, request, handlerSuccess, handlerError);
    }

    getDatalakeAlarms(_this, handlerSuccess, handlerError): void
    {
        // let url = this.host + "/GetDatalakeAlarms?token="+this.globals.token;
        let url = this.host + "/GetDatalakeAlarms?user="+this.globals.userName;
        this.http.get(_this, url, handlerSuccess, handlerError, null);
    }



    dataUploadDatalake(_this, request,file,handlerSuccess, handlerError): void
    {

        // request.username = "karen1";
        // request.token = "umKr1bdxByCYs2d1AimShhqYqMO5Kem!Btd";

        let url = this.host + "/dataUploadDatalake?bucket="+request.bucket
        +"&format="+request.format+"&s3FilePath="+request.s3FilePath
        +"&schemaName="+request.schemaName+"&separator="+request.separator
        // +"&tableName="+request.tableName+"&token="+this.globals.token
        +"&tableName="+request.tableName+"&user="+this.globals.userName
        ;
        this.http.post (_this, url,file, handlerSuccess, handlerError);
    }

    uploadDatalakeTableFile(_this, config, file, handlerSuccess, handlerError): void
    {
        let url = this.host + "/uploadDatalakeTableFile?separator=" + config.separator +
            // "&token="+this.globals.token + "&format=" + config.format + "&s3filepath=" +
            "&user="+this.globals.userName + "&format=" + config.format + "&s3filepath=" +
            config.s3filepath;

        this.http.post (_this, url, file, handlerSuccess, handlerError);
    }

    saveDatalakeAlarm(_this, request, handlerSuccess, handlerError): void
    {
        let url = this.host + "/saveDatalakeAlarm";
        request.username = this.globals.userName;
        // request.token = this.globals.token ;
        this.http.post (_this, url, request, handlerSuccess, handlerError);
    }

    getDatalakePartitions(_this, handlerSuccess, handlerError): void
    {
        let url = this.host + "/GetDatalakePartitions?user="+this.globals.userName;
        this.http.get(_this, url, handlerSuccess, handlerError, null);
    }

    saveDatalakePartition(_this, request, handlerSuccess, handlerError): void
    {
        let url = this.host + "/saveDatalakePartition";
        // request.token = this.globals.token;
        request.user = this.globals.userName;
        this.http.put(_this, url, request, handlerSuccess, handlerError);
    }

    updateDatalakePartition(_this, request, handlerSuccess, handlerError): void
    {
        let url = this.host + "/updateDatalakePartition";
        // request.token = this.globals.token;
        request.userName = this.globals.userName;
        this.http.post(_this, url, request, handlerSuccess, handlerError);
    }

    deleteDatalakePartition(_this, request, handlerSuccess, handlerError): void
    {
        // request.token = this.globals.token;        
        request.userName = this.globals.userName;
        let url = this.host + "/deleteDatalakePartition?request="+JSON.stringify(request);
        this.http.delete(_this, url, handlerSuccess, handlerError, null);
    }

    getDatalakePartitionLogs(_this, handlerSuccess, handlerError): void
    {
        let url = this.host + "/getDatalakePartitionLogs?user="+this.globals.userName;
        this.http.get(_this, url, handlerSuccess, handlerError, null);
    }

    getDatalakeLoadPartition(_this,request, handlerSuccess, handlerError): void
    {
        request.user = this.globals.userName;
        let url = this.host + "/getDatalakeLoadPartition?request="+JSON.stringify(request);
        this.http.get(_this, url, handlerSuccess, handlerError, null);
    }
    
    datalakeHistoryQuery(_this, request, handlerSuccess, handlerError): void
    {
        let url = this.host + "/getDatalakeSavedQuerys";
        // request.Token = this.globals.token;
        request.userName = this.globals.userName;
        this.http.post(_this, url, request, handlerSuccess, handlerError);
    }

    datalakeSaveQuery(_this, request, handlerSuccess, handlerError): void
    {
        let url = this.host + "/DatalakeSaveQuery";
        // request.Token = this.globals.token;
        request.userName = this.globals.userName;
        this.http.post(_this, url, request, handlerSuccess, handlerError);
    }
}