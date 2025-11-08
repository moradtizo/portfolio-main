import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import emailjs from 'emailjs-com';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.contactForm.invalid) return;

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const templateParams = {
      name: this.contactForm.value.name,
      email: this.contactForm.value.email,
      subject: this.contactForm.value.subject,
      message: this.contactForm.value.message,
      time: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }),
    };

    emailjs.send(
      'service_whf8k9w',        // ✅ your service ID
      'template_iobz4s9',       // ✅ your template ID
      templateParams,
      'cKf6oJldB0xXWJ8zF'       // ✅ your public key
    )
    .then(() => {
      this.successMessage = 'Message sent successfully ✅';
      this.contactForm.reset();
    })
    .catch(() => {
      this.errorMessage = 'Something went wrong ❌ Please try again.';
    })
    .finally(() => {
      this.loading = false;
    });
  }
}
