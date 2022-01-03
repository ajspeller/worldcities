import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';

import { MatPaginator } from '@angular/material/paginator';
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

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string
  ) {}

  ngOnInit() {
    this.getCities();
  }

  getCities() {
    this.http.get<City[]>(`${this.baseUrl}api/Cities`).subscribe(
      (cities) => {
        this.cities = new MatTableDataSource<City>(cities);
        this.cities.paginator = this.paginator;
      },
      (error) => console.log(error)
    );
  }
}
