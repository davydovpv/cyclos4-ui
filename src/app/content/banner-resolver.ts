import { Injector } from '@angular/core';
import { BannerCard } from 'app/content/banner-card';
import { Observable } from 'rxjs';

/**
 * Interface used to resolve the banners which are shown in the side area
 */
export interface BannerResolver {

  /**
   * Returns each of the banner cards shown in the given context.
   * @param injector The Angular injector, used to access shared services
   * @returns Either the banner cards or an observable of the banner cards
   */
  resolveCards(injector: Injector): BannerCard[] | Observable<BannerCard[]>;

}
