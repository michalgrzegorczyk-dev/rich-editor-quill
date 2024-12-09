import {Component, AfterViewInit, ElementRef, inject, viewChild} from '@angular/core';
import {QuillService} from "./editor/quill.service";
import Quill from 'quill';
import {BlockDivBlot} from "./editor/blots/block-div.blot";

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<div #editor></div>`,
})
export class AppComponent implements AfterViewInit {
  private editorRootElement = viewChild<ElementRef>('editor');
  private readonly quillService = inject(QuillService);

  ngAfterViewInit(): void {
    Quill.register(BlockDivBlot, true);    // Add color picker module
    const BackgroundAttributor:any = Quill.import('attributors/class/background');
    Quill.register(BackgroundAttributor, true);

    const ColorClass:any = Quill.import('attributors/class/color');
    Quill.register(ColorClass, true);

    this.quillService.init(this.editorRootElement()?.nativeElement);
  }
}
