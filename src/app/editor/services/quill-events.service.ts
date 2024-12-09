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
    this.setupEventListeners();
  }

  setupEventListeners(): void {
    this.setupClickListener();
    this.setupClickOutsideListener();
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
        this.quillToolbarService.removeCurrentToolbar();
      }
    });
  }

  private showImageToolbar(bounds: DOMRect, editorBounds: DOMRect): void {
    this.quillToolbarService.showToolbar('img', {
      top: bounds.top - editorBounds.top,
      left: bounds.left + 100
    });
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
