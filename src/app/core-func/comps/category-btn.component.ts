import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'amm-category-btn',
    template: `
        <button
            mat-button
            class="btn btn-sm btn-secondary"
            [disabled]="isActive"
        >
            {{menuNav}}
        </button>
      `,
    styles: [`
          button {
              color: #333;
              background-color: #BCF521;
              border-radius: 2px;
          }

          button:disabled {
              color: white !important;
              background-color: #3ACCE1 !important;
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
