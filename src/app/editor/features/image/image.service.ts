import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  currentImg: HTMLImageElement | null = null;

  selectImage(img: HTMLImageElement) {
    this.currentImg = img;
    this.currentImg.style.border = '1px solid #7b68ee';
    this.currentImg.style.borderRadius = '5px';
  }

  deselectCurrentImage() {
    if (this.currentImg) {
      this.currentImg.style.border = '1px solid #c0c0c0';
      this.currentImg = null;
    }
  }

  deleteImage() {
  }
}
