import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { errorMessage } from '../services/error-message';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const repeat = control.get('repetirPassword')?.value;
  return password === repeat ? null : { passwordsMismatch: true };
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="form-page">
      <div class="page-heading">
        <p class="eyebrow">EMPEZÁ A CONECTAR</p>
        <h1>Creá tu cuenta</h1>
        <p class="muted">Completá tus datos para sumarte a la comunidad.</p>
      </div>
      <form class="panel form-grid" [formGroup]="form" (ngSubmit)="submit()">
        <div>
          <label for="nombre">Nombre</label>
          <input id="nombre" formControlName="nombre" autocomplete="given-name">
        </div>
        <div>
          <label for="apellido">Apellido</label>
          <input id="apellido" formControlName="apellido" autocomplete="family-name">
        </div>
        <div>
          <label for="email">Correo electrónico</label>
          <input id="email" type="email" formControlName="email" autocomplete="email">
        </div>
        <div>
          <label for="username">Nombre de usuario</label>
          <input id="username" formControlName="username" autocomplete="username">
        </div>
        <div>
          <label for="password">Contraseña</label>
          <input id="password" type="password" formControlName="password" autocomplete="new-password">
          <small class="hint">Mínimo 8 caracteres, una mayúscula y un número.</small>
        </div>
        <div>
          <label for="repetirPassword">Repetir contraseña</label>
          <input id="repetirPassword" type="password" formControlName="repetirPassword" autocomplete="new-password">
          @if (form.hasError('passwordsMismatch') && form.controls.repetirPassword.touched) {
            <small class="field-error">Las contraseñas no coinciden.</small>
          }
        </div>
        <div>
          <label for="fechaNacimiento">Fecha de nacimiento</label>
          <input id="fechaNacimiento" type="date" formControlName="fechaNacimiento">
        </div>
        <div>
          <label for="fotoPerfil">Foto de perfil (opcional)</label>
          <input id="fotoPerfil" type="file" accept="image/png,image/jpeg,image/webp" (change)="selectPhoto($event)">
        </div>
        <div class="full-width">
          <label for="biografia">Biografía (opcional)</label>
          <textarea id="biografia" rows="3" maxlength="300" formControlName="biografia"></textarea>
        </div>
        <button class="button button-wide full-width" [disabled]="form.invalid || sending">Crear cuenta</button>
        <p class="form-footer full-width">¿Ya tenés cuenta? <a routerLink="/login">Ingresá</a></p>
      </form>
    </section>
  `,
})
export class RegistroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private photo?: File;
  sending = false;

  readonly form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]{3,30}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)]],
      repetirPassword: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      biografia: ['', Validators.maxLength(300)],
    },
    { validators: passwordsMatch },
  );

  selectPhoto(event: Event): void {
    this.photo = (event.target as HTMLInputElement).files?.[0];
  }

  submit(): void {
    if (this.form.invalid || this.sending) return;
    this.sending = true;
    const { repetirPassword, ...fields } = this.form.getRawValue();
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
    if (this.photo) formData.append('fotoPerfil', this.photo);

    this.auth.register(formData).subscribe({
      next: () => {
        this.toast.success('Tu cuenta ya está lista.');
        void this.router.navigate(['/publicaciones']);
      },
      error: (error: unknown) => {
        this.sending = false;
        this.toast.error(errorMessage(error, 'No se pudo crear la cuenta.'));
      },
      complete: () => (this.sending = false),
    });
  }
}
