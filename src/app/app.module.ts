// src/app/app.module.ts
// Minimal popout application - URL-First architecture demo

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PortalModule } from '@angular/cdk/portal';
import { MessageService } from 'primeng/api';

// Angular Material
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PrimengModule } from './primeng.module';

// Feature Components
import { HomeComponent } from './features/home/home.component';
import { TileComponent } from './features/tile/tile.component';
import { ParabolaChartComponent } from './features/chart/chart.component';
import { DataTableComponent } from './features/data-table/data-table.component';
import { MatDataTableComponent } from './features/mat-data-table/mat-data-table.component';

// Framework Services
import { UrlStateService } from './framework/services/url-state.service';
import { PopOutContextService } from './framework/services/popout-context.service';
import { PopOutManagerService } from './framework/services/popout-manager.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    TileComponent,
    ParabolaChartComponent,
    DataTableComponent,
    MatDataTableComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    PortalModule,
    AppRoutingModule,
    PrimengModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule
  ],
  providers: [
    MessageService,
    UrlStateService,
    PopOutContextService,
    PopOutManagerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
