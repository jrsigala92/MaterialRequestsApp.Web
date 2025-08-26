import { Routes } from '@angular/router';
import { StoreCodeEntryComponent } from './features/store-code-entry/store-code-entry';
import { ProductListComponent as ProductCaptureComponent } from './features/product-list/product-list';
import { ConfirmationScreenComponent } from './features/confirmation-screen/confirmation-screen';
import { OrderList } from './features/order-list/order-list';
import { CategoryListComponent } from './features/categories/category-list/category-list';
import { CategoryFormComponent } from './features/categories/category-form.ts/category-form';
import { ProductFormComponent } from './features/products/product-form/product-form';
import { ProductListComponent } from './features/products/product-list/product-list';
import { StoreListComponent } from './features/stores/store-list/store-list';
import { StoreFormComponent } from './features/stores/form/store-form';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
  { path: '', redirectTo: 'store-code', pathMatch: 'full' },
  { path: 'store-code', component: StoreCodeEntryComponent },
  { path: 'order/:storeCode', component: ProductCaptureComponent },
  { path: 'order/edit/:storeId/:id', component: ProductCaptureComponent, canActivate: [authGuard] },
  { path: 'order/confirmation/:id', component: ConfirmationScreenComponent },
  { path: 'orders/list', component:OrderList, canActivate: [authGuard] },
  // { path: 'orders/:id', component: OrderDetailComponent },
  { path: 'categories', component: CategoryListComponent, canActivate: [authGuard] },
  { path: 'categories/new', component: CategoryFormComponent, canActivate: [authGuard] },
  { path: 'categories/:id/edit', component: CategoryFormComponent, canActivate: [authGuard] },
  { path: 'products', component: ProductListComponent, canActivate: [authGuard] },
  { path: 'products/new', component: ProductFormComponent, canActivate: [authGuard] },
  { path: 'products/:id/edit', component: ProductFormComponent, canActivate: [authGuard] },
  { path: 'stores', component: StoreListComponent, canActivate: [authGuard] },
  { path: 'stores/new', component: StoreFormComponent, canActivate: [authGuard] },
  { path: 'stores/:id/edit', component: StoreFormComponent, canActivate: [authGuard] },

  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent, canActivate: [authGuard] },
];
