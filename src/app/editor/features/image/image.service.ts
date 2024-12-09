import {Injectable, inject} from '@angular/core';
import { ToolbarManagerService } from '../../services/toolbar-manager.service';
import {QuillInstanceService} from "../../config/quill-instance.service";

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private quillInstance = inject(QuillInstanceService).quill;

  constructor(private quillToolbarService: ToolbarManagerService) {}

  currentImg: HTMLImageElement | null = null;

  selectImage(img: HTMLImageElement) {
    this.currentImg = img;
    this.currentImg.style.border = '1px solid #7b68ee';
    this.currentImg.style.borderRadius = '5px';
  }

  deselectImage() {
    if(this.currentImg) {
      this.currentImg.style.border = '1px solid #E6E8EBB2';
      this.currentImg = null;
    }
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
        this.quillToolbarService.destroyActiveToolbar();
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
