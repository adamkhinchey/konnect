import {Component, Input, OnInit, Output, EventEmitter, OnDestroy} from '@angular/core';
import {devLogger} from '../../utils';

@Component({
  selector: 'app-company-search',
  templateUrl: './company-search.component.html',
  styleUrls: ['./company-search.component.scss']
})
export class CompanySearchComponent implements OnInit, OnDestroy {

  @Output() searchChange = new EventEmitter<string>();
  search = '';
  lastSearch = '';

  constructor() {
  }

  ngOnInit(): void {
  }

  onChange(event: any): void {
    devLogger('log', {search: event});
    if (event.trim() !== this.lastSearch) {
      this.searchChange.emit(event.trim());
      this.lastSearch = event.trim();
    }
  }

  ngOnDestroy(): void {
  }

}
