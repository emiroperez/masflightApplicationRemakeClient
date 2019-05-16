export class Payment{
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    paymentType:string;

    constructor(){
        this.cardNumber = "";
        this.expiryDate = "";
        this.cvv = "";
        this.paymentType = "";
    }
}