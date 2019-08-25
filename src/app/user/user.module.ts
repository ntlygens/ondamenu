import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Form, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NgMatModule } from '../ng-mat/ng-mat.module';
import { CoreFuncModule } from '../core-func/core-func.module';

import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
// import { UserMrchntListComponent } from './user-mrchnt-list.component';
// import { UserMrchntListItemComponent } from './user-mrchnt-list-item.component';

@NgModule({
  declarations: [
      UserComponent,
      // UserMrchntListComponent,
      // UserMrchntListItemComponent
  ],
  imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      NgMatModule,
      CoreFuncModule,
      UserRoutingModule
  ]
})
export class UserModule { }
