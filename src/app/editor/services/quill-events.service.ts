import { Injectable } from '@angular/core';
import Quill from 'quill';
import { QuillRange } from '../models/quill-range.model';
import { QuillToolbarService } from './quill-toolbar.service';

@Injectable({
  providedIn: 'root'
})
export class QuillEventsService {
  private quillInstance!: Quill;

  constructor(private quillToolbarService: QuillToolbarService) {}

  initialize(quill: Quill): void {
    this.quillInstance = quill;
  }

  setupEventListeners(): void {
    this.setupSelectionChangeListener();
    this.setupClickListener();
    this.setupClickOutsideListener();
  }

  private setupSelectionChangeListener(): void {
    this.quillInstance.on('selection-change', (range: QuillRange | null) => {
      if (!range) {
        this.quillToolbarService.hideActiveToolbar();
        return;
      }

      const [leaf]:any = this.quillInstance.getLeaf(range.index);
      const editorBounds = this.quillInstance.container.getBoundingClientRect();

      if (this.isImageLeaf(leaf) && range.length === 0) {
        const bounds = (leaf.domNode as HTMLImageElement).getBoundingClientRect();
        this.showImageToolbar(bounds, editorBounds);
      } else if (range.length > 0) {
        this.handleTextSelection(range, editorBounds);
      } else {
        this.quillToolbarService.hideActiveToolbar();
      }
    });
  }

  private setupClickListener(): void {
    this.quillInstance.root.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      
      if (target.tagName === 'IMG') {
        this.handleImageClick(target);
      }
    });
  }

  private setupClickOutsideListener(): void {
    document.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;
      const isOutsideEditor = !this.quillInstance.container.contains(target);
      const isOutsideToolbar = !target.closest('.floating-toolbar');
      const isNotImage = target.tagName !== 'IMG';

      if (isOutsideEditor && isOutsideToolbar && isNotImage) {
        this.quillToolbarService.hideActiveToolbar();
      }
    });
  }

  private isImageLeaf(leaf: any): boolean {
    return leaf?.domNode instanceof HTMLImageElement;
  }

  private showImageToolbar(bounds: DOMRect, editorBounds: DOMRect): void {
    this.quillToolbarService.showToolbar('img', {
      top: bounds.top - editorBounds.top,
      left: bounds.left + 100
    });
  }

  private handleTextSelection(range: QuillRange, editorBounds: DOMRect): void {
    const bounds = this.quillInstance.getBounds(range.index, range.length);
    
    if (bounds) {
      this.quillToolbarService.showToolbar('txt', {
        top: bounds.top + 65,
        left: bounds.left - editorBounds.left + (bounds.width / 2) + 250
      });
    }
  }

  private handleImageClick(target: HTMLElement): void {
    this.quillInstance.setSelection(null);
    
    const bounds = target.getBoundingClientRect();
    const editorBounds = this.quillInstance.container.getBoundingClientRect();

    requestAnimationFrame(() => {
      this.showImageToolbar(bounds, editorBounds);
    });
  }
}