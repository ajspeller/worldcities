import { Component, OnInit, ViewChild } from '@angular/core';

import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { ApiResult } from '../_base/base.service';

import { City } from '../_models/city';
import { CityService } from '../_services/city.service';

@Component({
  selector: 'app-cities',
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.css'],
})
export class CitiesComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'lat', 'lon', 'countryName'];
  cities: MatTableDataSource<City>;

  defaultPageIndex = 0;
  defaultPageSize = 10;
  defaultSortColumn = 'name';
  defaultSortOrder = 'asc';

  defaultFilterColumn = 'name';
  filterQuery: string = null;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  filterTextChanged: Subject<string> = new Subject<string>();

  constructor(private cityService: CityService) {}

  ngOnInit() {
    this.initialize(null);
  }

  // debounce filter text changes
  onFilterTextChanged(filterText: string) {
    if (this.filterTextChanged.observers.length === 0) {
      this.filterTextChanged
        .pipe(debounceTime(1000), distinctUntilChanged())
        .subscribe((query: string) => this.initialize(query));
    }
    this.filterTextChanged.next(filterText);
  }

  initialize(query: string = null) {
    const pageEvent = new PageEvent();
    pageEvent.pageIndex = this.defaultPageIndex;
    pageEvent.pageSize = this.defaultPageSize;
    if (query) {
      this.filterQuery = query;
    }
    this.getCities(pageEvent);
  }

  getCities(event: PageEvent) {
    const sortColumn = this.sort ? this.sort.active : this.defaultSortColumn;
    const sortOrder = this.sort ? this.sort.direction : this.defaultSortOrder;
    const filterColumn = this.filterQuery ? this.defaultFilterColumn : null;
    const filterQuery = this.filterQuery ? this.filterQuery : null;
    this.cityService
      .getData<ApiResult<City>>(
        event.pageIndex,
        event.pageSize,
        sortColumn,
        sortOrder,
        filterColumn,
        filterQuery
      )
      .subscribe(
        (result) => {
          this.paginator.length = result.totalCount;
          this.paginator.pageIndex = result.pageIndex;
          this.paginator.pageSize = result.pageSize;
          this.cities = new MatTableDataSource<City>(result.data);
        },
        (error) => console.error(error)
      );
  }
}
