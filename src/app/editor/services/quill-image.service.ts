import { Injectable } from '@angular/core';
import Quill from 'quill';
import { QuillToolbarService } from './quill-toolbar.service';

@Injectable({
  providedIn: 'root'
})
export class QuillImageService {
  private quillInstance!: Quill;

  constructor(private quillToolbarService: QuillToolbarService) {}

  initialize(quill: Quill) {
    this.quillInstance = quill;
  }

  handleImageClick(event: Event, imageToolbar: HTMLElement, textToolbar: HTMLElement) {
    const target = event.target as HTMLElement;
    
    if (target.tagName === 'IMG') {
      this.quillInstance.setSelection(null);
      const image = target as HTMLImageElement;
      this.quillToolbarService.showImageToolbar(this.quillInstance, image, imageToolbar, textToolbar);
    }
  }

  deleteImage(textToolbar: HTMLElement, imageToolbar: HTMLElement) {
    const selectedImage = this.quillToolbarService.getSelectedImage();
    if (selectedImage) {
      const blocks = this.quillInstance.scroll.descendants(
        (blot: any) => blot.domNode === selectedImage
      );
      
      if (blocks.length > 0) {
        const blot = blocks[0];
        const index = this.quillInstance.getIndex(blot);
        
        this.quillInstance.deleteText(index, 1);
        this.quillToolbarService.hideAllToolbars(textToolbar, imageToolbar);
      }
    }
  }

  resizeImage(size: 'small' | 'medium' | 'large') {
    // Implement image resizing logic here
  }
} 