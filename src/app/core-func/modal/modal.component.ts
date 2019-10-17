import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { regExps } from '../errors/custom-validation.component';


@Component({
  selector: 'amm-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  submitForm: FormGroup;
  desc: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.desc = data.firstname;

  }

  ngOnInit() {
    this.submitForm = this.fb.group({
      merchantLoginData: this.fb.group({
        firstname: ['', [Validators.required]],
        lastname: ['', [Validators.required]],
        gender: ['', [Validators.required]],
        address: ['']
      })
    });
  }

}
