import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NydohComponent } from './doh/nydoh/nydoh.component';


@NgModule({
    declarations: [NydohComponent],
    exports: [
        NydohComponent
    ],
    imports: [
        CommonModule
    ]
})
export class CoreFuncModule { }
