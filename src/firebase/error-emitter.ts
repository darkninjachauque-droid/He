'use client';

type ErrorCallback = (error: any) => void;

class ErrorEmitter {
  private listeners: { [event: string]: ErrorCallback[] } = {};

  on(event: string, callback: ErrorCallback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event: string, error: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(error));
    }
  }

  off(event: string, callback: ErrorCallback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }
}

export const errorEmitter = new ErrorEmitter();
