import { ReplaySubject, Subject } from 'rxjs';

export class DatalakeQuerySchema
{
    schemaName: string;
    open: boolean;
    filter: string;
    filteredTables: ReplaySubject<any[]>;
    _onDestroy: Subject<void>;
    tables: any[];

    constructor (schemaName: string)
    {
        this.schemaName = schemaName;
        this.open = false;
        this.filter = "";
        this.filteredTables = new ReplaySubject<any[]> (1);
        this._onDestroy = new Subject<void> ();
        this.tables = [];
    }
};