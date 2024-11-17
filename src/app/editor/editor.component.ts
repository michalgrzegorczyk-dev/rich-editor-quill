import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import Quill from 'quill';
import { QuillService, ToolbarBounds } from './editor.service';

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
  styleUrls: ['./editor.component.css'],
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
      if (range) {
        // Check if cursor is near an image
        const [leaf] = this.quill.getLeaf(range.index);
        const prevLeaf = this.quill.getLeaf(Math.max(0, range.index - 1))[0];
        const nextLeaf = this.quill.getLeaf(range.index + 1)[0];
        
        const checkAndHighlightImage = (leaf: any) => {
          if (leaf && leaf.domNode && leaf.domNode.tagName === 'IMG') {
            this.quillService.handleImageClick(leaf.domNode);
            const bounds = leaf.domNode.getBoundingClientRect();
            const editorBounds = this.quill.container.getBoundingClientRect();
            
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
            return true;
          }
          return false;
        };
  
        // Check current, previous, and next leaves for images
        if (!checkAndHighlightImage(leaf) && 
            !checkAndHighlightImage(prevLeaf) && 
            !checkAndHighlightImage(nextLeaf)) {
          // No nearby images found, handle text selection normally
          if (range.length > 0) {
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
            this.imageToolbar.nativeElement.style.display = 'none';
            this.quillService.handleImageClick(null);
          }
        }
      } else {
        this.textToolbar.nativeElement.style.display = 'none';
        this.imageToolbar.nativeElement.style.display = 'none';
        this.quillService.handleImageClick(null);
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
