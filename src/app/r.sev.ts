import { Injectable } from '@angular/core';
import Quill from 'quill';
import { BehaviorSubject } from 'rxjs';

export interface QuillRange {
  index: number;
  length: number;
}

export interface ToolbarBounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuillService {
  private quillInstance!: Quill;
  private selectedImageSubject = new BehaviorSubject<HTMLImageElement | null>(null);
  selectedImage$ = this.selectedImageSubject.asObservable();

  initialize(editorElement: HTMLElement, toolbar: HTMLElement) {
    this.registerCustomBlots();
    this.initializeQuill(editorElement, toolbar);
    return this.quillInstance;
  }

  private registerCustomBlots() {
    const Block = Quill.import('blots/block') as any;

    class BlockDiv extends Block {
      static create(value: any) {
        const node = super.create(value);
        node.classList.add('block');
        return node;
      }

      static blotName = 'block-div';
      static tagName = 'div';
    }

    Quill.register('formats/block-div', BlockDiv);
  }

  private initializeQuill(editorElement: HTMLElement, toolbar: HTMLElement) {
    this.quillInstance = new Quill(editorElement, {
      theme: 'snow',
      modules: {
        toolbar: toolbar,
        keyboard: {
          bindings: {
            enter: {
              key: 13,
              handler: this.handleEnterKey.bind(this)
            },
          }
        }
      },
      formats: ['block-div', 'image', 'header', 'bold', 'italic', 'underline', 'code-block']
    });

    this.quillInstance.setContents([
      { insert: 'Press Enter to create new blocks...\n', attributes: { 'block-div': true } }
    ]);

    return this.quillInstance;
  }

  private handleEnterKey(range: QuillRange): boolean {
    const currentSelection = this.quillInstance.getSelection();
    if (!currentSelection) return true;

    const [block, offset] = this.quillInstance.getLine(currentSelection.index);

    if (!block) return true;

    const blockLength = block.length();
    const blockIndex = this.quillInstance.getIndex(block as any);

    if (offset === blockLength) {
      this.quillInstance.insertText(blockIndex + blockLength, '\n', { 'block-div': true });
      this.quillInstance.setSelection(blockIndex + blockLength + 1, 0);
    } else {
      const textContent = block.domNode.textContent || '';
      const remainingText = textContent.slice(offset);
      this.quillInstance.deleteText(currentSelection.index, remainingText.length);
      this.quillInstance.insertText(blockIndex + offset + 1, remainingText + '\n', { 'block-div': true });
      this.quillInstance.setSelection(blockIndex + offset + 1, 0);
    }

    return false;
  }

  handleImageClick(image: HTMLImageElement | null) {
    if (image) {
      const blot = Quill.find(image);
      if (blot) {
        const index = this.quillInstance.getIndex(blot as any);
        this.quillInstance.setSelection(index, 1);
      }
    }
    this.selectedImageSubject.next(image);
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

  resizeImage(size: 'small' | 'medium' | 'large') {
    const selectedImage = this.selectedImageSubject.value;
    if (selectedImage) {
      const sizes = {
        small: '200px',
        medium: '400px',
        large: '600px'
      };
      selectedImage.style.width = sizes[size];
    }
  }

  deleteImage() {
    const selectedImage = this.selectedImageSubject.value;
    if (selectedImage) {
      const blot = Quill.find(selectedImage);
      if (blot) {
        const index = this.quillInstance.getIndex(blot as any);
        this.quillInstance.deleteText(index, 1);
        return true;
      }
    }
    return false;
  }
}
