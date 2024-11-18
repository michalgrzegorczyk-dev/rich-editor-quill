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

  deleteImage() {
    const selectedImage = this.quillToolbarService.getSelectedImage();
    if (selectedImage) {
      const blocks = this.quillInstance.scroll.descendants(
        (blot: any) => blot.domNode === selectedImage
      );
      
      if (blocks.length > 0) {
        const blot = blocks[0];
        const index = this.quillInstance.getIndex(blot);
        this.quillInstance.deleteText(index, 1);
        this.quillToolbarService.hideActiveToolbar();
      }
    }
  }

  resizeImage(size: 'small' | 'medium' | 'large') {
    const selectedImage = this.quillToolbarService.getSelectedImage();
    if (selectedImage) {
      switch (size) {
        case 'small':
          selectedImage.style.width = '25%';
          break;
        case 'medium':
          selectedImage.style.width = '50%';
          break;
        case 'large':
          selectedImage.style.width = '100%';
          break;
      }
    }
  }
} 