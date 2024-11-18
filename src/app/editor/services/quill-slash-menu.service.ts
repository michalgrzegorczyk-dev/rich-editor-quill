import { Injectable, ApplicationRef, ComponentRef, createComponent, EmbeddedViewRef, Injector } from '@angular/core';
import Quill from 'quill';
import { SlashMenuComponent } from '../features/slash-menu/slash-menu.component';

interface MenuPosition {
  top: number;
  left: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuillSlashMenuService {
  private quillInstance!: Quill;
  private slashMenuRef: ComponentRef<SlashMenuComponent> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  initialize(quill: Quill) {
    this.quillInstance = quill;
  }

  showMenu(bounds: { top: number; left: number; height: number }, index: number) {
    this.hideMenu();

    const componentRef = createComponent(SlashMenuComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector
    });
    
    const position: MenuPosition = {
      top: bounds.top + bounds.height,
      left: bounds.left
    };
    
    componentRef.instance.setPosition(position);

    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0];
    this.quillInstance.container.appendChild(domElem);
    componentRef.changeDetectorRef.detectChanges();

    let lastKnownSelection = this.quillInstance.getSelection();

    const textChangeHandler = () => {
      const selection = this.quillInstance.getSelection();
      if (!selection) return;

      lastKnownSelection = selection;
      const [line] = this.quillInstance.getLine(selection.index);
      if (!line) return;

      const text = line.domNode.textContent || '';
      
      if (!text.includes('/')) {
        this.quillInstance.off('text-change', textChangeHandler);
        this.hideMenu();
        return;
      }

      componentRef.instance.filter = text;
      componentRef.changeDetectorRef.detectChanges();
    };

    this.quillInstance.on('text-change', textChangeHandler);

    const subscription = componentRef.instance.optionSelected.subscribe((option: string) => {
      if (lastKnownSelection) {
        const [line] = this.quillInstance.getLine(lastKnownSelection.index);
        if (line) {
          const lineIndex = this.quillInstance.getIndex(line);
          const lineLength = line.length();
          
          this.quillInstance.deleteText(lineIndex, lineLength);
          this.quillInstance.insertText(lineIndex, option);
          this.quillInstance.formatLine(lineIndex, option.length, 'block-div', true);
          this.quillInstance.setSelection(lineIndex + option.length, 0);
        }
      }
    
      this.quillInstance.off('text-change', textChangeHandler);
      subscription.unsubscribe();
      this.hideMenu();
    });

    this.slashMenuRef = componentRef;
  }

  private hideMenu() {
    if (this.slashMenuRef) {
      this.quillInstance.off('text-change');
      const domElem = (this.slashMenuRef.hostView as EmbeddedViewRef<any>).rootNodes[0];
      if (domElem.parentNode) {
        domElem.parentNode.removeChild(domElem);
      }
      this.slashMenuRef.destroy();
      this.slashMenuRef = null;
    }
  }
} 