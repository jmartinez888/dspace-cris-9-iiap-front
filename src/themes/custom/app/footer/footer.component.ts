import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FooterComponent as BaseComponent } from '../../../../app/footer/footer.component';

@Component({
  selector: 'ds-themed-footer',
  standalone: true,
  styleUrls: ['./footer.component.scss'],
  templateUrl: './footer.component.html',
  imports: [
    RouterLink,
  ],
})
export class FooterComponent extends BaseComponent {
}
