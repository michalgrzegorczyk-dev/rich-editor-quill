import {Injectable, ApplicationRef, ComponentRef, createComponent, Injector,} from '@angular/core';
import {SlashMenuComponent} from '../features/slash-menu/slash-menu.component';

interface MenuPosition {
  top: number;
  left: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuillSlashMenuService {
  private slashMenuRef: ComponentRef<SlashMenuComponent> | null = null;

  private activeToolbarRef: ComponentRef<any> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector,
  ) {
  }

  showMenu(bounds: { top: number; left: number; height: number }, index: number) {
    const componentRef = createComponent(SlashMenuComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector
    });

    const position: MenuPosition = {
      top: bounds.top + bounds.height,
      left: bounds.left
    };

    componentRef.instance.setPosition(position);

    componentRef.instance.optionSelected.subscribe((option: string) => {
      console.log('Option selected:', option);
    });

    this.slashMenuRef = componentRef;

    if (bounds) {
      componentRef.instance.setPosition(position);
    }
    const domElem = componentRef.location.nativeElement;
    document.body.appendChild(domElem);

    this.activeToolbarRef = componentRef;
    componentRef.changeDetectorRef.detectChanges();
  }

  destroyMenu() {
    if (this.activeToolbarRef) {
      const element = this.activeToolbarRef.location.nativeElement;
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.activeToolbarRef.destroy();
      this.activeToolbarRef = null;
    }
  }
}
