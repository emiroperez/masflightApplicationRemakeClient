import { Tables } from './Tables';
import { List } from '@amcharts/amcharts4/core';

export class ConnectionQuery{
    "id":number;
    "host":string;
    "port":string;
    "username":string;
    "password":string
    "nameSchema":string;
    "db":number;
    "tables": List<Tables>

    constructor(){
        this.id=null;
        this.host='';
        this.port='';
        this.username='';
        this.password='';
        this.nameSchema='';
        this.db=1;
        this.tables=null;
    }
}
