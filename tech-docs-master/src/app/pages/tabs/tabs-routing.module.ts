import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('src/app/pages/home/home.module').then(
            (res) => res.HomePageModule
          ),
      },
      {
        path: 'search',
        loadChildren: () =>
          import('src/app/pages/search/search.module').then(
            (res) => res.SearchPageModule
          ),
      },
      {
        path: 'folder',
        loadChildren: () =>
          import('src/app/pages/folder/folder.module').then(
            (res) => res.FolderPageModule
          ),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('src/app/pages/profile/profile.module').then(
            (res) => res.ProfilePageModule
          ),
      },
    ],
  },

  {
    path: '',
    redirectTo: 'tabs/home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
