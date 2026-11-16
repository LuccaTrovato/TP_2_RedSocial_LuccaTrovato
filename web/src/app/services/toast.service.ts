import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  text: string;
  kind: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private nextId = 0;

  success(text: string): void {
    this.add(text, 'success');
  }

  error(text: string): void {
    this.add(text, 'error');
  }

  dismiss(id: number): void {
    this.messages.update((messages) => messages.filter((message) => message.id !== id));
  }

  private add(text: string, kind: ToastMessage['kind']): void {
    const id = this.nextId++;
    this.messages.update((messages) => [...messages, { id, text, kind }]);
    window.setTimeout(() => this.dismiss(id), 4500);
  }
}
