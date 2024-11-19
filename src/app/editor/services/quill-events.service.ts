import { Injectable } from '@angular/core';
import Quill from 'quill';
import { QuillRange } from '../models/quill-range.model';
import { QuillToolbarService } from './quill-toolbar.service';

@Injectable({
  providedIn: 'root'
})
export class QuillEventsService {
  private quillInstance!: Quill;

  constructor(
    private quillToolbarService: QuillToolbarService,
  ) {}

  initialize(quill: Quill) {
    this.quillInstance = quill;
  }

  setupEventListeners() {
    this.setupSelectionChangeListener();
    this.setupClickListener();
    this.setupClickOutsideListener();
  }

  private setupSelectionChangeListener() {
    this.quillInstance.on('selection-change', (range: QuillRange | null) => {
      requestAnimationFrame(() => {
        if (!range) {
          this.quillToolbarService.hideActiveToolbar();
          return;
        }

        const [leaf] = this.quillInstance.getLeaf(range.index);
        
        if (leaf?.domNode instanceof HTMLImageElement && range.length === 0) {
          const bounds = leaf.domNode.getBoundingClientRect();
          const editorBounds = this.quillInstance.container.getBoundingClientRect();
          
          this.quillToolbarService.showToolbar('img', {
            top: bounds.top - editorBounds.top,
            left: bounds.left + 100
          });// todo duplicate code
        } else if (range.length > 0) {
          const bounds = this.quillInstance.getBounds(range.index, range.length);
          if (bounds) {
            const editorBounds = this.quillInstance.container.getBoundingClientRect();
            
            this.quillToolbarService.showToolbar('txt', {
              top: bounds.top + 65,
              left: bounds.left - editorBounds.left + (bounds.width / 2) + 250
            });
          }
        } else {
          this.quillToolbarService.hideActiveToolbar();
        }
      });
    });
  }

  private setupClickListener() {
    this.quillInstance.root.addEventListener('click', (event) => {
      requestAnimationFrame(() => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'IMG') {
          this.quillInstance.setSelection(null);
          
          const bounds = target.getBoundingClientRect();
          const editorBounds = this.quillInstance.container.getBoundingClientRect();
          
          this.quillToolbarService.showToolbar('img', {
            top: bounds.top - editorBounds.top,
            left: bounds.left + 100
          });
          event.stopPropagation();
        }
      });
    });
  }

  private setupClickOutsideListener() {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // Check if click is outside of editor, image, or toolbar
      if (!this.quillInstance.container.contains(target) && 
          !target.closest('.floating-toolbar') && 
          target.tagName !== 'IMG') {
        this.quillToolbarService.hideActiveToolbar();
      }
    });
  }
} 