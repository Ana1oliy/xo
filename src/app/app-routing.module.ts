import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SettingsComponent} from "./settings/settings.component";
import {ScreenComponent} from "./screen/screen.component";

const routes: Routes = [
  {path: '', redirectTo: 'prompt', pathMatch: 'full'},
  {path: 'prompt', component: SettingsComponent},
  {path: 'game', component: ScreenComponent},
  {path: '**', redirectTo: 'prompt'},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class AppRoutingModule {
}
