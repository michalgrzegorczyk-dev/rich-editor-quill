import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-text-toolbar',
  standalone: true,
  template: `
    <div class="floating-toolbar ql-toolbar ql-snow"
         [style.top.px]="getTopPosition()"
         [style.left.px]="getLeftPosition()">
      <span class="ql-formats">
        <select class="ql-header">
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option selected>Normal</option>
        </select>
      </span>
      <span class="ql-formats">
        <button class="ql-bold"></button>
        <button class="ql-italic"></button>
        <button class="ql-underline"></button>
      </span>
      <span class="ql-formats">
        <button class="ql-image"></button>
        <button class="ql-code-block"></button>
      </span>
    </div>
  `,
  styles: [`
    .floating-toolbar {
      position: absolute;
      display: block;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border: 1px solid #ccc;
      border-radius: 4px;
      z-index: 1000;
      padding: 8px;
    }

    .ql-toolbar.ql-snow .ql-formats {
      margin-right: 15px;
      display: inline-block;
    }

    .ql-toolbar.ql-snow button {
      background: none;
      border: none;
      cursor: pointer;
      display: inline-block;
      float: left;
      height: 24px;
      padding: 3px 5px;
      width: 28px;
      margin: 0 2px;
    }

    .ql-toolbar.ql-snow button:hover {
      color: #06c;
    }

    .ql-toolbar.ql-snow button.ql-active {
      color: #06c;
    }

    .ql-toolbar.ql-snow .ql-header {
      width: 120px;
      height: 24px;
      border: 1px solid #ccc;
      border-radius: 3px;
      background: white;
      cursor: pointer;
      padding: 0 5px;
    }
  `]
})
export class TextToolbarComponent {
  @Input() position?: { top: number; left: number };

  getTopPosition(): number {
    return (this.position?.top ?? 0) - 45;
  }

  getLeftPosition(): number {
    return (this.position?.left ?? 0) - 100;
  }
} 