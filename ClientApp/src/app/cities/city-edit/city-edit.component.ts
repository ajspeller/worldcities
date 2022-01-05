import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Country } from 'src/app/_models/country';
import { City } from './../../_models/city';

@Component({
  selector: 'app-city-edit',
  templateUrl: './city-edit.component.html',
  styleUrls: ['./city-edit.component.css'],
})
export class CityEditComponent implements OnInit {
  // the view title
  title: string;

  // the form model
  form: FormGroup;

  // the city object to edit or create
  city: City;

  // the city object id, as fetched from the active route:  It's NULL when we're adding a new city,
  // and NOT NULL when we're editing an existing one.
  id?: number;

  // the countries array for the select
  countries: Country[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadData();
  }

  initializeForm() {
    this.form = new FormGroup(
      {
        name: new FormControl('', Validators.required),
        lat: new FormControl('', Validators.required),
        lon: new FormControl('', Validators.required),
        countryId: new FormControl('', Validators.required),
      },
      null,
      this.isDupeCity()
    );
  }

  loadData() {
    // load countries
    this.loadCountries();

    // retrieve the ID from the 'id' parameter
    this.id = +this.activatedRoute.snapshot.paramMap.get('id');

    if (this.id) {
      // fetch the city from the server
      const url = `${this.baseUrl}api/Cities/${this.id}`;
      this.http.get<City>(url).subscribe(
        (fetchedCity) => {
          this.city = fetchedCity;
          this.title = `Edit - ${this.city.name}`;

          // update the form with the city value
          this.form.patchValue(this.city);
        },
        (error) => console.error(error)
      );
    } else {
      // Add new mode

      this.title = 'Create a new City';
    }
  }
  loadCountries() {
    // fetch all of the countries from the server
    const url = `${this.baseUrl}api/Countries`;

    const params = new HttpParams()
      .set('pageIndex', '0')
      .set('pageSize', '9999')
      .set('sortColumn', 'name');

    this.http.get<any>(url, { params }).subscribe(
      (fetchedCountries) => {
        this.countries = fetchedCountries.data;
      },
      (error) => console.log(error)
    );
  }

  fetchFormValue(name: string): string {
    return this.form.get(name).value;
  }

  onSubmit() {
    const city = this.id ? this.city : <City>{};

    city.name = this.fetchFormValue('name');
    city.lat = +this.fetchFormValue('lat');
    city.lon = +this.fetchFormValue('lon');
    city.countryId = +this.fetchFormValue('countryId');

    if (this.id) {
      this.editCity(city);
    } else {
      // ADD NEW MODE

      this.addCity(city);
    }
  }

  private addCity(city: City) {
    const url = `${this.baseUrl}api/Cities`;

    this.http.post<City>(url, city).subscribe(
      (result) => {
        console.log(`City ${city.id} has been created.`);

        // go back to the cities view
        this.router.navigate(['/cities']);
      },
      (error) => console.error(error)
    );
  }

  private editCity(city: City) {
    const url = `${this.baseUrl}api/Cities/${this.city.id}`;
    this.http.put<City>(url, city).subscribe(
      (result) => {
        console.log(`City ${city.id} has been updated.`);

        // go back to the cities view
        this.router.navigate(['/cities']);
      },
      (error) => console.error(error)
    );
  }

  isDupeCity(): AsyncValidatorFn {
    return (
      control: AbstractControl
    ): Observable<{ [key: string]: any } | null> => {
      const city = {} as City;
      city.id = this.id ? this.id : 0;
      city.name = this.form.get('name').value;
      city.lat = +this.form.get('lat').value;
      city.lon = +this.form.get('lon').value;
      city.countryId = +this.form.get('countryId').value;

      const url = `${this.baseUrl}api/Cities/IsDupeCity`;
      return this.http.post<boolean>(url, city).pipe(
        map((result) => {
          return result ? { isDupeCity: true } : null;
        })
      );
    };
  }
}
