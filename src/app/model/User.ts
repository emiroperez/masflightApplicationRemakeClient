import { Payment } from "./Payment";
import { State } from "./State";
import { County } from "./Country";

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
    CState: State;
    postalCode: string;
    phoneNumber: string;
    payment: Payment;
    

    constructor(private paymentIn: Payment){
        this.payment = paymentIn;
    }
   
}