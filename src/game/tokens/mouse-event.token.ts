import { DOCUMENT } from "@angular/common";
import { inject, InjectionToken } from "@angular/core";
import { fromEvent, map, merge, Observable } from "rxjs";

export const MOUSE_EVENT = new InjectionToken<Observable<MouseEvent>>(
  "Mouse event",
  {
    factory: () => {
      return getMouseEvent();
    },
  }
);

function getMouseEvent(): Observable<MouseEvent> {
  const mouseMove$ = fromEvent<MouseEvent>(inject(DOCUMENT), "mousemove");
  const mouseClick$ = fromEvent<MouseEvent>(inject(DOCUMENT), "mousedown");
  fromEvent<MouseEvent>(inject(DOCUMENT), "contextmenu")
    .pipe(map(preventAll))
    .subscribe();

  return merge(mouseMove$, mouseClick$);
}

function preventAll(event: {
  preventDefault: () => void;
  stopPropagation: () => void;
}) {
  event.preventDefault();
  event.stopPropagation();
}
