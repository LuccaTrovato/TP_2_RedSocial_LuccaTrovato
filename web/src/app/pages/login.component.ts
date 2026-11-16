import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { errorMessage } from '../services/error-message';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-layout">
      <div class="auth-intro">
        <p class="eyebrow">TU COMUNIDAD, MÁS CERCA</p>
        <h1>Las buenas ideas se comparten.</h1>
        <p>Conectá con personas, compartí momentos y descubrí nuevas historias.</p>
      </div>
      <form class="panel auth-form" [formGroup]="form" (ngSubmit)="submit()">
        <h2>Qué bueno verte</h2>
        <p class="muted">Ingresá para continuar en Conecta.</p>
        <label for="identificador">Correo o nombre de usuario</label>
        <input id="identificador" type="text" formControlName="identificador" autocomplete="username">
        @if (form.controls.identificador.touched && form.controls.identificador.invalid) {
          <small class="field-error">Ingresá tu correo o nombre de usuario.</small>
        }
        <label for="password">Contraseña</label>
        <input id="password" type="password" formControlName="password" autocomplete="current-password">
        @if (form.controls.password.touched && form.controls.password.invalid) {
          <small class="field-error">La contraseña debe tener 8 caracteres, una mayúscula y un número.</small>
        }
        <button class="button button-wide" [disabled]="form.invalid || sending">Ingresar</button>
        <p class="form-footer">¿Todavía no tenés cuenta? <a routerLink="/registro">Registrate</a></p>
      </form>
    </section>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  sending = false;

  readonly form = this.fb.nonNullable.group({
    identificador: ['', Validators.required],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)]],
  });

  submit(): void {
    if (this.form.invalid || this.sending) return;
    this.sending = true;
    const { identificador, password } = this.form.getRawValue();
    this.auth.login(identificador, password).subscribe({
      next: () => {
        this.toast.success('Iniciaste sesión correctamente.');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        void this.router.navigateByUrl(returnUrl || '/publicaciones');
      },
      error: (error: unknown) => {
        this.sending = false;
        this.toast.error(errorMessage(error, 'No se pudo iniciar sesión.'));
      },
      complete: () => (this.sending = false),
    });
  }
}
