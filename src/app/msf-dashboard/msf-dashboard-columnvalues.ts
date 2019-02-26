// Object used to mantain data values for each dashboard column
export class MsfDashboardColumnValues {
    displayProperties: boolean;

    height: any;
    width: any[] = [{ value: 0 }, { value: 0 }, { value: 0 }];

    constructor(height: any, width1: any, width2: any, width3: any)
    {
        this.displayProperties = false;

        this.height = height;
        this.width[0] = width1;
        this.width[1] = width2;
        this.width[2] = width3;
    }
}
