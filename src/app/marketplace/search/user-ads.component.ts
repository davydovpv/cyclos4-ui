import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { AdResult, UserAdsDataForSearch } from 'app/api/models';
import { MarketplaceService } from 'app/api/services';
import { BaseSearchPageComponent } from 'app/shared/base-search-page.component';
import { ResultType } from 'app/shared/result-type';
import { cloneDeep } from 'lodash';
import { words } from 'app/shared/helper';
import { MAX_SIZE_SHORT_NAME } from 'app/users/profile/view-profile.component';

/**
 * Lists the advertisements of a given user
 */
@Component({
  selector: 'user-ads',
  templateUrl: 'user-ads.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserAdsComponent
  extends BaseSearchPageComponent<UserAdsDataForSearch, AdResult>
  implements OnInit {

  private user: string;
  shortName: string;

  constructor(
    injector: Injector,
    private marketplaceService: MarketplaceService
  ) {
    super(injector);
  }

  protected getFormControlNames() {
    return ['keywords', 'user'];
  }

  getInitialResultType() {
    return ResultType.TILES;
  }

  ngOnInit() {
    super.ngOnInit();
    this.user = this.route.snapshot.paramMap.get('user');
    this.allowedResultTypes = [ResultType.TILES, ResultType.LIST];
    this.marketplaceService.getUserAdsDataForSearch({ user: this.user }).subscribe(data => this.data = data);
  }

  onDataInitialized(data: UserAdsDataForSearch) {
    super.onDataInitialized(data);
    this.shortName = words(data.user.display, MAX_SIZE_SHORT_NAME);
  }

  doSearch(value) {
    const params = cloneDeep(value) as MarketplaceService.SearchUserAdsParams;
    params.user = this.user;
    return this.marketplaceService.searchUserAdsResponse(params);
  }
}
