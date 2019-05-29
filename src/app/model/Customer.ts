import { Country } from './Country';
import { State } from './State';
import { Plan } from './Plan';

export class Customer
{
    "id": number;
    "customerCode": number;
    "name": string;
    "shortName": string;
    "contactFullName": string;
    "type": number;
    "contactEmail": string;
    "status": number;
    "country": Country;
    "state": State;
    "city": string;
    "address1": string;
    "address2": string;
    "zipCode": number;
    "billingType": string;
    "licenseType": Plan;
    "startDate": Date;
    "endDate": Date;
    "paymentType": number;
    "numberOfLicenses": number;
    "terms": string;
    "highlight": boolean = false;
}