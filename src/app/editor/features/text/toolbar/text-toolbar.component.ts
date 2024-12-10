import {Component, Input, ChangeDetectorRef, ChangeDetectionStrategy} from '@angular/core';
import {QuillInstanceService} from "../../../config/quill-instance.service";
import {NgIf, NgForOf} from "@angular/common";
import {QuillBounds} from "../../../models/quill-custom.models";

@Component({
  selector: 'app-text-toolbar',
  standalone: true,
  templateUrl: './text-toolbar.component.html',
  styleUrl: './text-toolbar.component.scss',
  imports: [
    NgIf,
    NgForOf
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextToolbarComponent {
  @Input({required: true}) position?: QuillBounds;
  showColorPicker = false;
  showBgColorPicker = false;
  selectedColor = 'black';
  selectedBgColor = 'white';

  colors = ['black', 'red', 'blue', 'green', 'yellow', 'purple', 'cyan'];
  bgColors = ['black', 'red', 'blue', 'green', 'yellow', 'purple', 'cyan'];
  activeColor: string | null = null;
  activeBgColor: string | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private quillInstance: QuillInstanceService
  ) {}

  getTopPosition(): number {
    return this.position?.top ?? 0;
  }

  getLeftPosition(): number {
    return this.position?.left ?? 0;
  }

  isFormatActive(format: string): boolean {
    const formats = this.quillInstance.quill.getFormat();
    return !!formats[format];
  }

  toggleFormat(format: string): void {
    const formats = this.quillInstance.quill.getFormat();
    this.quillInstance.quill.format(format, !formats[format]);
    this.cdr.detectChanges();
  }

  handleHeaderChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    if (value === "Normal") {
      this.quillInstance.quill.format('block-div', true);
    } else {
      this.quillInstance.quill.format('header', parseInt(value));
    }
    this.cdr.detectChanges();
  }

  getCurrentHeader(): string {
    const formats = this.quillInstance.quill.getFormat();
    return formats['header'] ? formats['header'].toString() : 'Normal';
  }

  toggleColorPicker(): void {
    this.showColorPicker = !this.showColorPicker;
    this.showBgColorPicker = false;
    this.cdr.detectChanges();
  }

  toggleBgColorPicker(): void {
    this.showBgColorPicker = !this.showBgColorPicker;
    this.showColorPicker = false;
    this.cdr.detectChanges();
  }


  getCurrentColor(): string {
    const formats:any = this.quillInstance.quill.getFormat();
    return formats['color'] || this.selectedColor;
  }

  getCurrentBgColor(): string {
    const formats:any = this.quillInstance.quill.getFormat();
    return formats['background'] || this.selectedBgColor;
  }

  applyColor(color: string): void {
    const range = this.quillInstance.quill.getSelection();
    if (range) {
      this.quillInstance.quill.format('color', color);
      this.activeColor = color;
    }
    this.selectedColor = color;
    this.showColorPicker = false;
    this.cdr.detectChanges();
  }

  applyBgColor(color: string): void {
    const range = this.quillInstance.quill.getSelection();
    if (range) {
      this.quillInstance.quill.format('background', color);
      this.activeBgColor = color;
    }
    this.selectedBgColor = color;
    this.showBgColorPicker = false;
    this.cdr.detectChanges();
  }

  resetFormatting(): void {
    const range = this.quillInstance.quill.getSelection();
    if (range) {
      const formats = this.quillInstance.quill.getFormat();
      // Object.keys(formats).forEach(format => {
      //   this.quillInstance.quill.removeFormat(range.index, range.length);
      // });
      this.activeColor = null;
      this.activeBgColor = null;
      this.selectedColor = 'black';
      this.selectedBgColor = 'white';
      this.cdr.detectChanges();
    }
  }
}
