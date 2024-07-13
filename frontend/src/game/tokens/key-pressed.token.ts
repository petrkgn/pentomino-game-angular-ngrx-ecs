import { DOCUMENT } from '@angular/common';
import { inject, InjectionToken } from '@angular/core';
import { fromEvent, map, Observable } from 'rxjs';

export const KEY_PRESSED = new InjectionToken<Observable<string>>(
  'Key pressed on game',
  {
    factory: () => {
      return fromEvent<KeyboardEvent>(inject(DOCUMENT), 'keydown').pipe(
        map((e) => e.code)
      );
    },
  }
);
