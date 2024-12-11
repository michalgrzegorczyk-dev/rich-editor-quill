import {Component, AfterViewInit, ElementRef, inject, viewChild} from '@angular/core';
import {QuillIntegrationService} from "./editor/quill-integration.service";
import Quill from 'quill';
import {BlockDivBlot} from "./editor/blots/block-div.blot";
import {JsonPipe} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div style="border: 1px solid gray; padding: 15px">
      <h3 style="margin: 0;">Development Helpers:</h3>

      <button style="margin-right: 10px; margin-top: 10px" (click)="addBlock()">Add new line</button>
      <button class="bbb" (click)="loadTestData()">Reset content</button>
    </div>
    <div style="display: flex">
      <div style="width: 1000px; padding: 15px; border: 1px solid gray; border-top: none; border-right: none">
        <div #editor></div>
      </div>
      <div style="width: 1000px; border: 1px solid gray; border-top: none; padding: 15px">
        <h3 style="margin: 0;">Store:</h3>
        <pre>
          <code>
{{ content | json }}
          </code>
        </pre>
      </div>
    </div>
  `,
  imports: [
    JsonPipe
  ]
})
export class AppComponent implements AfterViewInit {
  private rootEditorElement = viewChild<ElementRef>('editor');
  private readonly quillIntegrationService = inject(QuillIntegrationService);
  content = {
    blocks: [
      "no store lol"
    ]
  };

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
