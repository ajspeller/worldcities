import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';

import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { Country } from '../_models/country';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.css']
})
export class CountriesComponent implements OnInit {
  public displayedColumns: string[] = ['id', 'name', 'iso2', 'iso3'];
  public cities: MatTableDataSource<Country>;

  defaultPageIndex = 0;
  defaultPageSize = 10;
  public defaultSortColumn = 'name';
  public defaultSortOrder = 'asc';

  defaultFilterColumn = 'name';
  filterQuery: string = null;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string
  ) {}

  ngOnInit() {
    this.initialize(null);
  }

  initialize(query: string = null) {
    const pageEvent = new PageEvent();
    pageEvent.pageIndex = this.defaultPageIndex;
    pageEvent.pageSize = this.defaultPageSize;
    if (query) {
      this.filterQuery = query;
    }
    this.getCountries(pageEvent);
  }

  getCountries(event: PageEvent) {
    const url = `${this.baseUrl}api/Countries`;
    let params = new HttpParams()
      .set('pageIndex', event.pageIndex.toString())
      .set('pageSize', event.pageSize.toString())
      .set('sortColumn', this.sort ? this.sort.active : this.defaultSortColumn)
      .set(
        'sortOrder',
        this.sort ? this.sort.direction : this.defaultSortOrder
      );

    if (this.filterQuery) {
      params = params
        .set('filterColumn', this.defaultFilterColumn)
        .set('filterQuery', this.filterQuery);
    }

    this.http.get<any>(url, { params }).subscribe(
      (result) => {
        const { totalCount, pageIndex, pageSize, data } = result;
        this.paginator.length = totalCount;
        this.paginator.pageIndex = pageIndex;
        this.paginator.pageSize = pageSize;
        this.cities = new MatTableDataSource<Country>(data);
      },
      (error) => console.error(error)
    );
  }
}