/**
 * Copyright 2020 Bonitasoft S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ShapeBpmnElementKind } from './ShapeBpmnElementKind';
import { ShapeBpmnEventKind } from './ShapeBpmnEventKind';

export default class ShapeBpmnElement {
  constructor(readonly id: string, readonly name: string, readonly kind: ShapeBpmnElementKind, public parentId?: string, readonly instantiate: boolean = false) {}
}

export type BpmnEventKind =
  | ShapeBpmnElementKind.EVENT_BOUNDARY
  | ShapeBpmnElementKind.EVENT_START
  | ShapeBpmnElementKind.EVENT_END
  | ShapeBpmnElementKind.EVENT_INTERMEDIATE_THROW
  | ShapeBpmnElementKind.EVENT_INTERMEDIATE_CATCH;
export class ShapeBpmnEvent extends ShapeBpmnElement {
  constructor(id: string, name: string, elementKind: BpmnEventKind, readonly eventKind: ShapeBpmnEventKind, parentId: string) {
    super(id, name, elementKind, parentId);
  }
}

export class ShapeBpmnBoundaryEvent extends ShapeBpmnEvent {
  constructor(id: string, name: string, eventKind: ShapeBpmnEventKind, parentId: string, readonly isInterrupting: boolean = true) {
    super(id, name, ShapeBpmnElementKind.EVENT_BOUNDARY, eventKind, parentId);
  }
}

export class Participant {
  constructor(readonly id: string, readonly name?: string, public processRef?: string) {}
}
