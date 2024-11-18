import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import Quill from 'quill';
import { QuillService } from './editor.service';

@Component({
  selector: 'app-quill-editor',
  standalone: true,
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
      <div #imageToolbar class="floating-toolbar image-toolbar">
        <button (click)="resizeImage('small')">Small</button>
        <button (click)="resizeImage('medium')">Medium</button>
        <button (click)="resizeImage('large')">Large</button>
        <button (click)="deleteImage()">Delete</button>
      </div>
      <div #editor></div>
    </div>
  `,
  styleUrls: ['./editor.component.css']
})
export class QuillEditorComponent implements AfterViewInit {
  @ViewChild('editor') private editorElement!: ElementRef;
  @ViewChild('textToolbar') private textToolbar!: ElementRef;
  @ViewChild('imageToolbar') private imageToolbar!: ElementRef;

  constructor(private quillService: QuillService) {}

  ngAfterViewInit() {
    this.quillService.initialize(
      this.editorElement.nativeElement,
      this.textToolbar.nativeElement,
      this.imageToolbar.nativeElement
    );
  }

  resizeImage(size: 'small' | 'medium' | 'large') {
  }

  deleteImage() {
    this.quillService.deleteImage();
  }
}
