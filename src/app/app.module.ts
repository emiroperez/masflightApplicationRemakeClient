import { BrowserModule } from '@angular/platform-browser';
import { NgModule} from '@angular/core';
import { AppComponent } from './app.component';
import { LoginScreenComponent } from './login-screen/login-screen.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { AppRoutingModule } from './routing/app.routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import {MaterialModule} from './material/material';
import { MessageComponent } from './message/message.component';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AuthService} from './services/auth.service';
import {HttpClientModule} from '@angular/common/http';
import { NotificationComponent } from './notification/notification.component';
import { ApiClient } from './api/api-client';
import { RegisterComponent } from './register/register.component';
import {NgxMaskModule} from 'ngx-mask'
import { NgSelectModule } from '@ng-select/ng-select';
import { MenuComponent } from './menu/menu.component';
import { MenuOptionComponent } from './menu-option/menu-option.component';
import { ApplicationComponent } from './application/application.component';
import { MsfComponentComponent } from './msf-component/msf-component.component';
import {Globals} from './globals/Globals';
import { MsfAirportComponent } from './msf-airport/msf-airport.component';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { MatFormFieldModule, MatSelectModule } from '@angular/material';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MsfContainerComponent } from './msf-container/msf-container.component';
import { MsfTableComponent } from './msf-table/msf-table.component';
import { IntroComponent } from './intro/intro.component';
import { CurrentQuerySummaryComponent } from './current-query-summary/current-query-summary.component';
import { MsfAirportRouteComponent } from './msf-airport-route/msf-airport-route.component';
import { MsfTimeRangeComponent } from './msf-time-range/msf-time-range.component';
import { MsfDateRangeComponent } from './msf-date-range/msf-date-range.component';
import { MsfCeilingComponent } from './msf-ceiling/msf-ceiling.component';
import { MsfWindComponent } from './msf-wind/msf-wind.component';
import { MsfWindDirectionComponent } from './msf-wind-direction/msf-wind-direction.component';
import { MsfTemperatureComponent } from './msf-temperature/msf-temperature.component';
import { MsfTabSelectorComponent } from './msf-tab-selector/msf-tab-selector.component';
import { DateFormatPipe } from './commons/DateFormatPipe ';
import { DateTimeFormatPipe } from './commons/DateTimeFormatPipe';
import { MsfAirlineComponent } from './msf-airline/msf-airline.component';
import { AmChartsModule } from '@amcharts/amcharts3-angular';
import { MsfChartOnTimeDelayComponent } from './msf-chart-on-time-delay/msf-chart-on-time-delay.component';
import { MsfDynamicTableVariablesComponent } from './msf-dynamic-table-variables/msf-dynamic-table-variables.component';
import { MsfDynamicTableComponent } from './msf-dynamic-table/msf-dynamic-table.component';
import { MsfTailNumberComponent } from './msf-tail-number/msf-tail-number.component';
import { MsfAircraftTypeComponent } from './msf-aircraft-type/msf-aircraft-type.component';
import { jqxGridComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxgrid';
import { jqxTreeGridComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxtreegrid';
import { jqxBarGaugeComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxbargauge';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { MsfMapComponent } from './msf-map/msf-map.component';
//import { AgmCoreModule } from '@agm/core';
//import { AgmDirectionModule } from 'agm-direction'
//import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { MsfSingleAirlineComponent } from './msf-single-airline/msf-single-airline.component';
import { MsfFlightNumberComponent } from './msf-flight-number/msf-flight-number.component';
import { MsfLoadingComponent } from './msf-loading/msf-loading.component';
import { MsfGroupingComponent } from './msf-grouping/msf-grouping.component';
import { MsfRoundingComponent } from './msf-rounding/msf-rounding.component';
import { MsfDateComponent } from './msf-date/msf-date.component';
import { MsfUsageStatisticsComponent } from './msf-usage-statistics/msf-usage-statistics.component';
import { MsfCancelledComponent } from './msf-cancelled/msf-cancelled.component';
import { MapBoxComponent } from './map-box/map-box.component';
import { AdminMenuComponent } from './admin-menu/admin-menu.component';
import { CreateMempershipsComponent } from './create-memperships/create-memperships.component';
import {MatSnackBarModule} from '@angular/material';
import { CategoryArgumentsComponent } from './category-arguments/category-arguments.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material';
import { AdminMenuRecursiveComponent } from './admin-menu-recursive/admin-menu-recursive.component';
import { AdminMenuMembershipsComponent } from './admin-menu-memberships/admin-menu-memberships.component';
import { AgGridModule } from 'ag-grid-angular';
import { Utils } from './commons/utils';
import { MsfUserListComponent } from './msf-user-list/msf-user-list.component';
import { MsfOptionListComponent } from './msf-option-list/msf-option-list.component';
import { ConfirmDeleteDialog } from './admin-menu/admin-menu.component';
import { EditOutputOptionsMetaDialog } from './admin-menu/admin-menu.component';
import { EditCategoryArgumentDialog } from './admin-menu/admin-menu.component';
import { EditOptionsDialog } from './create-memperships/create-memperships.component';
import { MsfTestComponent } from './msf-test/msf-test.component';
import { MsfFreeTextInputComponent } from './msf-free-text-input/msf-free-text-input.component';
import { MsfSelectBoxSingleOptionComponent } from './msf-select-box-single-option/msf-select-box-single-option.component';
import { MsfSelectBoxMultipleOptionComponent } from './msf-select-box-multiple-option/msf-select-box-multiple-option.component';
import { MsfDatePickerComponent } from './msf-date-picker/msf-date-picker.component';
import { MsfTimePickerComponent } from './msf-time-picker/msf-time-picker.component';
import { MsfDateTimePickerComponent } from './msf-date-time-picker/msf-date-time-picker.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { MsfCheckBoxComponent } from './msf-check-box/msf-check-box.component';
import { MsfCancelsCheckboxComponent } from './msf-cancels-checkbox/msf-cancels-checkbox.component';
import { MsfDiversionsCheckboxComponent } from './msf-diversions-checkbox/msf-diversions-checkbox.component';
import { MsfFlightDelaysCheckboxesComponent } from './msf-flight-delays-checkboxes/msf-flight-delays-checkboxes.component';
import { MsfCausesFlightDelaysCheckboxesComponent } from './msf-causes-flight-delays-checkboxes/msf-causes-flight-delays-checkboxes.component';
import { MsfTaxiTimesComponent } from './msf-taxi-times/msf-taxi-times.component';
import { MsfTaxiTimesCheckboxComponent } from './msf-taxi-times-checkbox/msf-taxi-times-checkbox.component';
import { MsfTaxiTimesCheckboxesComponent } from './msf-taxi-times-checkboxes/msf-taxi-times-checkboxes.component';
import { MsfDatePeriodComponent } from './msf-date-period/msf-date-period.component';
import { MsfRegionComponent } from './msf-region/msf-region.component';
import { MsfDatePeriodYearComponent } from './msf-date-period-year/msf-date-period-year.component';
import { MsfDatePeriodYearMonthComponent } from './msf-date-period-year-month/msf-date-period-year-month.component';
import { OptionWelcomeComponent } from './option-welcome/option-welcome.component';
import { MsfSortingComponent } from './msf-sorting/msf-sorting.component';
import { MsfSortingCheckboxesComponent } from './msf-sorting-checkboxes/msf-sorting-checkboxes.component';
import { MsfSortingByAirportComponent } from './msf-sorting-by-airport/msf-sorting-by-airport.component';
import { MsfGroupingAthenaComponent } from './msf-grouping-athena/msf-grouping-athena.component';
import { MsfFlightDistanceComponent } from './msf-flight-distance/msf-flight-distance.component';
import { MsfFareTypesComponent } from './msf-fare-types/msf-fare-types.component';
import { MsfSummaryComponent } from './msf-summary/msf-summary.component';
import { MsfServiceClassesComponent } from './msf-service-classes/msf-service-classes.component';
import { MsfResultsLessComponent } from './msf-results-less/msf-results-less.component';
import { MsfExcludeFollowingCheckboxComponent } from './msf-exclude-following-checkbox/msf-exclude-following-checkbox.component';
import { MsfExcludeFaresLowerComponent } from './msf-exclude-fares-lower/msf-exclude-fares-lower.component';
import { MsfGeographyComponent } from './msf-geography/msf-geography.component';
import { MsfSingleCheckboxComponent } from './msf-single-checkbox/msf-single-checkbox.component';
import { MsfExcludeItinerariesCheckboxComponent } from './msf-exclude-itineraries-checkbox/msf-exclude-itineraries-checkbox.component';
import { MsfFilterAirlineTypeComponent } from './msf-filter-airline-type/msf-filter-airline-type.component';
import { MsfFareIncrementsComponent } from './msf-fare-increments/msf-fare-increments.component';
import { MsfFareIncrementMiddleComponent } from './msf-fare-increment-middle/msf-fare-increment-middle.component';
import { MsfFareIncrementMaxComponent } from './msf-fare-increment-max/msf-fare-increment-max.component';
import { MsfArgumentTitleComponent } from './msf-argument-title/msf-argument-title.component';
import { MsfAirportsRoutesComponent } from './msf-airports-routes/msf-airports-routes.component';
import { MsfPercentIncrementComponent } from './msf-percent-increment/msf-percent-increment.component';
import { MsfGroupingDailyStaticsComponent } from './msf-grouping-daily-statics/msf-grouping-daily-statics.component';
import { MsfQuarterHourComponent } from './msf-quarter-hour/msf-quarter-hour.component';
import { MsfFunctionsComponent } from './msf-functions/msf-functions.component';
import { MsfDashboardComponent } from './msf-dashboard/msf-dashboard.component';
import { MsfDashboardPanelComponent } from './msf-dashboard-panel/msf-dashboard-panel.component';
import { MsfGroupingOperationsSummaryComponent } from './msf-grouping-operations-summary/msf-grouping-operations-summary.component';
import { MsfGroupingHubSummariesComponent } from './msf-grouping-hub-summaries/msf-grouping-hub-summaries.component';
import { MsfRegionScheduleComponent } from './msf-region-schedule/msf-region-schedule.component';
import { MsfAircraftTypeCheckboxesComponent } from './msf-aircraft-type-checkboxes/msf-aircraft-type-checkboxes.component';
import { MsfSeatsComponent } from './msf-seats/msf-seats.component';
import { MsfSortingNonstopCapacityComponent } from './msf-sorting-nonstop-capacity/msf-sorting-nonstop-capacity.component';
import { MsfSortingConnectionBuilderComponent } from './msf-sorting-connection-builder/msf-sorting-connection-builder.component';
import { MsfConnectonTimeComponent } from './msf-connecton-time/msf-connecton-time.component';
import { MsfStopsComponent } from './msf-stops/msf-stops.component';
import { MsfCircuityTypeComponent } from './msf-circuity-type/msf-circuity-type.component';
import { MsfCircuityComponent } from './msf-circuity/msf-circuity.component';
import { MsfSingleAirportComponent } from './msf-single-airport/msf-single-airport.component';
import { MsfDashboardControlVariablesComponent } from './msf-dashboard-control-variables/msf-dashboard-control-variables.component';
import { MsfSummaryRevenueBuildsComponent } from './msf-summary-revenue-builds/msf-summary-revenue-builds.component';
import { MsfDatePeriodRevenueComponent } from './msf-date-period-revenue/msf-date-period-revenue.component';
import { UserActivationComponent } from './user-activation/user-activation.component';
import { MsfFareIncrementsMarketHistogramsComponent } from './msf-fare-increments-market-histograms/msf-fare-increments-market-histograms.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { MsfConfirmationDialogComponent } from './msf-confirmation-dialog/msf-confirmation-dialog.component';
import { MsfSchedulePanelComponent } from './msf-schedule-panel/msf-schedule-panel.component';
import { MsfScheduleMapsComponent } from './msf-schedule-maps/msf-schedule-maps.component';
import { MsfSchedulePanelInfoComponent } from './msf-schedule-panel-info/msf-schedule-panel-info.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MsfTopNumberComponent } from './msf-top-number/msf-top-number.component';
import { MsfSeatClassComponent } from './msf-seat-class/msf-seat-class.component';
import { MsfControlVariablesComponent } from './msf-control-variables/msf-control-variables.component';
import { MsfDashboardInfoFunctionsComponent } from './msf-dashboard-info-functions/msf-dashboard-info-functions.component';
import { MsfGroupingMariadbComponent } from './msf-grouping-mariadb/msf-grouping-mariadb.component';
import { MsfContentTypeComponent } from './msf-content-type/msf-content-type.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { MsfDashboardColorPickerComponent } from './msf-dashboard-color-picker/msf-dashboard-color-picker.component';
import { MsfEditDashboardComponent } from './msf-edit-dashboard/msf-edit-dashboard.component';
import { MsfAddDashboardComponent } from './msf-add-dashboard/msf-add-dashboard.component';
import { MsfDashboardDrillDownComponent } from './msf-dashboard-drill-down/msf-dashboard-drill-down.component';
import { MsfDashboardChildPanelComponent } from './msf-dashboard-child-panel/msf-dashboard-child-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginScreenComponent,
    WelcomeComponent,
    MessageComponent,
    NotificationComponent,
    MenuOptionComponent,
    RegisterComponent,
    MenuComponent,
    MenuOptionComponent,
    ApplicationComponent,
    MenuComponent,
    MsfComponentComponent,
    MsfAirportComponent,
    MsfContainerComponent,
    MsfTableComponent,
    IntroComponent,
    CurrentQuerySummaryComponent,
    MsfAirportRouteComponent,
    MsfTimeRangeComponent,
    MsfDateRangeComponent,
    MsfCeilingComponent,
    MsfWindComponent,
    MsfWindDirectionComponent,
    MsfTemperatureComponent,
    MsfTabSelectorComponent,
    DateFormatPipe,
    DateTimeFormatPipe,
    MsfAirlineComponent,
    MsfChartOnTimeDelayComponent,
    MsfDynamicTableVariablesComponent,
    MsfDynamicTableComponent,
    MsfTailNumberComponent,
    MsfAircraftTypeComponent,
    jqxBarGaugeComponent,
    jqxGridComponent,
    jqxTreeGridComponent,
    MsfMapComponent,
    MsfSingleAirlineComponent,
    MsfFlightNumberComponent,
    MsfLoadingComponent,
    MsfGroupingComponent,
    MsfRoundingComponent,
    MsfDateComponent,
    MsfUsageStatisticsComponent,
    AdminMenuComponent,
    CreateMempershipsComponent,
    MsfCancelledComponent,
    MapBoxComponent,
    AdminMenuComponent,
    AdminMenuComponent,
    CategoryArgumentsComponent,
    AdminMenuRecursiveComponent,
    AdminMenuMembershipsComponent,
    MsfUserListComponent,
    MsfOptionListComponent,
    ConfirmDeleteDialog,
    EditOutputOptionsMetaDialog,
    EditCategoryArgumentDialog,
    EditOptionsDialog,
    MsfTestComponent,
    MsfFreeTextInputComponent,
    MsfSelectBoxSingleOptionComponent,
    MsfSelectBoxMultipleOptionComponent,
    MsfDatePickerComponent,
    MsfTimePickerComponent,
    MsfDateTimePickerComponent,
    MsfCheckBoxComponent,
    MsfCancelsCheckboxComponent,
    MsfDiversionsCheckboxComponent,
    MsfFlightDelaysCheckboxesComponent,
    MsfCausesFlightDelaysCheckboxesComponent,
    MsfTaxiTimesComponent,
    MsfTaxiTimesCheckboxComponent,
    MsfTaxiTimesCheckboxesComponent,
    MsfDatePeriodComponent,
    MsfRegionComponent,
    MsfDatePeriodYearComponent,
    MsfDatePeriodYearMonthComponent,
    OptionWelcomeComponent,
    MsfSortingComponent,
    MsfSortingCheckboxesComponent,
    MsfSortingByAirportComponent,
    MsfGroupingAthenaComponent,
    MsfFlightDistanceComponent,
    MsfFareTypesComponent,
    MsfSummaryComponent,
    MsfServiceClassesComponent,
    MsfResultsLessComponent,
    MsfExcludeFollowingCheckboxComponent,
    MsfExcludeFaresLowerComponent,
    MsfGeographyComponent,
    MsfSingleCheckboxComponent,
    MsfExcludeItinerariesCheckboxComponent,
    MsfFilterAirlineTypeComponent,
    MsfFareIncrementsComponent,
    MsfFareIncrementMiddleComponent,
    MsfFareIncrementMaxComponent,
    MsfArgumentTitleComponent,
    MsfAirportsRoutesComponent,
    MsfPercentIncrementComponent,
    MsfGroupingDailyStaticsComponent,
    MsfQuarterHourComponent,
    MsfFunctionsComponent,
    MsfDashboardComponent,
    MsfDashboardPanelComponent,
    MsfGroupingOperationsSummaryComponent,
    MsfGroupingHubSummariesComponent,
    MsfRegionScheduleComponent,
    MsfAircraftTypeCheckboxesComponent,
    MsfSeatsComponent,
    MsfSortingNonstopCapacityComponent,
    MsfSortingConnectionBuilderComponent,
    MsfConnectonTimeComponent,
    MsfStopsComponent,
    MsfCircuityTypeComponent,
    MsfCircuityComponent,
    MsfSingleAirportComponent,
    MsfDashboardControlVariablesComponent,
    MsfSummaryRevenueBuildsComponent,
    MsfDatePeriodRevenueComponent,
    UserActivationComponent,
    MsfFareIncrementsMarketHistogramsComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    MsfConfirmationDialogComponent,
    MsfSchedulePanelComponent,
    MsfScheduleMapsComponent,
    MsfSchedulePanelInfoComponent,
    MsfTopNumberComponent,
    MsfSeatClassComponent,
    MsfControlVariablesComponent,
    MsfDashboardInfoFunctionsComponent,
    MsfGroupingMariadbComponent,
    MsfContentTypeComponent,
    MsfDashboardColorPickerComponent,
    MsfEditDashboardComponent,
    MsfAddDashboardComponent,
    MsfDashboardDrillDownComponent,
    MsfDashboardChildPanelComponent
  ],
  imports: [
    BrowserModule,
    DragDropModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    LayoutModule,
    MaterialModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
    NgSelectModule,
    NgxMaterialTimepickerModule.forRoot(),
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatFormFieldModule,
    NgxMatSelectSearchModule,
    AmChartsModule,
//    AgmCoreModule.forRoot({
      // apiKey: 'AIzaSyArd7Sqcy7bB0ucBKhm2ik4r2xZPG9wPtU'
    // }),
    // AgmDirectionModule,
    // AgmSnazzyInfoWindowModule,
    NgxMapboxGLModule.withConfig({
      accessToken: 'pk.eyJ1IjoiYXNwc29sdXRpb25zIiwiYSI6ImNqbm5uNGhscTI4N28za3FybnJ0OWF6NmEifQ.pDzlIgQjVkVszvxF2UoXvA',
      geocoderAccessToken: 'pk.eyJ1IjoiYXNwc29sdXRpb25zIiwiYSI6ImNqbm5uNGhscTI4N28za3FybnJ0OWF6NmEifQ.pDzlIgQjVkVszvxF2UoXvA'
    }),
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    AgGridModule.withComponents(null),
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    ColorPickerModule
  ],
  providers: [
    AuthService,
    NotificationComponent,
    ApiClient,
    MenuOptionComponent,
    MenuComponent,
    MsfComponentComponent,
    Globals,
    MsfAirportComponent,
    MsfContainerComponent,
    MsfContainerComponent,
    DateFormatPipe,
    DateTimeFormatPipe,
    Utils
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    MessageComponent,
    MsfDynamicTableVariablesComponent,
    ConfirmDeleteDialog,
    EditOutputOptionsMetaDialog,
    EditCategoryArgumentDialog,
    EditOptionsDialog,
    MsfDashboardControlVariablesComponent,
    MsfConfirmationDialogComponent,
    MsfDashboardInfoFunctionsComponent,
    MsfDashboardColorPickerComponent,
    MsfEditDashboardComponent,
    MsfAddDashboardComponent,
    MsfDashboardDrillDownComponent,
    MsfDashboardChildPanelComponent
  ]
})
export class AppModule { }
