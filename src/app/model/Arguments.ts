export class Arguments{
    id: string;
    name1: string;
    value1: any;
    name2: String;
    value2: any;
    name3: String;
    value3: any;
    type: string;
    dataType: string;
    dataSubType:string;
    url: string;
    required: boolean;
    title:string;
    label1:string;
    label2:string;
    

    constructor(requiredIn: boolean,typeIn: string, name1In: string,name2In: string,name3In: String, urlIn: string){
        this.required = requiredIn;
        this.type = typeIn;
        this.name1 = name1In;
        this.name2 = name2In;
        this.name3 = name3In;
        this.url = urlIn;
    }
}