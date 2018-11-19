import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { LoginScreenComponent } from './login-screen/login-screen.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { AppRoutingModule } from './routing/app.routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import {MaterialModule} from './material/material';
import { MessageComponent } from './message/message.component';
import { FormsModule, ReactiveFormsModule}   from '@angular/forms';
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
import { AmChartsModule } from "@amcharts/amcharts3-angular";
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
import { AgmCoreModule } from '@agm/core';
import { AgmDirectionModule } from 'agm-direction'
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { MsfSingleAirlineComponent } from './msf-single-airline/msf-single-airline.component';
import { MsfFlightNumberComponent } from './msf-flight-number/msf-flight-number.component';
import { MsfLoadingComponent } from './msf-loading/msf-loading.component';
import { MsfGroupingComponent } from './msf-grouping/msf-grouping.component';
import { MsfRoundingComponent } from './msf-rounding/msf-rounding.component';
import { MsfDateComponent } from './msf-date/msf-date.component';

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
    MsfDateComponent
  ],
  imports: [
    BrowserModule,
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
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyArd7Sqcy7bB0ucBKhm2ik4r2xZPG9wPtU'
    }),
    AgmDirectionModule,
    AgmSnazzyInfoWindowModule

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
    DateTimeFormatPipe
  ],
  bootstrap: [AppComponent],
  entryComponents: [MessageComponent, MsfDynamicTableVariablesComponent]
})
export class AppModule { }
