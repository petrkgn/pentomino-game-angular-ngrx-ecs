import { computed, inject } from "@angular/core";

import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { setEntities, withEntities } from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { LoadingStatus } from "../../constants/loading-status.enum";
import { EMPTY } from "rxjs/internal/observable/empty";
import { catchError } from "rxjs/internal/operators/catchError";
import { switchMap } from "rxjs/internal/operators/switchMap";
import { tap } from "rxjs/internal/operators/tap";
import { pipe } from "rxjs/internal/util/pipe";
import { map } from "rxjs/internal/operators/map";

import { AssetService } from "../../services/asset.service";
import { AssetImg } from "../../types/asset-img";
import { createMirrorImage } from "../../utils/flip-img";

export const AssetStore = signalStore(
  { providedIn: "root" },
  withState({
    loadingStatus: LoadingStatus.IDLE,
    selectedFileId: "",
    actionMessage: "",
    errorMessage: "",
  }),
  withEntities<AssetImg>(),
  withComputed(({ entities, selectedFileId }) => ({
    imgsById: computed(() =>
      entities()
        .filter((img) =>
          selectedFileId() ? img.id === selectedFileId() : true
        )
        .map(({ img }) => img)
    ),
  })),
  withMethods((store) => {
    return {
      setFilteredByImgId(FileId: string): void {
        patchState(store, { selectedFileId: FileId });
      },
    };
  }),
  withMethods((store, assetService = inject(AssetService)) => ({
    loadAssets: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(
            store,
            {
              loadingStatus: LoadingStatus.LOADING,
            },
            {
              actionMessage: "Loading files...",
            }
          );
        }),
        switchMap(() =>
          assetService.loadAssetsFromServer().pipe(
            map((images) =>
              images.map((img) => ({
                ...img,
                mirrorImg: createMirrorImage(img.img),
              }))
            ),
            tap((images) => {
              patchState(
                store,
                setEntities(images),
                {
                  loadingStatus: LoadingStatus.SUCCESS,
                },
                {
                  actionMessage: "Files loaded",
                }
              );
            }),
            catchError((err) => {
              patchState(
                store,
                {
                  loadingStatus: LoadingStatus.ERROR,
                },
                {
                  errorMessage: "Failed to load files" + err,
                }
              );

              return EMPTY;
            })
          )
        )
      )
    ),
  }))
);
