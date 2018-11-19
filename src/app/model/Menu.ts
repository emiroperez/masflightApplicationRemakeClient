import { Category } from "./Category";

export class Menu{
    categories: Category[];

    constructor(catgoriesIn:Category[]){
        this.categories = catgoriesIn;
    }
}