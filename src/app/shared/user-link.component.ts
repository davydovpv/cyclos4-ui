import { ChangeDetectionStrategy, Component, Injector, Input, OnInit } from '@angular/core';
import { BaseComponent } from 'app/shared/base.component';
import { User, AccountWithOwner } from 'app/api/models';
import { truthyAttr } from 'app/shared/helper';

/**
 * Shows a link to a user profile, and a popup on hover with more details.
 * Can also take an account, showing the link to the user if the account is of
 * kind `user`, or shows the account type name if no user is there (a system account).
 */
@Component({
  selector: 'user-link',
  templateUrl: 'user-link.component.html',
  styleUrls: ['user-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserLinkComponent extends BaseComponent implements OnInit {
  constructor(injector: Injector) {
    super(injector);
  }

  @Input()
  user: User;

  private _hideLink: boolean | string = false;
  @Input() get hideLink() {
    return this._hideLink;
  }
  set hideLink(hideLink: boolean | string) {
    this._hideLink = truthyAttr(hideLink);
  }

  @Input()
  account: AccountWithOwner;

  path: string;

  display: string;

  ngOnInit() {
    super.ngOnInit();
    if (this.account != null && this.user == null) {
      this.user = this.account.user;
    }
    if (this.user != null && this.user.id != null && !this.hideLink) {
      const loggedUser = this.login.user;
      if (loggedUser != null && loggedUser.id === this.user.id) {
        this.path = '/users/my-profile';
      } else {
        this.path = '/users/profile/' + this.user.id;
      }
    }
    if (this.user != null) {
      this.display = this.user.display;
    } else if (this.account != null) {
      this.display = (this.account.type || {}).name;
    }
  }
}
