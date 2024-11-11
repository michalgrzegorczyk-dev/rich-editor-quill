import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import Quill from 'quill';
import {QuillService, ToolbarBounds} from "./r.sev";

@Component({
  selector: 'app-quill-editor',
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
  styleUrls: ['./r.css'],
  standalone: true,
})
export class QuillEditorComponent implements AfterViewInit {
  @ViewChild('editor') private editorElement!: ElementRef;
  @ViewChild('textToolbar') private textToolbar!: ElementRef;
  @ViewChild('imageToolbar') private imageToolbar!: ElementRef;

  private quill!: Quill;

  constructor(private quillService: QuillService) {}

  ngAfterViewInit() {
    this.quill = this.quillService.initialize(
      this.editorElement.nativeElement,
      this.textToolbar.nativeElement
    );
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.quill.root.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const image = target.tagName === 'IMG' ? target as HTMLImageElement : null;

      if (image) {
        this.quillService.handleImageClick(image);
        const bounds = image.getBoundingClientRect();
        const editorBounds = this.quill.container.getBoundingClientRect();
        console.log(editorBounds);

        const toolbarBounds: ToolbarBounds = {
          top: bounds.top - editorBounds.top + window.scrollY,
          left: bounds.left - editorBounds.left,
          width: bounds.width,
          height: bounds.height
        };

        this.quillService.updateToolbarPosition(
          this.imageToolbar.nativeElement,
          toolbarBounds,
          this.quill.container
        );
        this.textToolbar.nativeElement.style.display = 'none';
      } else {
        this.imageToolbar.nativeElement.style.display = 'none';
        this.quillService.handleImageClick(null);
      }
    });

    this.quill.on('selection-change', (range: { index: number; length: number } | null) => {
      if (range && range.length > 0) {
        const bounds = this.quill.getBounds(range.index, range.length);
        if (bounds) {
          const toolbarBounds: ToolbarBounds = {
            top: bounds.top,
            left: bounds.left,
            width: bounds.width,
            height: bounds.height
          };
          this.quillService.updateToolbarPosition(
            this.textToolbar.nativeElement,
            toolbarBounds,
            this.quill.container
          );
          this.imageToolbar.nativeElement.style.display = 'none';
        }
      } else {
        this.textToolbar.nativeElement.style.display = 'none';
      }
    });
  }

  resizeImage(size: 'small' | 'medium' | 'large') {
    this.quillService.resizeImage(size);
  }

  deleteImage() {
    if (this.quillService.deleteImage()) {
      this.imageToolbar.nativeElement.style.display = 'none';
    }
  }
}
