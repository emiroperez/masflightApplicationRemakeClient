import { Arguments } from './Arguments';

export class CategoryArguments
{
    id: string;
    label: string;
    parentId: string;
    icon: string;
    arguments: Arguments[];
    description: string;
    taxiTimesCheckbox: Arguments;

    constructor(private labelIn: string, private iconIn: string, private argumentsIn: Arguments[], private descriptionIn: string)
    {
        this.label = labelIn;
        this.icon = iconIn;
        this.description = descriptionIn;
        this.arguments = argumentsIn;
    }
}
