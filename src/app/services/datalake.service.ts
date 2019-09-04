import { Injectable } from '@angular/core';

import { ApiClient } from '../api/api-client';
import { Globals } from '../globals/Globals';

@Injectable({
    providedIn: 'root'
})
export class DatalakeService {
    host: string;

    constructor(private http: ApiClient, private globals: Globals) {
        this.host = this.globals.baseUrl;
    }

    getDatalakeTables(_this, handlerSuccess, handlerError): void {
        let url = this.host + "/GetDatalakeTables?token=!edhnOCfSX3m5QYnpxQO5h9IWUukcLNvDwb";
        this.http.get(_this, url, handlerSuccess, handlerError, null);
    }

    getDatalakeTableColumns(_this, schemaName, tableName, handlerSuccess, handlerError): void {
        let url = this.host + "/GetDatalakeTableColumns?token=!edhnOCfSX3m5QYnpxQO5h9IWUukcLNvDwb&schemaName=" + schemaName + "&tableName=" + tableName;
        this.http.get(_this, url, handlerSuccess, handlerError, null);
    }

    getDatalakeTableData(_this, schemaName, tableName, limit, handlerSuccess, handlerError): void {
        let url = this.host + "/GetDatalakeTableData?userName=erich&token=!edhnOCfSX3m5QYnpxQO5h9IWUukcLNvDwb&schemaName=" + schemaName + "&tableName=" + tableName + "&limit=" + limit;
        this.http.get(_this, url, handlerSuccess, handlerError, null);
    }

    getDatalakeSchemas(_this, handlerSuccess, handlerError): void {
        let url = this.host + "/GetSchemas";

        let request = {
            Schema: "",
            userName: "erich",
            Token: "!edhnOCfSX3m5QYnpxQO5h9IWUukcLNvDwb"
        };

        this.http.post(_this, url, request, handlerSuccess, handlerError);
    }

    getDatalakeBuckets(_this, handlerSuccess, handlerError): void {
        let url = this.host + "/GetDatalakeBuckets?token=!edhnOCfSX3m5QYnpxQO5h9IWUukcLNvDwb";
        this.http.get(_this, url, handlerSuccess, handlerError, null);
    }

    getDatalakeSchemaTables(_this, schemaName, handlerSuccess, handlerError): void {
        let url = this.host + "/GetSchemaTables";

        let request = {
            Schema: schemaName,
            userName: "erich",
            Token: "!edhnOCfSX3m5QYnpxQO5h9IWUukcLNvDwb"
        };

        this.http.post(_this, url, request, handlerSuccess, handlerError);
    }

    datalakeExecuteQuery(_this, schemaName, queryInput, handlerSuccess, handlerError): void {
        let url = this.host + "/executeQuery";

        let request = {
            Schema: schemaName,
            userName: "erich",
            Token: "!edhnOCfSX3m5QYnpxQO5h9IWUukcLNvDwb",
            Raw: queryInput
        };

        this.http.post(_this, url, request, handlerSuccess, handlerError);
    }
}