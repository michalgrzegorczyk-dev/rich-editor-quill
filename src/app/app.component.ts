import {Component, AfterViewInit, ElementRef, inject, viewChild} from '@angular/core';
import {QuillIntegrationService} from "./editor/quill-integration.service";
import Quill from 'quill';
import {BlockDivBlot} from "./editor/blots/block-div.blot";

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div #editor></div>
    <button class="bbb" (click)="addBlock()">Add line</button>
    <button class="bbb" (click)="loadTestData()">LOAD TEST DATA</button>
  `,
})
export class AppComponent implements AfterViewInit {
  private rootEditorElement = viewChild<ElementRef>('editor');
  private readonly quillIntegrationService = inject(QuillIntegrationService);

  ngAfterViewInit(): void {
    Quill.register(BlockDivBlot, true);
    const BackgroundAttributor:any = Quill.import('attributors/class/background');
    Quill.register(BackgroundAttributor, true);

    const ColorClass:any = Quill.import('attributors/class/color');
    Quill.register(ColorClass, true);

    this.quillIntegrationService.init(this.rootEditorElement()?.nativeElement);
  }

  addBlock() {
    this.quillIntegrationService.addBlock();
  }

  loadTestData() {
    this.quillIntegrationService.loadTestData();
  }
}
