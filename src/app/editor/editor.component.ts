import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { QuillService } from './editor.service';
import { QuillImageService } from './services/quill-image.service';
import { SlashMenuComponent } from './features/slash-menu/slash-menu.component';

@Component({
  selector: 'app-quill-editor',
  standalone: true,
  imports: [SlashMenuComponent],
  template: `
    <div class="editor-container">
      <div #textToolbar class="floating-toolbar ql-toolbar ql-snow">
        <span class="ql-formats">
          <select class="ql-header">
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option selected>Normal</option>
          </select>
        </span>
        <span class="ql-formats">
          <button class="ql-bold"></button>
          <button class="ql-italic"></button>
          <button class="ql-underline"></button>
        </span>
        <span class="ql-formats">
          <button class="ql-image"></button>
          <button class="ql-code-block"></button>
        </span>
      </div>
      <div #editor></div>
    </div>
  `,
  styleUrls: ['./editor.component.scss']
})
export class QuillEditorComponent implements AfterViewInit {
  @ViewChild('editor') private editorElement!: ElementRef;
  @ViewChild('textToolbar') private textToolbar!: ElementRef;

  constructor(
    private quillService: QuillService,
    private quillImageService: QuillImageService
  ) {}

  ngAfterViewInit() {
    this.quillService.initialize(
      this.editorElement.nativeElement,
      this.textToolbar.nativeElement
    );
  }
}
