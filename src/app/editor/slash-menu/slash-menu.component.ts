import { Component, EventEmitter, Input, Output, ChangeDetectorRef, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Position } from '../models/position.model';

type SlashCommand = string;

@Component({
  selector: 'app-slash-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slash-menu.component.html',
  styleUrls: ['./slash-menu.component.scss']
})
export class SlashMenuComponent {
  private readonly SLASH_COMMANDS: SlashCommand[] = ['Option 1', 'Option 2'];
  private readonly searchQuery = signal<string>('/');
  private readonly cdr = inject(ChangeDetectorRef);

  readonly menuPosition = signal<Position>({ top: 0, left: 0 });
  
  readonly filteredOptions = computed(() => {
    const query = this.searchQuery();
    return this.shouldShowAllOptions(query) 
      ? this.SLASH_COMMANDS 
      : this.filterOptions(query);
  });

  @Output() readonly optionSelected = new EventEmitter<SlashCommand>();

  @Input()
  set position(value: Position) {
    this.menuPosition.set(value);
  }

  @Input()
  set filter(text: string) {
    this.searchQuery.set(text);
    this.cdr.detectChanges();
  }

  onOptionSelect(option: SlashCommand): void {
    this.optionSelected.emit(option);
  }

  private shouldShowAllOptions(query: string): boolean {
    return !query || query === '/';
  }

  private filterOptions(query: string): SlashCommand[] {
    const searchTerm = query.slice(1).toLowerCase();
    return this.SLASH_COMMANDS.filter(option => 
      option.toLowerCase().includes(searchTerm)
    );
  }
} 