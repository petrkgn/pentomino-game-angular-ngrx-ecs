import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";
import { Observable } from "rxjs/internal/Observable";
import { mergeMap } from "rxjs/internal/operators/mergeMap";
import { catchError } from "rxjs/internal/operators/catchError";
import { of } from "rxjs/internal/observable/of";
import { from } from "rxjs/internal/observable/from";
import { bufferCount } from "rxjs/internal/operators/bufferCount";
import { forkJoin } from "rxjs/internal/observable/forkJoin";
import { map } from "rxjs/internal/operators/map";
import { finalize } from "rxjs/internal/operators/finalize";

import { AssetImg } from "../types/asset-img";

@Injectable({
  providedIn: "root",
})
export class AssetService {
  private successCount = new BehaviorSubject<number>(0);
  private errorCount = new BehaviorSubject<number>(0);
  private readonly concurrentDownloads = 5;
  private readonly http = inject(HttpClient);

  private readonly apiUrl = "http://localhost:3000/backend/assets/img";

  loadAssetsFromServer(): Observable<AssetImg[]> {
    return this.http.get<string[]>(this.apiUrl).pipe(
      mergeMap((files) => this.downloadAll(files)),
      catchError((err) => {
        console.error("Error loading assets:", err);
        return of([]);
      })
    );
  }

  private downloadAll(paths: string[]): Observable<AssetImg[]> {
    if (paths.length === 0) {
      return of([]);
    }

    const downloadObservables = paths.map((path) => this.downloadAsset(path));

    return from(downloadObservables).pipe(
      bufferCount(this.concurrentDownloads),
      mergeMap((bufferedObservables) => forkJoin(bufferedObservables)),
      map((assetArrays) => assetArrays.flat()),
      map((assets) => assets.filter((asset) => asset !== null) as AssetImg[]),
      catchError((err) => {
        console.error("Error during downloading assets:", err);
        return of([]);
      }),
      finalize(() => {
        this.checkCompletion(paths.length);
      })
    );
  }

  private downloadAsset(fileName: string): Observable<AssetImg | null> {
    return new Observable<AssetImg | null>((observer) => {
      const img = new Image();
      const fileId = this.extractFileNameWithoutExtension(fileName);
      img.onload = () => {
        const asset: AssetImg = {
          id: fileId,
          type: "img",
          img,
          mirrorImg: null,
        };
        this.successCount.next(this.successCount.value + 1);
        observer.next(asset);
        observer.complete();
      };
      img.onerror = () => {
        this.errorCount.next(this.errorCount.value + 1);
        observer.error(`Error loading image: ${fileName}`);
        observer.complete();
      };
      img.src = `${this.apiUrl}/${fileName}`;
    }).pipe(
      catchError((err) => {
        console.error(err);
        return of(null);
      })
    );
  }

  private checkCompletion(total: number): void {
    const totalProcessed = this.successCount.value + this.errorCount.value;
    if (totalProcessed === total) {
      this.successCount.complete();
      this.errorCount.complete();
    }
  }

  private extractFileNameWithoutExtension(fileName: string): string {
    return fileName.split(".").slice(0, -1).join(".");
  }

  getSuccessCount(): Observable<number> {
    return this.successCount.asObservable();
  }

  getErrorCount(): Observable<number> {
    return this.errorCount.asObservable();
  }
}
