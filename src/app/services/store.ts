// import { Injectable } from '@angular/core';
// import { Observable, of } from 'rxjs';
// import { delay } from 'rxjs/operators';

// export interface Product {
//   id: number;
//   name: string;
//   description: string;
//   quantity: number;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class Store {
//   // Simulated valid store codes (replace with actual API call)
//   private validStoreCodes = ['STORE1', 'STORE2', 'STORE3'];

//   // Simulated products (replace with actual API call)
//   private products: Product[] = [
//     { id: 1, name: 'Product 1', description: 'Description 1', quantity: 0 },
//     { id: 2, name: 'Product 2', description: 'Description 2', quantity: 0 },
//     { id: 3, name: 'Product 3', description: 'Description 3', quantity: 0 },
//   ];

//   constructor() { }

//   validateStoreCode(code: string): Observable<boolean> {
//     // Simulate API call
//     return of(this.validStoreCodes.includes(code.toUpperCase())).pipe(
//       delay(500) // Simulate network delay
//     );
//   }

//   getProducts(): Observable<Product[]> {
//     // Simulate API call
//     return of(this.products).pipe(
//       delay(500) // Simulate network delay
//     );
//   }
// }
