import { Component, OnInit, Input, Output, OnChanges, EventEmitter } from '@angular/core';

@Component({
    selector: 'amm-edit-sel-btn',
    template: `
        <div *ngIf='!editmode' class='editBtn'>
            <button *ngIf='rowIsSelected' mat-raised-button color='primary' (click)='openEditor()' [matBadge]="rows2Edit" matBadgePosition="above after" matBadgeColor="accent">EDIT</button>
        </div>
        <div *ngIf='editmode' class='editBtn'>
            <button mat-raised-button color='primary' (click)='closeEditor()' >SAVE</button>
        </div>
    `,
    styles: [`
    :host {
      display: inline-block;
      margin-top: 10px;
    }

    button { align-content: center; text-align: center; }
  `]
})
export class EditSelBtnComponent implements OnInit, OnChanges {
    @Input() rows2Edit = 0;
    @Input() editmode: boolean;
    @Output() send2Editor: EventEmitter<any> = new EventEmitter<any>();
    @Output() saveAndCloseEditor: EventEmitter<any> = new EventEmitter<any>();

    rowIsSelected: boolean;
    constructor() {
        // this.rowIsSelected = false;
    }

    openEditor() {
        this.send2Editor.emit(null);
    }

    closeEditor() {
        this.saveAndCloseEditor.emit(null);
    }
    ngOnInit() {
        // if (this.rows2Edit > 0 ) { this.rowIsSelected = true; }
        this.rowIsSelected = false;
    }

    ngOnChanges( changes ): void {
        if ( this.rows2Edit > 0 ) {
            this.rowIsSelected = true;
        } else {
            this.rowIsSelected = false;
        }

    }


}
