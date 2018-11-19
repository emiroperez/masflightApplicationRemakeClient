import { Payment } from "./Payment";
import { State } from "./State";
import { County } from "./Country";
import { Plan } from "./Plan"

export class User{
    id: string;
    code :string;
    username: string;
    name : string;
    lastname: string;
    password: string;
    repeatPassword: string;
    email: string;
    address: string;
    country: County;
    state: State;
    postalCode: string;
    phoneNumber: string;
    payment: Payment;
    priceSelected: string;
    plan: Plan;
    

    constructor(private paymentIn: Payment,private planIn:Plan){
        this.payment = paymentIn;
        this.plan = planIn;
    }
   
}