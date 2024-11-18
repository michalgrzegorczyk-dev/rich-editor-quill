import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slash-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="slash-popup" 
         [style.top.px]="top" 
         [style.left.px]="left"
         [style.position]="'absolute'"
         [style.zIndex]="9999">
      <div *ngFor="let option of options" 
           class="slash-item"
           (mousedown)="selectOption(option)">
        {{ option }}
      </div>
    </div>
  `,
  styles: [`
    .slash-popup {
      position: absolute;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      min-width: 150px;
      padding: 4px 0;
    }

    .slash-item {
      padding: 8px 12px;
      cursor: pointer;
      color: #333;
      font-size: 14px;
    }

    .slash-item:hover {
      background: #f0f0f0;
    }
  `]
})
export class SlashMenuComponent {
  @Input() top = 0;
  @Input() left = 0;
  @Input() options: string[] = [];
  @Output() optionSelected = new EventEmitter<string>();
  @Output() closeMenu = new EventEmitter<void>();
  
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges() {
    this.cdr.detectChanges();
  }
  
  selectOption(option: string) {
    console.log('Selected option:', option);
    this.optionSelected.emit(option);
  }
} 