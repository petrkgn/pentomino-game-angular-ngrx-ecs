import { inject, Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { PentominoActions } from "../store/game/actions";
import { ComponentType } from "../constants/component-type.enum";
import { EntityView } from "../constants/view.enum";
import { DefaultComponents } from "../constants/default-components";
import { Matrices } from "../constants/matricies";
import { GameObjectsIds } from "../constants/game-objects-ids.enum";
import { EntityComponents } from "../types/components";
import { Boards } from "../constants/board-size";

@Injectable({
  providedIn: "root",
})
export class EntityFactoryService {
  private readonly store = inject(Store);
  private boardSize = "5x5";
  createEntity(entityConfig: {
    entityId: string;
    components: ComponentType[];
  }): void {
    const components = entityConfig.components
      .map((componentType) =>
        this.createComponent(entityConfig.entityId, componentType)
      )
      .filter(
        (component): component is EntityComponents => component !== undefined
      );

    this.store.dispatch(
      PentominoActions.addEntity({
        entityId:
          GameObjectsIds[entityConfig.entityId as keyof typeof GameObjectsIds],
        components,
      })
    );
  }

  setBoardSize(boardSize: string) {
    this.boardSize = boardSize;
  }

  private createComponent(
    entityId: string,
    componentType: ComponentType
  ): EntityComponents | undefined {
    const defaultComponent = { ...DefaultComponents[componentType] };

    switch (componentType) {
      case ComponentType.MATRIX:
        return this.createMatrixComponent(entityId, defaultComponent);
      case ComponentType.VIEW:
        return this.createViewComponent(entityId, defaultComponent);
      default:
        return defaultComponent as EntityComponents;
    }
  }

  private createMatrixComponent(
    entityId: string,
    defaultComponent: any
  ): EntityComponents | undefined {
    const isBoard = entityId === "BOARD";

    const matrix = isBoard
      ? Boards[this.boardSize as keyof typeof Boards]
      : Matrices[entityId as keyof typeof Matrices];

    if (!matrix) {
      return undefined;
    }
    const rows = Math.sqrt(matrix.length);
    return {
      ...defaultComponent,
      matrix,
      rows,
    };
  }

  private createViewComponent(
    entityId: string,
    defaultComponent: any
  ): EntityComponents {
    return {
      ...defaultComponent,
      img: EntityView[entityId as keyof typeof EntityView],
    };
  }
}
