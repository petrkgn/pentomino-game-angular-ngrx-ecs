import { DOCUMENT } from '@angular/common';
import { inject, InjectionToken } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';

export const MOUSE_MOVE = new InjectionToken<Observable<MouseEvent>>(
  'Mouse event',
  {
    factory: () => {
      return fromEvent<MouseEvent>(inject(DOCUMENT), 'mousemove');
    },
  }
);
