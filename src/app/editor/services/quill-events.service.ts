import { Injectable } from '@angular/core';
import Quill from 'quill';
import { QuillRange } from '../models/quill-range.model';
import { QuillToolbarService } from './quill-toolbar.service';
import { QuillImageService } from './quill-image.service';

@Injectable({
  providedIn: 'root'
})
export class QuillEventsService {
  private quillInstance!: Quill;

  constructor(
    private quillToolbarService: QuillToolbarService,
    private quillImageService: QuillImageService
  ) {}

  initialize(quill: Quill) {
    this.quillInstance = quill;
  }

  setupEventListeners(textToolbar: HTMLElement) {
    this.setupSelectionChangeListener(textToolbar);
    this.setupClickListener(textToolbar);
  }

  private setupSelectionChangeListener(textToolbar: HTMLElement) {
    this.quillInstance.on('selection-change', (range: QuillRange | null) => {
      requestAnimationFrame(() => {
        if (!range) {
          textToolbar.style.display = 'none';
          this.quillToolbarService.hideActiveToolbar();
          return;
        }

        const [leaf] = this.quillInstance.getLeaf(range.index);
        
        if (leaf?.domNode instanceof HTMLImageElement && range.length === 0) {
          const bounds = leaf.domNode.getBoundingClientRect();
          const editorBounds = this.quillInstance.container.getBoundingClientRect();
          
          this.quillToolbarService.showToolbar2('img', {
            top: bounds.top - editorBounds.top - 45,
            left: bounds.left - editorBounds.left + (bounds.width / 2)
          });
          textToolbar.style.display = 'none';
        } else if (range.length > 0) {
          textToolbar.style.display = 'block';
          this.quillToolbarService.hideActiveToolbar();
        } else {
          textToolbar.style.display = 'none';
          this.quillToolbarService.hideActiveToolbar();
        }
      });
    });
  }

  private setupClickListener(textToolbar: HTMLElement) {
    this.quillInstance.root.addEventListener('click', (event) => {
      requestAnimationFrame(() => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'IMG') {
          this.quillInstance.setSelection(null);
          textToolbar.style.display = 'none';
          
          console.log('t', target)

          const bounds = target.getBoundingClientRect();
          console.log('b', bounds)

          const editorBounds = this.quillInstance.container.getBoundingClientRect();
          console.log('e', editorBounds)
          

          this.quillToolbarService.showToolbar2('img', {
            top: bounds.top - editorBounds.top,
            left: bounds.left + 100
          });
        }
      });
    });
  }
} 