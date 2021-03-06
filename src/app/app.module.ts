import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { LoginScreenComponent } from './login-screen/login-screen.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { AppRoutingModule } from './routing/app.routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MaterialModule } from './material/material';
import { MessageComponent } from './message/message.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { NotificationComponent } from './notification/notification.component';
import { ApiClient } from './api/api-client';
import { RegisterComponent } from './register/register.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { MenuComponent } from './menu/menu.component';
import { MenuOptionComponent } from './menu-option/menu-option.component';
import { ApplicationComponent } from './application/application.component';
import { MsfComponentComponent } from './msf-component/msf-component.component';
import { Globals } from './globals/Globals';
import { MsfAirportComponent } from './msf-airport/msf-airport.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatFormFieldModule, MatSelectModule, MatChipsModule } from '@angular/material';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MsfContainerComponent } from './msf-container/msf-container.component';
import { MsfTableComponent } from './msf-table/msf-table.component';
import { IntroComponent } from './intro/intro.component';
import { CurrentQuerySummaryComponent } from './current-query-summary/current-query-summary.component';
import { MsfTimeRangeComponent } from './msf-time-range/msf-time-range.component';
import { MsfDateRangeComponent, MonthHeader, YearHeader } from './msf-date-range/msf-date-range.component';
import { MsfCeilingComponent } from './msf-ceiling/msf-ceiling.component';
import { MsfWindComponent } from './msf-wind/msf-wind.component';
import { MsfWindDirectionComponent } from './msf-wind-direction/msf-wind-direction.component';
import { MsfTemperatureComponent } from './msf-temperature/msf-temperature.component';
import { MsfTabSelectorComponent } from './msf-tab-selector/msf-tab-selector.component';
import { DateTimeFormatPipe } from './commons/DateTimeFormatPipe';
import { MsfAirlineComponent } from './msf-airline/msf-airline.component';
import { MsfDynamicTableVariablesComponent } from './msf-dynamic-table-variables/msf-dynamic-table-variables.component';
import { MsfDynamicTableComponent } from './msf-dynamic-table/msf-dynamic-table.component';
import { MsfAircraftTypeComponent } from './msf-aircraft-type/msf-aircraft-type.component';
import { jqxGridComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxgrid';
import { jqxTreeGridComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxtreegrid';
import { jqxBarGaugeComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxbargauge';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { MsfMapComponent } from './msf-map/msf-map.component';
//import { AgmCoreModule } from '@agm/core';
//import { AgmDirectionModule } from 'agm-direction'
//import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { MsfLoadingComponent } from './msf-loading/msf-loading.component';
import { MsfGroupingComponent } from './msf-grouping/msf-grouping.component';
import { MsfRoundingComponent } from './msf-rounding/msf-rounding.component';
import { AdminMenuComponent } from './admin-menu/admin-menu.component';
import { CreateMembershipsComponent } from './create-memberships/create-memberships.component';
import { MatSnackBarModule } from '@angular/material';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material';
import { AdminMenuMembershipsComponent } from './admin-menu-memberships/admin-menu-memberships.component';
import { Utils } from './commons/utils';
import { ConfirmDeleteDialog } from './admin-menu/admin-menu.component';
import { EditOutputOptionsMetaDialog } from './admin-menu/admin-menu.component';
import { EditCategoryArgumentDialog } from './admin-menu/admin-menu.component';
import { EditOptionsDialog } from './create-memberships/create-memberships.component';
import { MsfFreeTextInputComponent } from './msf-free-text-input/msf-free-text-input.component';
import { MsfSelectBoxSingleOptionComponent } from './msf-select-box-single-option/msf-select-box-single-option.component';
import { MsfSelectBoxMultipleOptionComponent } from './msf-select-box-multiple-option/msf-select-box-multiple-option.component';
import { MsfCancelsCheckboxComponent } from './msf-cancels-checkbox/msf-cancels-checkbox.component';
import { MsfDiversionsCheckboxComponent } from './msf-diversions-checkbox/msf-diversions-checkbox.component';
import { MsfFlightDelaysCheckboxesComponent } from './msf-flight-delays-checkboxes/msf-flight-delays-checkboxes.component';
import { MsfCausesFlightDelaysCheckboxesComponent } from './msf-causes-flight-delays-checkboxes/msf-causes-flight-delays-checkboxes.component';
import { MsfTaxiTimesComponent } from './msf-taxi-times/msf-taxi-times.component';
import { MsfTaxiTimesCheckboxComponent } from './msf-taxi-times-checkbox/msf-taxi-times-checkbox.component';
import { MsfTaxiTimesCheckboxesComponent } from './msf-taxi-times-checkboxes/msf-taxi-times-checkboxes.component';
import { MsfRegionComponent } from './msf-region/msf-region.component';
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
import { MsfSummaryRevenueBuildsComponent } from './msf-summary-revenue-builds/msf-summary-revenue-builds.component';
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
import { MsfEditDashboardComponent } from './msf-edit-dashboard/msf-edit-dashboard.component';
import { MsfAddDashboardComponent } from './msf-add-dashboard/msf-add-dashboard.component';
import { MsfDashboardDrillDownComponent } from './msf-dashboard-drill-down/msf-dashboard-drill-down.component';
import { MsfDashboardChildPanelComponent } from './msf-dashboard-child-panel/msf-dashboard-child-panel.component';
import { MsfTotalTypeComponent } from './msf-total-type/msf-total-type.component';
import { MsfGroupingCompGenreComponent } from './msf-grouping-comp-genre/msf-grouping-comp-genre.component';
import { MsfGroupingCompTotalComponent } from './msf-grouping-comp-total/msf-grouping-comp-total.component';
import { MsfMoreInfoPopupComponent } from './msf-more-info-popup/msf-more-info-popup.component';
import { MsfGroupingOpComponent } from './msf-grouping-op/msf-grouping-op.component';
import { MsfGroupingOp2Component } from './msf-grouping-op2/msf-grouping-op2.component';
import { MsfStatesComponent } from './msf-states/msf-states.component';
import { MsfFlightDurationSegmentsComponent } from './msf-flight-duration-segments/msf-flight-duration-segments.component';
import { MsfColumnSelectorComponent } from './msf-column-selector/msf-column-selector.component';
import { MsfShareDashboardComponent } from './msf-share-dashboard/msf-share-dashboard.component';
import { MsfSharedDashboardItemsComponent } from './msf-shared-dashboard-items/msf-shared-dashboard-items.component';
import { MsfAddSharedDashboardPanelComponent } from './msf-add-shared-dashboard-panel/msf-add-shared-dashboard-panel.component';
import { DrillDownDialog } from './admin-menu/admin-menu.component';
import { FilterPipe } from './admin-menu/pipe-filter';
import { FilterPipeArg } from './admin-arguments-category/pipe-filter';
import { MsfAddSharedDashboardComponent } from './msf-add-shared-dashboard/msf-add-shared-dashboard.component';
import { AdminArgumentsCategoryComponent } from './admin-arguments-category/admin-arguments-category.component';
import { DragScrollModule } from 'cdk-drag-scroll';
import { MsfArgumentComponent } from './msf-argument/msf-argument.component';
import { DialogArgumentPreviewComponent } from './dialog-argument-preview/dialog-argument-preview.component';
import { AuthGuard } from './guards/auth.guard';
import { MatTreeModule } from '@angular/material/tree';
import { TwoFactorLoginDialogComponent } from './two-factor-login-dialog/two-factor-login-dialog.component';
import { DigitOnlyModule } from '@uiowa/digit-only';
import { MaterialIconPickerComponent } from './material-icon-picker/material-icon-picker.component';
import { CreateCustomerComponent } from './create-customer/create-customer.component';
import { MsfMapCoordinatesComponent } from './msf-map-coordinates/msf-map-coordinates.component';
import { MsfDynamicTableAliasComponent } from './msf-dynamic-table-alias/msf-dynamic-table-alias.component';
import { Cookie } from './api/cookie';
import { MsfDashboardControlPanelComponent } from './msf-dashboard-control-panel/msf-dashboard-control-panel.component';
import { MenuNavComponent } from './menu-nav/menu-nav.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExportAsModule } from 'ngx-export-as';
import { MsfGroupAaaComponent } from './msf-group-aaa/msf-group-aaa.component';
import { AdminArgumentsGroupComponent } from './admin-arguments-group/admin-arguments-group.component';
import { FilterPipeGroupArg } from './admin-arguments-group/pipe-filter-group';
import { AdminShareGroupsArgumentsComponent } from './admin-share-groups-arguments/admin-share-groups-arguments.component';
import { MsfDashboardAssistantComponent } from './msf-dashboard-assistant/msf-dashboard-assistant.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { DatalakeComponent } from './datalake/datalake.component';
import { DatalakeExplorerComponent } from './datalake-explorer/datalake-explorer.component';
import { DatalakeTableCardComponent } from './datalake-table-card/datalake-table-card.component';
import { NgxGaugeModule } from 'ngx-gauge';
import { DatalakeTableShowColumnsComponent } from './datalake-table-show-columns/datalake-table-show-columns.component';
import { DatalakeTablePreviewComponent } from './datalake-table-preview/datalake-table-preview.component';
import { DatalakeQueryEngineComponent } from './datalake-query-engine/datalake-query-engine.component';
import { DatalakeQueryEngineSchemaComponent } from './datalake-query-engine-schema/datalake-query-engine-schema.component';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { DatalakeCreateTableComponent } from './datalake-create-table/datalake-create-table.component';
import { DatalakeCreateNewStructureComponent } from './datalake-create-new-structure/datalake-create-new-structure.component';
import { DatalakeDataUploadComponent } from './datalake-data-upload/datalake-data-upload.component';
import { DatalakeMenuComponent } from './datalake-menu/datalake-menu.component';
import { DatalakeAlarmsComponent } from './datalake-alarms/datalake-alarms.component';
import { DatalakeAlarmEditDialogComponent } from './datalake-alarm-edit-dialog/datalake-alarm-edit-dialog.component';
import { DatalakePartitionsComponent } from './datalake-partitions/datalake-partitions.component';
import { DatalakeExecutionPartitionComponent } from './datalake-execution-partition/datalake-execution-partition.component';
import { DatalakeExecutionPartitionViewDetailComponent } from './datalake-execution-partition-view-detail/datalake-execution-partition-view-detail.component';
import { DatalakePartitionExecuteDialogComponent } from './datalake-partition-execute-dialog/datalake-partition-execute-dialog.component';
import { DatalakeQueryEngineHistoryComponent } from './datalake-query-engine-history/datalake-query-engine-history.component';
import { DatalakeQueryEngineSaveComponent } from './datalake-query-engine-save/datalake-query-engine-save.component';
import { DatalakeAlarmAddEmailDialogComponent } from './datalake-alarm-add-email-dialog/datalake-alarm-add-email-dialog.component';
import { DatalakeUserInformationDialogComponent } from './datalake-user-information-dialog/datalake-user-information-dialog.component';
import { DatalakeCreateRolesComponent } from './datalake-create-roles/datalake-create-roles.component';
import { CreateUserDialogComponent } from './create-user-dialog/create-user-dialog.component';
import { DatalakeHomeComponent } from './datalake-home/datalake-home.component';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { AirlineRestrictionsDialogComponent } from './airline-restrictions-dialog/airline-restrictions-dialog.component';
import { ImageLinkComponent } from './image-link/image-link.component';
import { DateRestrictionDialogComponent } from './date-restriction-dialog/date-restriction-dialog.component';
import { GridstackModule } from '@libria/gridstack';
import { MsfDashboardBrowserComponent } from './msf-dashboard-browser/msf-dashboard-browser.component';
import { MsfDashboardBrowserFolderItemComponent } from './msf-dashboard-browser-folder-item/msf-dashboard-browser-folder-item.component';
import { MenuDashboardComponent } from './menu-dashboard/menu-dashboard.component';
import { NgxCurrencyModule } from "ngx-currency";
import { MsfDashboardCategoryAdminComponent } from './msf-dashboard-category-admin/msf-dashboard-category-admin.component';
import { MsfPartialSummariesComponent } from './msf-partial-summaries/msf-partial-summaries.component';
import { PublicDashboardComponent } from './public-dashboard/public-dashboard.component';
import { PublicizeDashboardDialogComponent } from './publicize-dashboard-dialog/publicize-dashboard-dialog.component';
import { UrlMessageComponent } from './url-message/url-message.component';
import { MsfConfirmationDialogDatalakeComponent } from './msf-confirmation-dialog-datalake/msf-confirmation-dialog-datalake.component';
import { MsfChartPreviewComponent } from './msf-chart-preview/msf-chart-preview.component';
import { ExportCsvDialogComponent } from './export-csv-dialog/export-csv-dialog.component';
import { MsfActionListComponent } from './msf-action-list/msf-action-list.component';
import { MsfDashboardValueSelectorDialogComponent } from './msf-dashboard-value-selector-dialog/msf-dashboard-value-selector-dialog.component';
import { SearchDynamicTableComponent, ValueSearchFilter } from './search-dynamic-table/search-dynamic-table.component';

export const options: Partial<IConfig> | (() => Partial<IConfig>) = {};

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
    MsfTimeRangeComponent,
    MsfDateRangeComponent,
    MsfCeilingComponent,
    MsfWindComponent,
    MsfWindDirectionComponent,
    MsfTemperatureComponent,
    MsfTabSelectorComponent,
    DateTimeFormatPipe,
    MsfAirlineComponent,
    MsfDynamicTableVariablesComponent,
    MsfDynamicTableComponent,
    MsfAircraftTypeComponent,
    jqxBarGaugeComponent,
    jqxGridComponent,
    jqxTreeGridComponent,
    MsfMapComponent,
    MsfLoadingComponent,
    MsfGroupingComponent,
    MsfRoundingComponent,
    AdminMenuComponent,
    CreateMembershipsComponent,
    AdminMenuComponent,
    AdminMenuComponent,
    AdminMenuMembershipsComponent,
    ConfirmDeleteDialog,
    EditOutputOptionsMetaDialog,
    EditCategoryArgumentDialog,
    EditOptionsDialog,
    DrillDownDialog,
    MsfFreeTextInputComponent,
    MsfSelectBoxSingleOptionComponent,
    MsfSelectBoxMultipleOptionComponent,
    MsfCancelsCheckboxComponent,
    MsfDiversionsCheckboxComponent,
    MsfFlightDelaysCheckboxesComponent,
    MsfCausesFlightDelaysCheckboxesComponent,
    MsfTaxiTimesComponent,
    MsfTaxiTimesCheckboxComponent,
    MsfTaxiTimesCheckboxesComponent,
    MsfRegionComponent,
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
    MsfSummaryRevenueBuildsComponent,
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
    MsfEditDashboardComponent,
    MsfAddDashboardComponent,
    MsfDashboardDrillDownComponent,
    MsfDashboardChildPanelComponent,
    MsfTotalTypeComponent,
    MsfGroupingCompGenreComponent,
    MsfGroupingCompTotalComponent,
    MsfMoreInfoPopupComponent,
    MsfGroupingOpComponent,
    MsfGroupingOp2Component,
    MsfStatesComponent,
    MsfFlightDurationSegmentsComponent,
    MsfColumnSelectorComponent,
    MsfShareDashboardComponent,
    MsfSharedDashboardItemsComponent,
    MsfAddSharedDashboardPanelComponent,
    FilterPipe,
    FilterPipeArg,
    FilterPipeGroupArg,
    MsfAddSharedDashboardComponent,
    AdminArgumentsCategoryComponent,
    MsfAddSharedDashboardComponent,
    MsfArgumentComponent,
    DialogArgumentPreviewComponent,
    TwoFactorLoginDialogComponent,
    MaterialIconPickerComponent,
    CreateCustomerComponent,
    MsfMapCoordinatesComponent,
    MsfDynamicTableAliasComponent,
    MsfDashboardControlPanelComponent,
    MenuNavComponent,
    MsfGroupAaaComponent,
    AdminArgumentsGroupComponent,
    AdminShareGroupsArgumentsComponent,
    MsfDashboardAssistantComponent,
    DatalakeComponent,
    DatalakeExplorerComponent,
    DatalakeTableCardComponent,
    DatalakeTableShowColumnsComponent,
    DatalakeTablePreviewComponent,
    DatalakeQueryEngineComponent,
    DatalakeQueryEngineSchemaComponent,
    DatalakeCreateTableComponent,
    DatalakeCreateNewStructureComponent,
    DatalakeDataUploadComponent,
    DatalakeMenuComponent,
    DatalakeAlarmsComponent,
    DatalakePartitionExecuteDialogComponent,
    DatalakeAlarmEditDialogComponent,
    DatalakePartitionsComponent,
    DatalakeExecutionPartitionComponent,
    DatalakeExecutionPartitionViewDetailComponent,
    DatalakeQueryEngineHistoryComponent,
    DatalakeQueryEngineSaveComponent,
    DatalakeAlarmAddEmailDialogComponent,
    DatalakeUserInformationDialogComponent,
    DatalakeCreateRolesComponent,
    MonthHeader,
    YearHeader,
    CreateUserDialogComponent,
    DatalakeHomeComponent,
    AirlineRestrictionsDialogComponent,
    ImageLinkComponent,
    DateRestrictionDialogComponent,
    MsfDashboardBrowserComponent,
    MsfDashboardBrowserFolderItemComponent,
    MenuDashboardComponent,
    MsfDashboardCategoryAdminComponent,
    MsfPartialSummariesComponent,
    PublicDashboardComponent,
    PublicizeDashboardDialogComponent,
    PublicizeDashboardDialogComponent,
    UrlMessageComponent,
    MsfConfirmationDialogDatalakeComponent,
    MsfChartPreviewComponent,
    ExportCsvDialogComponent,
    MsfActionListComponent,
    MsfDashboardValueSelectorDialogComponent,
    SearchDynamicTableComponent,
    ValueSearchFilter
  ],
  imports: [
    BrowserModule,
    DragDropModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatChipsModule,
    LayoutModule,
    MaterialModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxMaterialTimepickerModule.forRoot (),
    BrowserAnimationsModule,
    MatSelectModule,
    MatFormFieldModule,
    NgxMatSelectSearchModule,
    MatTreeModule,
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
    ColorPickerModule,
    DragScrollModule,
    DigitOnlyModule,
    MatTooltipModule,
    ExportAsModule,
    AngularEditorModule,
    NgxGaugeModule,
    CodemirrorModule,
    NgxCurrencyModule,
    NgxMaskModule.forRoot(options),
    GridstackModule.forRoot()
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
    DateTimeFormatPipe,
    Utils,
    AuthGuard,
    Cookie,
    MenuDashboardComponent,
    ValueSearchFilter
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    MessageComponent,
    MsfDynamicTableVariablesComponent,
    ConfirmDeleteDialog,
    EditOutputOptionsMetaDialog,
    EditCategoryArgumentDialog,
    EditOptionsDialog,
    DrillDownDialog,
    MsfConfirmationDialogComponent,
    MsfConfirmationDialogDatalakeComponent,
    MsfDashboardInfoFunctionsComponent,
    MsfEditDashboardComponent,
    MsfAddDashboardComponent,
    MsfDashboardDrillDownComponent,
    MsfDashboardChildPanelComponent,
    MsfMoreInfoPopupComponent,
    DialogArgumentPreviewComponent,
    MsfColumnSelectorComponent,
    MsfShareDashboardComponent,
    AdminShareGroupsArgumentsComponent,
    MsfSharedDashboardItemsComponent,
    MsfAddSharedDashboardPanelComponent,
    MsfAddSharedDashboardComponent,
    TwoFactorLoginDialogComponent,
    MsfDynamicTableAliasComponent,
    MsfDashboardAssistantComponent,
    DatalakeTableShowColumnsComponent,
    DatalakeTablePreviewComponent,
    DatalakeCreateTableComponent,
    DatalakeAlarmEditDialogComponent,
    DatalakePartitionExecuteDialogComponent,
    DatalakeQueryEngineHistoryComponent,
    DatalakeQueryEngineSaveComponent,
    DatalakeAlarmAddEmailDialogComponent,
    DatalakeUserInformationDialogComponent,
    MonthHeader,
    YearHeader,
    CreateUserDialogComponent,
    AirlineRestrictionsDialogComponent,
    DateRestrictionDialogComponent,
    MsfDashboardPanelComponent,
    MsfDashboardBrowserComponent,
    MsfPartialSummariesComponent,
    PublicizeDashboardDialogComponent,
    UrlMessageComponent,
    PublicizeDashboardDialogComponent,
    MsfChartPreviewComponent,
    ExportCsvDialogComponent,
    MsfDashboardValueSelectorDialogComponent
  ]
})
export class AppModule { }
