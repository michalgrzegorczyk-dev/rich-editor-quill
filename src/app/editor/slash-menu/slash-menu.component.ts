import { Component, EventEmitter, Output, signal } from '@angular/core';

@Component({
  selector: 'app-slash-menu',
  standalone: true,
  templateUrl: './slash-menu.component.html',
  styleUrls: ['./slash-menu.component.scss']
})
export class SlashMenuComponent {
  @Output() optionSelected = new EventEmitter<string>();
  
  private _filter = signal('');
  menuPosition = signal({ top: 0, left: 0 });
  
  options = ['Option 1', 'Option 2', 'Option 3'];
  filteredOptions = signal(this.options);

  set filter(value: string) {
    this._filter.set(value);
    this.updateFilteredOptions();
  }

  onOptionSelect(option: string) {
    console.log('Option selected:', option);
    this.optionSelected.emit(option);
  }

  private updateFilteredOptions() {
    const filterText = this._filter().toLowerCase().replace('/', '').trim();
    console.log('Filtering with:', filterText);
    
    if (!filterText) {
      this.filteredOptions.set(this.options);
      return;
    }

    const filtered = this.options.filter(option => 
      option.toLowerCase().includes(filterText)
    );
    console.log('Filtered options:', filtered);
    this.filteredOptions.set(filtered);
  }

  setPosition(value: { top: number; left: number }) {
    this.menuPosition.set(value);
  }
} 