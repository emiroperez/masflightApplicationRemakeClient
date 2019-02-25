// Object used to mantain data values for each dashboard column
export class MsfDashboardColumnValues {
    displayProperties: boolean;

    height: number;
    width: number[] = [0, 0, 0];

    constructor(height: number, width1: number, width2: number, width3: number)
    {
        this.displayProperties = false;

        this.height = height;
        this.width[0] = width1;
        this.width[1] = width2;
        this.width[2] = width3;
    }
}
