import { Injectable } from '@angular/core';
import { ToolbarBounds } from './models/toolbar-bounds.model';
import { QuillRange } from './models/quill-range.model';
import Quill from 'quill';

@Injectable({
  providedIn: 'root'
})
export class QuillToolbarService {
  private selectedImage: HTMLImageElement | null = null;

  getSelectedImage(): HTMLImageElement | null {
    return this.selectedImage;
  }

  updateToolbarVisibility(
    quillInstance: Quill,
    range: QuillRange | null, 
    textToolbar: HTMLElement, 
    imageToolbar: HTMLElement
  ) {
    if (!range) {
      this.hideAllToolbars(textToolbar, imageToolbar);
      return;
    }

    const [leaf] = quillInstance.getLeaf(range.index);
    
    if (leaf?.domNode instanceof HTMLImageElement && range.length === 0) {
      this.showImageToolbar(quillInstance, leaf.domNode, imageToolbar, textToolbar);
    } else if (range.length > 0) {
      this.showTextToolbar(quillInstance, range, textToolbar, imageToolbar);
    } else {
      this.hideAllToolbars(textToolbar, imageToolbar);
    }
  }

  hideAllToolbars(textToolbar: HTMLElement, imageToolbar: HTMLElement) {
    if (this.selectedImage) {
      this.selectedImage.classList.remove('selected-image');
      this.selectedImage = null;
    }
    textToolbar.style.display = 'none';
    imageToolbar.style.display = 'none';
  }

  showImageToolbar(
    quillInstance: Quill,
    image: HTMLImageElement, 
    imageToolbar: HTMLElement, 
    textToolbar: HTMLElement
  ) {
    if (this.selectedImage) {
      this.selectedImage.classList.remove('selected-image');
    }

    image.classList.add('selected-image');
    this.selectedImage = image;

    textToolbar.style.display = 'none';

    const bounds = image.getBoundingClientRect();
    const editorBounds = quillInstance.container.getBoundingClientRect();

    const toolbarBounds: ToolbarBounds = {
      top: bounds.top - editorBounds.top + window.scrollY,
      left: bounds.left - editorBounds.left,
      width: bounds.width,
      height: bounds.height
    };

    this.updateToolbarPosition(imageToolbar, toolbarBounds, quillInstance.container);
  }

  showTextToolbar(
    quillInstance: Quill,
    range: QuillRange,
    textToolbar: HTMLElement,
    imageToolbar: HTMLElement
  ) {
    imageToolbar.style.display = 'none';

    const bounds = quillInstance.getBounds(range.index, range.length);
    if (!bounds) {
      this.hideAllToolbars(textToolbar, imageToolbar);
      return;
    }

    const toolbarBounds: ToolbarBounds = {
      top: bounds.top,
      left: bounds.left,
      width: bounds.width,
      height: bounds.height
    };

    this.updateToolbarPosition(textToolbar, toolbarBounds, quillInstance.container);
  }

  updateToolbarPosition(toolbar: HTMLElement, bounds: ToolbarBounds, editorContainer: HTMLElement) {
    toolbar.style.display = 'block';
    toolbar.style.top = `${bounds.top - toolbar.offsetHeight - 10}px`;

    let leftPosition = bounds.left + bounds.width / 2 - toolbar.offsetWidth / 2;

    const editorRect = editorContainer.getBoundingClientRect();
    const minLeft = 0;
    const maxLeft = editorRect.width - toolbar.offsetWidth;
    leftPosition = Math.max(minLeft, Math.min(leftPosition, maxLeft));

    toolbar.style.left = `${leftPosition}px`;
  }
}