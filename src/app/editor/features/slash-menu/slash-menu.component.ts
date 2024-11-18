import { Component, EventEmitter, Output, signal } from '@angular/core';
import { MenuPosition } from '../../models/menu-position.model';

@Component({
  selector: 'app-slash-menu',
  standalone: true,
  templateUrl: './slash-menu.component.html',
  styleUrls: ['./slash-menu.component.scss']
})
export class SlashMenuComponent {
  @Output() optionSelected = new EventEmitter<string>();
  
  private _filter = signal('');
  menuPosition = signal<MenuPosition>({ top: 0, left: 0 });
  
  options = ['Option 1', 'Option 2', 'Option 3'];
  filteredOptions = signal(this.options);

  set filter(value: string) {
    this._filter.set(value);
    this.updateFilteredOptions();
  }

  onOptionSelect(option: string) {
    this.optionSelected.emit(option);
  }

  private updateFilteredOptions() {
    const filterText = this._filter().toLowerCase().replace('/', '').trim();
    
    this.filteredOptions.set(
      filterText ? this.options.filter(option => 
        option.toLowerCase().includes(filterText)
      ) : this.options
    );
  }

  setPosition(position: MenuPosition) {
    this.menuPosition.set(position);
  }
} 