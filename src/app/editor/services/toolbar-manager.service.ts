import {Injectable, ComponentRef, createComponent, ApplicationRef, Injector, Type, inject} from '@angular/core';
import { ImageToolbarComponent } from '../features/image/toolbar/image-toolbar.component';
import { TextToolbarComponent } from '../features/text/toolbar/text-toolbar.component';

@Injectable({
  providedIn: 'root'
})
export class ToolbarManagerService {
  private selectedImage: HTMLImageElement | null = null;
  private activeToolbarRef: ComponentRef<any> | null = null;

  private toolbarMap: Record<string, Type<any>> = {
    'img': ImageToolbarComponent,
    'txt': TextToolbarComponent
  };

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector
  ) {
  }

  showToolbar(type: string, bounds?: { top: number; left: number } ) {
    this.destroyActiveToolbar();

    const ToolbarComponent = this.toolbarMap[type];

    const componentRef = createComponent(ToolbarComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector,
    });

    if (bounds) {
      componentRef.instance.position = bounds;
    }

    const domElem = componentRef.location.nativeElement;
    document.body.appendChild(domElem);

    this.activeToolbarRef = componentRef;
    componentRef.changeDetectorRef.detectChanges();
  }

  destroyActiveToolbar() {
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

  getSelectedImage(): HTMLImageElement | null {
    return this.selectedImage;
  }
}
