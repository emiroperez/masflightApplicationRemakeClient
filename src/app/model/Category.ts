import { Option } from "./Option";

export class Category{
    id: string;
    label: string;
    options: Option[];

    constructor(idIn: string, labelIn: string, optionsIn: Option[]){
        this.id = idIn;
        this.label = labelIn;
        this.options = optionsIn;
    }
}