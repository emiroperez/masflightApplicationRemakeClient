import {Arguments} from './Arguments';

export class CategoryArguments{
    id: string;
    label: string;
    parentId: string;
    icon: string;
    arguments: Arguments[];

    constructor(private labelIn:string, private iconIn: string,private argumentsIn: Arguments[]){
        this.label = labelIn;
        this.icon = iconIn;
        this.arguments = argumentsIn;
    }
}