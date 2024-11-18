import { Injectable, NgZone, ApplicationRef, ComponentRef, createComponent, EmbeddedViewRef, Injector } from '@angular/core';
import { SlashMenuComponent } from './slash-menu/slash-menu.component';
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
  private slashMenuRef: ComponentRef<SlashMenuComponent> | null = null;

  constructor(
    private ngZone: NgZone,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  initialize(editorElement: HTMLElement, textToolbar: HTMLElement, imageToolbar: HTMLElement) {
    this.registerCustomBlots();
    this.initializeQuill(editorElement, textToolbar);
    
    this.quillInstance.on('selection-change', (range: QuillRange | null) => {
      this.ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => {
          this.updateToolbarVisibility(range, textToolbar, imageToolbar);
        });
      });
    });

    this.quillInstance.root.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      if (target.tagName === 'IMG') {
        this.quillInstance.setSelection(null);
        
        this.ngZone.runOutsideAngular(() => {
          requestAnimationFrame(() => {
            const image = target as HTMLImageElement;
            this.showImageToolbar(image, imageToolbar, textToolbar);
          });
        });
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
        node.setAttribute('class', 'block');
        
        node.setAttribute('data-placeholder', 'Type "/" to run commands');
        return node;
      }

      static formats(node: HTMLElement) {
        return node.classList.contains('block') ? true : undefined;
      }

      static blotName = 'block-div';
      static tagName = 'div';
      static className = 'block';
    }

    Quill.register(BlockDiv, true);
  }

  private initializeQuill(editorElement: HTMLElement, toolbar: HTMLElement) {
    const options = {
      theme: 'snow',
      modules: {
        toolbar: toolbar,
        keyboard: {
          bindings: {
            enter: {
              key: 13,
              handler: this.handleEnterKey.bind(this)
            },
            slash: {
              key: 191,
              handler: () => {

                requestAnimationFrame(() => {
                  const selection = this.quillInstance.getSelection();
                  if (!selection) return true;
  
                  console.log(selection);
  
                  const [line] = this.quillInstance.getLine(selection.index);
                  if (!line || !line.domNode) return true;
  
                  console.log('line', line);
  
                  const text = line.domNode.textContent || '';
                  
                  console.log('tex',text);
  
                  if (text === '/') {
                    console.log('slash');
                    const bounds:any = this.quillInstance.getBounds(selection.index, 1);
                    this.showSlashMenu(bounds, selection.index);
                    return false;
                  }
                  return true;
                });
                
                return true;
              }
            }
          }
        }
      },
      formats: ['block-div', 'image', 'header', 'bold', 'italic', 'underline', 'code-block']
    };

    this.quillInstance = new Quill(editorElement, options);

    this.quillInstance.setContents([
      { 
        insert: 'xxxxxxxxxxxx xxxxxxxxxxxxxxxxxxx xxxxxxxxxxxxxxxx\n',
        attributes: { 'block-div': true }
      }
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
      this.quillInstance.insertText(blockIndex + blockLength, '\n');
      this.quillInstance.formatLine(blockIndex + blockLength + 1, 1, 'block-div', true);
      const [newBlock] = this.quillInstance.getLine(blockIndex + blockLength + 1);
      if (newBlock && newBlock.domNode) {
        newBlock.domNode.setAttribute('data-placeholder', 'Type "/" to run commands');
      }
      this.quillInstance.setSelection(blockIndex + blockLength + 1, 0);
    } else {
      const textContent = block.domNode.textContent || '';
      const remainingText = textContent.slice(offset);
      
      this.quillInstance.deleteText(currentSelection.index, remainingText.length);
      this.quillInstance.insertText(blockIndex + offset, '\n');
      this.quillInstance.insertText(blockIndex + offset + 1, remainingText);
      this.quillInstance.formatLine(blockIndex + offset + 1, remainingText.length + 1, 'block-div', true);
      const [newBlock] = this.quillInstance.getLine(blockIndex + offset + 1);
      if (newBlock && newBlock.domNode) {
        newBlock.domNode.setAttribute('data-placeholder', 'Type "/" to run commands');
      }
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

  private showSlashMenu(bounds: any, index: number) {
    this.hideSlashMenu();

    const componentRef = createComponent(SlashMenuComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector
    });
    
    componentRef.instance.position = {
      top: bounds.top + bounds.height,
      left: bounds.left
    };
    componentRef.instance.filter = '/';

    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0];
    this.quillInstance.container.appendChild(domElem);

    componentRef.changeDetectorRef.detectChanges();

    // Updated text change handler
    const textChangeHandler = () => {
      const selection = this.quillInstance.getSelection();
      if (!selection) return;

      const [line] = this.quillInstance.getLine(selection.index);
      if (!line) return;

      const text = line.domNode.textContent || '';
      
      // Hide menu if slash is removed
      if (!text.includes('/')) {
        this.quillInstance.off('text-change', textChangeHandler);
        this.hideSlashMenu();
        return;
      }

      componentRef.instance.filter = text;
    };

    this.quillInstance.on('text-change', textChangeHandler);

    // Handle option selection
    const subscription = componentRef.instance.optionSelected.subscribe((option: string) => {
      console.log('Service received:', option);
      const selection = this.quillInstance.getSelection();
      if (selection) {
        const [line] = this.quillInstance.getLine(selection.index);
        if (line) {
          const lineIndex = this.quillInstance.getIndex(line);
          const text = line.domNode.textContent || '';
          
          requestAnimationFrame(() => {
            this.quillInstance.deleteText(lineIndex, text.length);
            this.quillInstance.insertText(lineIndex, 'done');
            this.quillInstance.setSelection(lineIndex + 4, 0);
          });
        }
      }

      this.quillInstance.off('text-change', textChangeHandler);
      subscription.unsubscribe();
      componentRef.destroy();
      if (domElem.parentNode) {
        domElem.parentNode.removeChild(domElem);
      }
      this.slashMenuRef = null;
    });

    const closeHandler = (e: MouseEvent) => {
      if (!domElem.contains(e.target as Node)) {
        subscription.unsubscribe();
        componentRef.destroy();
        if (domElem.parentNode) {
          domElem.parentNode.removeChild(domElem);
        }
        this.slashMenuRef = null;
        document.removeEventListener('click', closeHandler);
      }
    };

    document.addEventListener('click', closeHandler);

    this.slashMenuRef = componentRef;
  }

  private hideSlashMenu() {
    if (this.slashMenuRef) {
      const domElem = (this.slashMenuRef.hostView as EmbeddedViewRef<any>).rootNodes[0];
      if (domElem.parentNode) {
        domElem.parentNode.removeChild(domElem);
      }
      this.slashMenuRef.destroy();
      this.slashMenuRef = null;
    }
  }
}
