import { Component, Input, Output, EventEmitter, TemplateRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GridColumn {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  class?: string;
}

export interface GridConfig {
  columns: GridColumn[];
  responsive?: {
    mobile?: string[];
    tablet?: string[];
  };
  showHeader?: boolean;
  hoverable?: boolean;
  selectable?: boolean;
  showScrollbar?: boolean;
}

@Component({
  selector: 'app-base-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid-container" [class]="containerClass">
      <!-- Header -->
      <div class="grid-header" *ngIf="config.showHeader !== false" [style.grid-template-columns]="getGridColumns()">
        <div 
          *ngFor="let column of config.columns" 
          class="header-cell"
          [class]="column.class"
          (click)="onHeaderClick(column)"
          [class.sortable]="column.sortable">
          {{ column.label }}
          <span *ngIf="column.sortable && sortColumn === column.key" class="sort-indicator">
            {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </span>
        </div>
      </div>

      <!-- Body -->
      <div class="grid-body" [class.no-scrollbar]="config.showScrollbar === false">
        <div 
          *ngFor="let item of sortedData; let i = index; trackBy: trackByFn" 
          class="grid-row"
          [style.grid-template-columns]="getGridColumns()"
          [class.hoverable]="config.hoverable"
          [class.selectable]="config.selectable"
          [class.selected]="selectedItems.has(item)"
          (click)="onRowClick(item, i)">
          
          <div 
            *ngFor="let column of config.columns" 
            class="grid-cell"
            [class]="column.class">
            <ng-container *ngTemplateOutlet="cellTemplate; context: { 
              $implicit: item, 
              column: column, 
              value: getColumnValue(item, column.key),
              index: i 
            }">
            </ng-container>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!data || data.length === 0">
        <ng-container *ngTemplateOutlet="emptyTemplate || defaultEmptyTemplate">
        </ng-container>
      </div>
    </div>

    <!-- Default Empty Template -->
    <ng-template #defaultEmptyTemplate>
      <div class="default-empty">
        <p>No data available</p>
      </div>
    </ng-template>
  `,
  styleUrl: './base-grid.component.css'
})
export class BaseGridComponent {
  @Input() data: any[] = [];
  @Input() config!: GridConfig;
  @Input() containerClass = '';
  @Input() trackByFn: (index: number, item: any) => any = (index, item) => item.id || index;

  @ContentChild('cellTemplate', { static: false }) cellTemplate!: TemplateRef<any>;
  @ContentChild('emptyTemplate', { static: false }) emptyTemplate!: TemplateRef<any>;

  @Output() rowClick = new EventEmitter<{ item: any, index: number }>();
  @Output() headerClick = new EventEmitter<GridColumn>();
  @Output() sortChange = new EventEmitter<{ column: string, direction: 'asc' | 'desc' }>();

  selectedItems = new Set<any>();
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  sortedData: any[] = [];

  ngOnInit() {
    this.sortedData = [...this.data];
  }

  ngOnChanges() {
    this.applySorting();
  }

  getGridColumns(): string {
    return this.config.columns
      .map(col => col.width || '1fr')
      .join(' ');
  }

  getColumnValue(item: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], item);
  }

  onHeaderClick(column: GridColumn) {
    this.headerClick.emit(column);
    
    if (column.sortable) {
      if (this.sortColumn === column.key) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column.key;
        this.sortDirection = 'asc';
      }
      
      this.applySorting();
      this.sortChange.emit({ column: column.key, direction: this.sortDirection });
    }
  }

  onRowClick(item: any, index: number) {
    if (this.config.selectable) {
      if (this.selectedItems.has(item)) {
        this.selectedItems.delete(item);
      } else {
        this.selectedItems.add(item);
      }
    }
    
    this.rowClick.emit({ item, index });
  }

  private applySorting() {
    if (!this.sortColumn) {
      this.sortedData = [...this.data];
      return;
    }

    this.sortedData = [...this.data].sort((a, b) => {
      const aVal = this.getColumnValue(a, this.sortColumn);
      const bVal = this.getColumnValue(b, this.sortColumn);
      
      if (aVal === bVal) return 0;
      
      const comparison = aVal > bVal ? 1 : -1;
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }
}
