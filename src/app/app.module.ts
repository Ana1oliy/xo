import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {ScreenComponent} from './screen/screen.component';
import {FieldComponent} from './screen/field/field.component';
import {SettingsComponent} from './settings/settings.component';
import {AppRoutingModule} from './app-routing.module';
import {ReactiveFormsModule} from '@angular/forms';
import {GameService} from "./screen/game.service";

@NgModule({
  declarations: [
    AppComponent,
    ScreenComponent,
    FieldComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
  ],
  providers: [
    GameService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
