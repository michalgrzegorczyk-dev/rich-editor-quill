import { Injectable } from '@angular/core';
import Quill from 'quill';

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
  private selectedImage: HTMLImageElement | null = null;

  initialize(editorElement: HTMLElement, textToolbar: HTMLElement, imageToolbar: HTMLElement) {
    this.registerCustomBlots();
    this.initializeQuill(editorElement, textToolbar);
    
    this.quillInstance.on('selection-change', (range: QuillRange | null) => {
      requestAnimationFrame(() => {
        this.updateToolbarVisibility(range, textToolbar, imageToolbar);
      });
    });

    this.quillInstance.root.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'IMG') {
        const image = target as HTMLImageElement;
        this.showImageToolbar(image, imageToolbar, textToolbar);
        
        const [blot] = this.quillInstance.getLeaf(this.quillInstance.getSelection()?.index || 0);
        if (blot) {
          const index = this.quillInstance.getIndex(blot);
          this.quillInstance.setSelection(index, 0);
        }
      }
    });

    return this.quillInstance;
  }

  private updateToolbarVisibility(
    range: QuillRange | null, 
    textToolbar: HTMLElement, 
    imageToolbar: HTMLElement
  ) {
    if (!range) {
      this.hideAllToolbars(textToolbar, imageToolbar);
      return;
    }

    const [leaf] = this.quillInstance.getLeaf(range.index);
    
    if (leaf?.domNode instanceof HTMLImageElement && range.length === 0) {
      this.showImageToolbar(leaf.domNode, imageToolbar, textToolbar);
    } else if (range.length > 0) {
      this.showTextToolbar(range, textToolbar, imageToolbar);
    } else {
      this.hideAllToolbars(textToolbar, imageToolbar);
    }
  }

  private hideAllToolbars(textToolbar: HTMLElement, imageToolbar: HTMLElement) {
    if (this.selectedImage) {
      this.selectedImage.classList.remove('selected-image');
      this.selectedImage = null;
    }
    textToolbar.style.display = 'none';
    imageToolbar.style.display = 'none';
  }

  private showImageToolbar(
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
    const editorBounds = this.quillInstance.container.getBoundingClientRect();

    const toolbarBounds: ToolbarBounds = {
      top: bounds.top - editorBounds.top + window.scrollY,
      left: bounds.left - editorBounds.left,
      width: bounds.width,
      height: bounds.height
    };

    this.updateToolbarPosition(imageToolbar, toolbarBounds, this.quillInstance.container);
  }

  private showTextToolbar(
    range: QuillRange,
    textToolbar: HTMLElement,
    imageToolbar: HTMLElement
  ) {
    imageToolbar.style.display = 'none';

    const bounds = this.quillInstance.getBounds(range.index, range.length);
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

    this.updateToolbarPosition(textToolbar, toolbarBounds, this.quillInstance.container);
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
      { insert: 'Press Enter to create new blocks...', attributes: { 'block-div': true } }
    ]);

    return this.quillInstance;
  }

  private handleEnterKey(range: QuillRange): boolean {
    const currentSelection = this.quillInstance.getSelection();
    if (!currentSelection) return true;

    const [block, offset] = this.quillInstance.getLine(currentSelection.index);

    if (!block) return true;

    const blockLength = block.length();
    const blockIndex = this.quillInstance.getIndex(block);

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
  }

  deleteImage() {
  }
}
