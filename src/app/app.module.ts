import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ProjectsComponent } from './projects/projects.component';
import { ContactComponent } from './contact/contact.component';
import { ServicesComponent } from './services/services.component';
import { DownloadService } from 'src/assets/download.service';
import { NotFoundComponent } from './not-found/not-found.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MobileNavbarComponent } from './mobile-navbar/mobile-navbar.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    ProjectsComponent,
    ContactComponent,
    ServicesComponent,
    NotFoundComponent,
    SidebarComponent,
    MobileNavbarComponent,  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,

  ],
  providers: [DownloadService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Add this line to include the <link>model-viewer</link> custom element
})
export class AppModule { }
