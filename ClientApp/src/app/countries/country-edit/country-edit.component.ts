import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CountryService } from 'src/app/_services/country.service';

import { BaseFormComponent } from './../../_base/base.form.component';
import { Country } from './../../_models/country';

@Component({
  selector: 'app-country-edit',
  templateUrl: './country-edit.component.html',
  styleUrls: ['./country-edit.component.css'],
})
export class CountryEditComponent extends BaseFormComponent implements OnInit {
  // the view title
  title: string;

  // the form model
  form: FormGroup;

  // the country object to edit or create
  country: Country;

  // the country object id, as fetched from the active route:
  // it's NULL when we're adding a new country
  // and NOT NULL when we're editing an existing one.
  id?: number;

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private countryService: CountryService
  ) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required, this.isDupeField('name')],
      iso2: [
        '',
        Validators.required,
        Validators.pattern(/^[a-zA-Z]{2}$/),
        this.isDupeField('iso2'),
      ],
      iso3: [
        '',
        Validators.required,
        Validators.pattern(/^[a-zA-Z]{3}$/),
        this.isDupeField('iso3'),
      ],
    });

    this.loadData();
  }

  loadData() {
    // retrieve the ID from the URL
    this.id = +this.activatedRoute.snapshot.paramMap.get('id');
    if (this.id) {
      // EDIT MODE

      // fetch the country from the server
      this.countryService.get<Country>(this.id).subscribe(
        (country) => {
          this.country = country;
          this.title = `Edit - ${this.country.name}`;

          // update the form with the country value
          this.form.patchValue(this.country);
        },
        (error) => console.error(error)
      );
    } else {
      // ADD NEW MODE

      this.title = 'Create a new Country';
    }
  }

  onSubmit() {
    const country = this.id ? this.country : <Country>{};

    country.name = this.form.get('name').value;
    country.iso2 = this.form.get('iso2').value;
    country.iso3 = this.form.get('iso3').value;

    if (this.id) {
      // EDIT MODE

      this.countryService.put<Country>(country).subscribe(
        (result) => {
          console.log(`Country ${country.id} has been updated`);

          // go back to the countries view
          this.router.navigate(['/countries']);
        },
        (error) => console.error(error)
      );
    } else {
      // ADD NEW MODE
      this.countryService.post<Country>(country).subscribe(
        (result) => {
          console.log(`Country ${result.id} has been created`);

          // go back to cities view
          this.router.navigate(['/countries']);
        },
        (error) => console.log(error)
      );
    }
  }

  isDupeField(fieldName: string): AsyncValidatorFn {
    return (
      control: AbstractControl
    ): Observable<{ [key: string]: any } | null> => {
      const countryId = this.id ? this.id.toString() : '0';

      return this.countryService
        .isDupeField(countryId, fieldName, control.value)
        .pipe(
          map((result) => {
            return result ? { isDupeField: true } : null;
          })
        );
    };
  }
}
