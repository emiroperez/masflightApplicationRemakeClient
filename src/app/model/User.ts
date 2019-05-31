import { Payment } from "./Payment";
import { State } from "./State";
import { Country } from "./Country";
import { UserPlan } from "./UserPlan";
import { Customer } from './Customer';

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
    country: Country;
    CState: State;
    postalCode: string;
    phoneNumber: string;
    payment: Payment;
    userPlan: UserPlan;
    admin: boolean;
    customer: Customer;

    constructor(private paymentIn: Payment){
        this.payment = paymentIn;
        this.name = "";
        this.lastname = "";
        this.password = "";
        this.repeatPassword = "";
        this.email = "";
        this.address = "";
        this.postalCode = "";
        this.phoneNumber = "";
    }

}
