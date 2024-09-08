import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

//===============FireBase===============
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';

//External
import { NgxPayPalModule } from 'ngx-paypal';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgxPayPalModule,
    IonicModule.forRoot({ mode: 'md' }),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig)
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule { }
