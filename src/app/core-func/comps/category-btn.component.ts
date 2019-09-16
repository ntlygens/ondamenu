import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'amm-category-btn',
    template: `
        <button
            mat-button
            class="btn btn-sm btn-secondary menuBtns"
            [disabled]="isActive"
        >
            {{menuNav}}
        </button>
      `,
    styles: [`
          button {
              color: #333;
              /*background-color: #7ed321;*/
              background-color: #E0E0E0f4;
              border-radius: 2px;
              padding: 0 5px;
              user-select: none;
              pointer-events: none;

          }

          button:disabled {
              color: white !important;
              background-color: #BB3523!important;
              opacity: 1;
              /*background-color: #3ACCE1 !important;*/
          }
      `]
})
export class CategoryBtnComponent implements OnInit {
    @Input() menuNav = '';
    @Input() isActive: boolean;
    @Input() mobileOn: boolean;
    @Input() sortOrder: number;

    constructor() { }

    ngOnInit() {
    }

}
