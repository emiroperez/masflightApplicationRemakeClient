import { User } from "./User"
import { Plan } from "./Plan"
import { PlanPrice } from "./PlanPrice"
import { Payment } from "./Payment"

export class UserPlan{
    "id": string;
    "IdUser": User;    
    "IdPlan":Plan;
    "IdFare":PlanPrice;
    "planPayment": Payment;
}