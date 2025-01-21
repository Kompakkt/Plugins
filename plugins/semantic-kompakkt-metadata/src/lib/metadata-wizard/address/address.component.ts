import { CommonModule } from '@angular/common';
import { Component, input, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Address } from '../metadata';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['../../theme.scss','./address.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInputModule],
})
export class AddressComponent {
  address = input.required<Address>();
  required = input(true);
}
