import { Injectable, ComponentRef, createComponent, ApplicationRef, Injector, Type } from '@angular/core';
import Quill from 'quill';
import { QuillRange } from '../models/quill-range.model';
import { ToolbarBounds } from '../models/toolbar-bounds.model';
import { ImageToolbarComponent } from '../components/image-toolbar.component';

@Injectable({
  providedIn: 'root'
})
export class QuillToolbarService {
  private selectedImage: HTMLImageElement | null = null;
  private activeToolbarRef: ComponentRef<any> | null = null;

  private toolbarMap: Record<string, Type<any>> = {
    'img': ImageToolbarComponent,
  };

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  updateToolbarVisibility(
    quill: Quill,
    range: QuillRange | null, 
    textToolbar: HTMLElement, 
    imageToolbar: HTMLElement
  ) {
    if (!range) {
      this.hideAllToolbars(textToolbar, imageToolbar);
      return;
    }

    const [leaf] = quill.getLeaf(range.index);
    
    if (leaf?.domNode instanceof HTMLImageElement && range.length === 0) {
      this.showImageToolbar(quill, leaf.domNode, imageToolbar, textToolbar);
    } else if (range.length > 0) {
      this.showTextToolbar(quill, range, textToolbar, imageToolbar);
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
    quill: Quill,
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
    const editorBounds = quill.container.getBoundingClientRect();

    const toolbarBounds: ToolbarBounds = {
      top: bounds.top - editorBounds.top + window.scrollY,
      left: bounds.left - editorBounds.left,
      width: bounds.width,
      height: bounds.height
    };

    this.updateToolbarPosition(imageToolbar, toolbarBounds, quill.container);
  }

  showTextToolbar(
    quill: Quill,
    range: QuillRange,
    textToolbar: HTMLElement,
    imageToolbar: HTMLElement
  ) {
    imageToolbar.style.display = 'none';

    const bounds = quill.getBounds(range.index, range.length);
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

    this.updateToolbarPosition(textToolbar, toolbarBounds, quill.container);
  }

  showToolbar2(type: string, bounds?: { top: number; left: number }) {
    this.hideActiveToolbar();
    
    const ToolbarComponent = this.toolbarMap[type];
    if (!ToolbarComponent) {
      console.error(`No toolbar component found for type: ${type}`);
      return;
    }

    const componentRef = createComponent(ToolbarComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector
    });

    if (bounds) {
      componentRef.instance.position = {
        top: bounds.top,
        left: bounds.left
      };
    }

    if (type === 'img') {
      const imageElements = document.querySelectorAll('img');
      imageElements.forEach(img => {
        const imgBounds = img.getBoundingClientRect();
        if (Math.abs(imgBounds.top - bounds?.top!) < 10 && 
            Math.abs(imgBounds.left - bounds?.left!) < 10) {
          this.selectImage(img as HTMLImageElement);
        }
      });
    }

    const domElem = componentRef.location.nativeElement;
    document.body.appendChild(domElem);

    this.activeToolbarRef = componentRef;
    componentRef.changeDetectorRef.detectChanges();
  }

  hideActiveToolbar() {
    if (this.activeToolbarRef) {
      const element = this.activeToolbarRef.location.nativeElement;
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.activeToolbarRef.destroy();
      this.activeToolbarRef = null;
      this.deselectImage();
    }
  }

  private selectImage(image: HTMLImageElement) {
    if (this.selectedImage) {
      this.selectedImage.style.border = '';
      this.selectedImage.style.borderRadius = '';
    }
    this.selectedImage = image;
    this.selectedImage.style.border = '2px solid #06c';
    this.selectedImage.style.borderRadius = '4px';
  }

  private deselectImage() {
    if (this.selectedImage) {
      this.selectedImage.style.border = '';
      this.selectedImage.style.borderRadius = '';
      this.selectedImage = null;
    }
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

  getSelectedImage(): HTMLImageElement | null {
    return this.selectedImage;
  }
} 