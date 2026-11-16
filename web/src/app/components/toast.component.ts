import { Component, inject } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <aside class="toast-stack" aria-live="polite">
      @for (message of toast.messages(); track message.id) {
        <div class="toast" [class.toast-error]="message.kind === 'error'" role="status">
          <span>{{ message.text }}</span>
          <button type="button" aria-label="Cerrar mensaje" (click)="toast.dismiss(message.id)">×</button>
        </div>
      }
    </aside>
  `,
})
export class ToastComponent {
  readonly toast = inject(ToastService);
}
