import {Injectable, ComponentRef, createComponent, ApplicationRef, Injector, Type, inject} from '@angular/core';
import { ImageToolbarComponent } from '../image/toolbar/image-toolbar.component';
import { TextToolbarComponent } from '../text/toolbar/text-toolbar.component';
import {QuillBounds} from "../../models/quill-custom.models";
import {Toolbar} from "./toolbar.models";
import {Overlay, OverlayConfig} from "@angular/cdk/overlay";
import {ComponentPortal} from "@angular/cdk/portal";
import {QuillInstanceService} from "../../config/quill-instance.service";

@Injectable({
  providedIn: 'root'
})
export class ToolbarManagerService {
  private activeToolbarRef: ComponentRef<any> | null = null;
  activeOverlayRef:any = null;
  private readonly toolbarsMap: Record<Toolbar, Type<any>> = {
    [Toolbar.IMG]: ImageToolbarComponent,
    [Toolbar.TXT]: TextToolbarComponent
  };

  private readonly injector = inject(Injector);
  private readonly overlay = inject(Overlay);

  showToolbar(type: Toolbar, bounds? :QuillBounds, element?:HTMLElement | null): void {
    this.destroyActiveToolbar();

    if (!element || !element.parentElement || !bounds) {
      return;
    }

    const componentRef = this.createToolbarComponent(type, element.parentElement, bounds);

    componentRef.changeDetectorRef.detectChanges();
  }

  destroyActiveToolbar() {
    if (this.activeOverlayRef) {
      this.activeOverlayRef.dispose();
      this.activeOverlayRef = null;
    }

    if (this.activeToolbarRef) {
      const element = this.activeToolbarRef.location.nativeElement;
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.activeToolbarRef.destroy();
      this.activeToolbarRef = null;
    }
  }

  private createToolbarComponent(type: Toolbar, blockElement: HTMLElement, bounds: QuillBounds) {
    const ToolbarComponent = this.toolbarsMap[type];

    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(blockElement)
      .withPositions([
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
          offsetX: (bounds.left - blockElement.offsetLeft) / 2
        },
      ])
      .withPush(true);

    const overlayConfig = new OverlayConfig({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close({
        threshold: 170,
      })
    });

    this.activeOverlayRef = this.overlay.create(overlayConfig);

    const portal = new ComponentPortal(ToolbarComponent, null, this.injector);
    return this.activeOverlayRef.attach(portal);
  }
}
