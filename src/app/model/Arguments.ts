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
    required: number;
    title:string;
    label1:string;
    label2:string;
    label3:string;
    visibleAttribute:string;
    selectedAttribute:string;
    aaaGroup : string; //kp20190827
    targetGroup : string; //kp20190827
    minDate: Date;
    maxDate: Date;

    constructor(requiredIn: number,typeIn: string, name1In: string,name2In: string,
        name3In: String, urlIn: string , visibleAttributeIn:string, selectedAttributeIn:string){
        this.required = requiredIn;
        this.type = typeIn;
        this.name1 = name1In;
        this.name2 = name2In;
        this.name3 = name3In;
        this.url = urlIn;
        this.visibleAttribute = visibleAttributeIn;
        this.selectedAttribute = selectedAttributeIn;
    }
}