import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';

import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { City } from '../_models/city';

@Component({
  selector: 'app-cities',
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.css'],
})
export class CitiesComponent implements OnInit {
  public displayedColumns: string[] = ['id', 'name', 'lat', 'lon'];

  public cities: MatTableDataSource<City>;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string
  ) {}

  ngOnInit() {
    const pe = this.createPageEvent();
    this.getCities(pe);
  }

  private createPageEvent(): PageEvent {
    const pageEvent = new PageEvent();
    pageEvent.pageIndex = 0;
    pageEvent.pageSize = 10;
    return pageEvent;
  }

  getCities(event: PageEvent) {
    const url = `${this.baseUrl}api/Cities`;
    const params = new HttpParams()
      .set('pageIndex', event.pageIndex.toString())
      .set('pageSize', event.pageSize.toString());

    this.http.get<any>(url, { params }).subscribe(
      (result) => {
        const { totalCount, pageIndex, pageSize, data } = result;
        this.paginator.length = totalCount;
        this.paginator.pageIndex = pageIndex;
        this.paginator.pageSize = pageSize;
        this.cities = new MatTableDataSource<City>(data);
      },
      (error) => console.error(error)
    );
  }
}
