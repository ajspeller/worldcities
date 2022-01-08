import { Component, OnInit } from '@angular/core';
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

import { ApiResult } from './../../_base/base.service';
import { BaseFormComponent } from './../../_base/base.form.component';

import { Country } from './../../_models/country';
import { City } from './../../_models/city';
import { CityService } from './../../_services/city.service';

@Component({
  selector: 'app-city-edit',
  templateUrl: './city-edit.component.html',
  styleUrls: ['./city-edit.component.css'],
})
export class CityEditComponent extends BaseFormComponent implements OnInit {
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
    private cityService: CityService
  ) {
    super();
  }

  ngOnInit() {
    this.initializeForm();
    this.loadData();
  }

  initializeForm() {
    const validators = [
      Validators.required,
      Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4})?$/),
    ];
    this.form = new FormGroup(
      {
        name: new FormControl('', Validators.required),
        lat: new FormControl('', validators),
        lon: new FormControl('', validators),
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
      this.cityService.get<City>(this.id).subscribe(
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
    this.cityService
      .getCountries<ApiResult<Country>>(0, 9999, 'name', null, null, null)
      .subscribe(
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
    this.cityService.post<City>(city).subscribe(
      (result) => {
        console.log(`City ${city.id} has been created.`);

        // go back to the cities view
        this.router.navigate(['/cities']);
      },
      (error) => console.error(error)
    );
  }

  private editCity(city: City) {
    this.cityService.put<City>(city).subscribe(
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

      return this.cityService.isDupeCity(city).pipe(
        map((result) => {
          return result ? { isDupeCity: true } : null;
        })
      );
    };
  }
}
