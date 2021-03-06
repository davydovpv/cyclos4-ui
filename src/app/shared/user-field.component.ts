import {
  Component, Input, ChangeDetectionStrategy, SkipSelf, Host, Optional, ViewChild, ElementRef, OnInit, OnDestroy
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlContainer } from '@angular/forms';
import { BaseAutocompleteFieldComponent } from 'app/shared/base-autocomplete-field.component';
import { User } from 'app/api/models';
import { Observable, Subscription, of } from 'rxjs';
import { UserCacheService } from 'app/core/user-cache.service';
import { distinctUntilChanged } from 'rxjs/operators';
import { UsersService } from 'app/api/services';
import { LoginService } from 'app/core/login.service';
import { ApiHelper } from 'app/shared/api-helper';
import { BsModalService } from 'ngx-bootstrap/modal';
import { PickContactComponent } from 'app/shared/pick-contact.component';
import { I18n } from '@ngx-translate/i18n-polyfill';

/**
 * Field used to select a user
 */
@Component({
  selector: 'user-field',
  templateUrl: 'user-field.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: UserFieldComponent, multi: true }
  ]
})
export class UserFieldComponent
  extends BaseAutocompleteFieldComponent<string, User>
  implements OnInit, OnDestroy {

  @Input() get user(): User {
    return this.selection;
  }
  set user(user: User) {
    this.selection = user;
  }
  @Input() allowPrincipal = false;
  @Input() allowSearch = true;
  @Input() allowContacts = true;

  @ViewChild('contactListButton') contactListButton: ElementRef;
  private contactSub: Subscription;
  private fieldSub: Subscription;

  placeholder: string;

  constructor(
    @Optional() @Host() @SkipSelf() controlContainer: ControlContainer,
    private userCache: UserCacheService,
    private usersService: UsersService,
    private login: LoginService,
    private modal: BsModalService,
    private i18n: I18n) {
    super(controlContainer);
  }

  ngOnInit() {
    super.ngOnInit();
    this.fieldSub = this.inputFieldControl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(value => {
        if (this.allowPrincipal) {
          this.value = ApiHelper.escapeNumeric(value);
        }
      });
    if (this.allowSearch) {
      this.placeholder = this.i18n('Type to search');
    } else if (this.allowPrincipal) {
      this.placeholder = this.i18n('Type the user identifier');
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.fieldSub.unsubscribe();
  }

  preprocessValue(value: any): string {
    if (value == null) {
      return null;
    } else if (typeof value === 'object') {
      return (value as User).id;
    } else {
      return value;
    }
  }

  onDisabledChange(isDisabled: boolean): void {
    super.onDisabledChange(isDisabled);
    if (this.contactListButton && this.contactListButton.nativeElement) {
      this.contactListButton.nativeElement.disabled = isDisabled;
    }
  }

  protected fetch(value: string): Observable<User> {
    return this.userCache.get(value);
  }

  protected query(text: string): Observable<User[]> {
    if (!this.allowSearch) {
      return of([]);
    }
    const loggedUser = this.login.user;
    const toExclude = loggedUser ? [loggedUser.id] : [];
    return this.usersService.searchUsers({
      keywords: text,
      ignoreProfileFieldsInList: true,
      usersToExclude: toExclude,
      pageSize: ApiHelper.AUTOCOMPLETE_SIZE
    });
  }

  toDisplay(user: User): string {
    return user.display;
  }

  toValue(user: User): string {
    return user.id;
  }

  showContactList() {
    const ref = this.modal.show(PickContactComponent, {
      class: 'modal-form'
    });
    const component = ref.content as PickContactComponent;
    this.contactSub = component.select.subscribe(contact => {
      this.select(contact);
      this.contactSub.unsubscribe();
    });
  }
}
