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
  private selectionState: 'text' | 'image' | 'none' = 'none';

  initialize(editorElement: HTMLElement, textToolbar: HTMLElement, imageToolbar: HTMLElement) {
    this.registerCustomBlots();
    this.initializeQuill(editorElement, textToolbar);
    
    // Handle selection changes
    this.quillInstance.on('selection-change', (range: QuillRange | null) => {
      requestAnimationFrame(() => {
        this.updateToolbarVisibility(range, textToolbar, imageToolbar);
      });
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
    
    if (leaf?.domNode instanceof HTMLImageElement) {
      this.showImageToolbar(leaf.domNode, imageToolbar, textToolbar);
    } else if (range.length > 0) {
      this.showTextToolbar(range, textToolbar, imageToolbar);
    } else {
      this.hideAllToolbars(textToolbar, imageToolbar);
    }
  }

  private hideAllToolbars(textToolbar: HTMLElement, imageToolbar: HTMLElement) {
    textToolbar.style.display = 'none';
    imageToolbar.style.display = 'none';
    this.selectionState = 'none';
  }

  private showImageToolbar(
    image: HTMLImageElement, 
    imageToolbar: HTMLElement, 
    textToolbar: HTMLElement
  ) {
    // Hide text toolbar
    textToolbar.style.display = 'none';

    // Get bounds and position image toolbar
    const bounds = image.getBoundingClientRect();
    const editorBounds = this.quillInstance.container.getBoundingClientRect();

    const toolbarBounds: ToolbarBounds = {
      top: bounds.top - editorBounds.top + window.scrollY,
      left: bounds.left - editorBounds.left,
      width: bounds.width,
      height: bounds.height
    };

    this.updateToolbarPosition(imageToolbar, toolbarBounds, this.quillInstance.container);
    this.selectionState = 'image';
  }

  private showTextToolbar(
    range: QuillRange,
    textToolbar: HTMLElement,
    imageToolbar: HTMLElement
  ) {
    // Hide image toolbar
    imageToolbar.style.display = 'none';

    // Get bounds and position text toolbar
    const bounds = this.quillInstance.getBounds(range.index, range.length);
    if (!bounds) {
      this.hideAllToolbars(textToolbar, imageToolbar);
      return;
    }

    const editorBounds = this.quillInstance.container.getBoundingClientRect();

    const toolbarBounds: ToolbarBounds = {
      top: bounds.top,
      left: bounds.left,
      width: bounds.width,
      height: bounds.height
    };

    this.updateToolbarPosition(textToolbar, toolbarBounds, this.quillInstance.container);
    this.selectionState = 'text';
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
            right: {
              key: 39,
              handler: (range: QuillRange) => {
                // console.log('right');
                // requestAnimationFrame(() => {
                  // const selection: any = this.quillInstance.getSelection();

                  // if (!selection) {
                  //   return true;
                  // }

                  // const [prevLeaf] = this.quillInstance.getLeaf(selection.index) as any;
                  
                  // if (prevLeaf?.parent?.formats()?.bold) {
                  //   console.log('bold');
                  // }

                  // console.log('prevLeaf', prevLeaf);


                  // return true;
                // });

                return true;
              }
            },
            left: {
              key: 37,
              handler: (range: QuillRange) => {
                // if (!range) return true;

                // const [currentLeaf] = this.quillInstance.getLeaf(range.index);
                // const prevLeaf = range.index > 0 ? this.quillInstance.getLeaf(range.index - 1)[0] : null;

                // // If we're after an image
                // if (prevLeaf?.domNode instanceof HTMLImageElement && !range.length) {
                //   // Select the image
                //   this.quillInstance.setSelection(range.index - 1, 1);
                //   return false;
                // }

                // // If an image is selected, move cursor before it
                // if (currentLeaf?.domNode instanceof HTMLImageElement && range.length === 1) {
                //   this.quillInstance.setSelection(range.index, 0);
                //   return false;
                // }

                return true;
              }
            }
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
