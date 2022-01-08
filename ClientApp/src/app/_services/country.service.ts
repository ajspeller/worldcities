import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root',
})
export class CountryService extends BaseService {
  constructor(http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    super(http, baseUrl);
  }

  getData<ApiResult>(
    pageIndex: number,
    pageSize: number,
    sortColumn: string,
    sortOrder: string,
    filterColumn: string,
    filterQuery: string
  ): Observable<ApiResult> {
    const url = `${this.baseUrl}/api/Countries`;
    let params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString())
      .set('sortColumn', sortColumn)
      .set('sortOrder', sortOrder);

    if (filterQuery) {
      params = params
        .set('filterColumn', filterColumn)
        .set('filterQuery', filterQuery);
    }

    return this.http.get<ApiResult>(url, { params });
  }

  get<Country>(id: number): Observable<Country> {
    const url = `${this.baseUrl}api/Countries/${id}`;
    return this.http.get<Country>(url);
  }

  put<Country>(item): Observable<Country> {
    const url = `${this.baseUrl}api/Countries/${item.id}`;
    return this.http.put<Country>(url, item);
  }

  post<Country>(item): Observable<Country> {
    const url = `${this.baseUrl}api/Countries`;
    return this.http.post<Country>(url, item);
  }

  isDupeField(countryId, fieldName, fieldValue): Observable<boolean> {
    const params = new HttpParams()
      .set('countryId', countryId)
      .set('fieldName', fieldName)
      .set('fieldValue', fieldValue);

    const url = `${this.baseUrl}api/Countries/IsDupeField`;

    return this.http.post<boolean>(url, null, { params });
  }
}
