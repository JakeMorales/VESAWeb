import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modern-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modern-pagination.component.html',
  styleUrl: './modern-pagination.component.css'
})
export class ModernPaginationComponent {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();

  prev() {
    if (this.page > 1) this.pageChange.emit(this.page - 1);
  }
  next() {
    if (this.page < this.totalPages) this.pageChange.emit(this.page + 1);
  }
}
