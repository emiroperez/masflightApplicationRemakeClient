import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator } from '@angular/material';

import { Globals } from '../globals/Globals';

@Component({
  selector: 'app-create-customer',
  templateUrl: './create-customer.component.html'
})
export class CreateCustomerComponent implements OnInit {
  innerHeight: number;
  innerWidth: number;
  lastSelectedCustomer: any;
  selectedCustomer: any;
  customers: MatTableDataSource<any> = new MatTableDataSource ([
    { name: "American Airlines", shortName: "AA", customerCode: 345, contactFullName: "Test", type: 2,
      contactEmail: "test@aspsols.com", status: "Active", country: 1, state: 2, city: "Barranquilla",
      address1: "Test test test", address2: "Test test test", zipCode: 33224, billiingType: "PayPal",
      licenseType: "Standard", startDate: "27-05-2019", endDate: "22-08-2019", paymentType: "PayPal", numberOfLicenses: 3,
      terms: "Test of many test" },
      { name: "American Airlines", shortName: "AA", customerCode: 345, contactFullName: "Test", type: 2,
      contactEmail: "test@aspsols.com", status: "Active", country: 1, state: 2, city: "Barranquilla",
      address1: "Test test test", address2: "Test test test", zipCode: 33224, billiingType: "PayPal",
      licenseType: "Standard", startDate: "27-05-2019", endDate: "22-08-2019", paymentType: "PayPal", numberOfLicenses: 3,
      terms: "Test of many test" },
      { name: "American Airlines", shortName: "AA", customerCode: 345, contactFullName: "Test", type: 2,
      contactEmail: "test@aspsols.com", status: "Active", country: 1, state: 2, city: "Barranquilla",
      address1: "Test test test", address2: "Test test test", zipCode: 33224, billiingType: "PayPal",
      licenseType: "Standard", startDate: "27-05-2019", endDate: "22-08-2019", paymentType: "PayPal", numberOfLicenses: 3,
      terms: "Test of many test" },
      { name: "American Airlines", shortName: "AA", customerCode: 345, contactFullName: "Test", type: 2,
      contactEmail: "test@aspsols.com", status: "Active", country: 1, state: 2, city: "Barranquilla",
      address1: "Test test test", address2: "Test test test", zipCode: 33224, billiingType: "PayPal",
      licenseType: "Standard", startDate: "27-05-2019", endDate: "22-08-2019", paymentType: "PayPal", numberOfLicenses: 3,
      terms: "Test of many test" },
      { name: "American Airlines", shortName: "AA", customerCode: 345, contactFullName: "Test", type: 2,
      contactEmail: "test@aspsols.com", status: "Active", country: 1, state: 2, city: "Barranquilla",
      address1: "Test test test", address2: "Test test test", zipCode: 33224, billiingType: "PayPal",
      licenseType: "Standard", startDate: "27-05-2019", endDate: "22-08-2019", paymentType: "PayPal", numberOfLicenses: 3,
      terms: "Test of many test" },
      { name: "American Airlines", shortName: "AA", customerCode: 345, contactFullName: "Test", type: 2,
      contactEmail: "test@aspsols.com", status: "Active", country: 1, state: 2, city: "Barranquilla",
      address1: "Test test test", address2: "Test test test", zipCode: 33224, billiingType: "PayPal",
      licenseType: "Standard", startDate: "27-05-2019", endDate: "22-08-2019", paymentType: "PayPal", numberOfLicenses: 3,
      terms: "Test of many test" },
      { name: "American Airlines", shortName: "AA", customerCode: 345, contactFullName: "Test", type: 2,
      contactEmail: "test@aspsols.com", status: "Active", country: 1, state: 2, city: "Barranquilla",
      address1: "Test test test", address2: "Test test test", zipCode: 33224, billiingType: "PayPal",
      licenseType: "Standard", startDate: "27-05-2019", endDate: "22-08-2019", paymentType: "PayPal", numberOfLicenses: 3,
      terms: "Test of many test" },
      { name: "American Airlines", shortName: "AA", customerCode: 345, contactFullName: "Test", type: 2,
      contactEmail: "test@aspsols.com", status: "Active", country: 1, state: 2, city: "Barranquilla",
      address1: "Test test test", address2: "Test test test", zipCode: 33224, billiingType: "PayPal",
      licenseType: "Standard", startDate: "27-05-2019", endDate: "22-08-2019", paymentType: "PayPal", numberOfLicenses: 3,
      terms: "Test of many test" },
      { name: "American Airlines", shortName: "AA", customerCode: 345, contactFullName: "Test", type: 2,
      contactEmail: "test@aspsols.com", status: "Active", country: 1, state: 2, city: "Barranquilla",
      address1: "Test test test", address2: "Test test test", zipCode: 33224, billiingType: "PayPal",
      licenseType: "Standard", startDate: "27-05-2019", endDate: "22-08-2019", paymentType: "PayPal", numberOfLicenses: 3,
      terms: "Test of many test" },
      { name: "American Airlines", shortName: "AA", customerCode: 345, contactFullName: "Test", type: 2,
      contactEmail: "test@aspsols.com", status: "Active", country: 1, state: 2, city: "Barranquilla",
      address1: "Test test test", address2: "Test test test", zipCode: 33224, billiingType: "PayPal",
      licenseType: "Standard", startDate: "27-05-2019", endDate: "22-08-2019", paymentType: "PayPal", numberOfLicenses: 3,
      terms: "Test of many test" },
      { name: "American Airlines", shortName: "AA", customerCode: 345, contactFullName: "Test", type: 2,
      contactEmail: "test@aspsols.com", status: "Active", country: 1, state: 2, city: "Barranquilla",
      address1: "Test test test", address2: "Test test test", zipCode: 33224, billiingType: "PayPal",
      licenseType: "Standard", startDate: "27-05-2019", endDate: "22-08-2019", paymentType: "PayPal", numberOfLicenses: 3,
      terms: "Test of many test" }
  ]);
  customerColumns: string[] = ['name', 'shortName', 'licenseType', 'status', 'endDate', 'numberOfLicenses'];

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  constructor(public globals: Globals)
  { }

  ngOnInit()
  {
    this.innerHeight = window.innerHeight;
    this.innerWidth = window.innerWidth;
    this.customers.paginator = this.paginator;
  }

  applyFilter(filterValue: string)
  {
    this.customers.filter = filterValue.trim ().toLowerCase ();
  }

  createCustomer(): void
  {

  }

  saveCustomers(): void
  {

  }

  getTableHeight(): string
  {
    return "calc(" + this.innerHeight + "px - 263px)";
  }

  selectCustomer(row): void
  {
    this.selectedCustomer = row;
    row.highlight = true;

    if (this.lastSelectedCustomer)
      this.lastSelectedCustomer.highlight = false;

    this.lastSelectedCustomer = row;
  }

  @HostListener('window:resize', ['$event'])
  checkScreen(event): void
  {
    this.innerHeight = event.target.innerHeight;
    this.innerWidth = event.target.innerWidth;

    // if(!this.mobileQuery.matches)
    // {
    if (event.target.innerHeight == window.screen.height && event.target.innerWidth == window.screen.width)
      this.globals.isFullscreen = true;
    else
      this.globals.isFullscreen = false;
    // }
    // else{
    //   this.globals.isFullscreen = false;
    // }
  }

  getInnerHeight(): number
  {
    return this.innerHeight;
  }

  getInnerWidth(): number
  {
    return this.innerWidth;
  }
}
