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

  setupEventListeners(textToolbar: HTMLElement, imageToolbar: HTMLElement) {
    this.setupSelectionChangeListener(textToolbar, imageToolbar);
    this.setupClickListener(textToolbar, imageToolbar);
  }

  private setupSelectionChangeListener(textToolbar: HTMLElement, imageToolbar: HTMLElement) {
    this.quillInstance.on('selection-change', (range: QuillRange | null) => {
      requestAnimationFrame(() => {
        this.quillToolbarService.updateToolbarVisibility(
            this.quillInstance,
            range,
            textToolbar,
            imageToolbar
          );
      });
    });
  }

  private setupClickListener(textToolbar: HTMLElement, imageToolbar: HTMLElement) {
    this.quillInstance.root.addEventListener('click', (event) => {
      requestAnimationFrame(() => {
        this.quillImageService.handleImageClick(event, imageToolbar, textToolbar);
      });
    });
  }
} 