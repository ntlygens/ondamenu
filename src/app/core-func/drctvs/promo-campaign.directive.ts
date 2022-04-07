import { Directive, Input, ElementRef, TemplateRef, Renderer2, HostListener } from '@angular/core';

@Directive({
    selector: '[ammPromoCampaign]'
})
export class PromoCampaignDirective {
    elem;
    dParent;
    dSibling;
    dSubmitBtn;
    dImgSpace;
    constructor(
        private elemRef: ElementRef,
        private renderer: Renderer2
    ) {
        this.elem = this.elemRef.nativeElement;
        this.elem.style.display = 'none';
        // this.dParent = this.elem.parentElement;
        // this.dSibling = this.dParent.className;
        // this.dSibling = this.dParent.getElementsByClassName('rounded');
        // this.elem.style.display = 'none';
        // console.log('elem: ', this.elem.children.length);
    }
    @HostListener('click', ['$event'])
    changeBackground(): void {
        this.renderer.setStyle(this.elem, 'background', 'skyblue');
    }

}
