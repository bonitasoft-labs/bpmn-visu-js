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

export class ShapeBpmnEvent extends ShapeBpmnElement {
  constructor(readonly id: string, readonly name: string, readonly elementKind: ShapeBpmnElementKind, readonly eventKind: ShapeBpmnEventKind, parentId?: string) {
    super(id, name, elementKind, parentId);
  }
}

export class ShapeBpmnBoundaryEvent extends ShapeBpmnEvent {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly elementKind: ShapeBpmnElementKind,
    readonly eventKind: ShapeBpmnEventKind,
    readonly attachedToRef: string,
    readonly isInterrupting: boolean = true,
    parentId?: string,
  ) {
    super(id, name, elementKind, eventKind, parentId);
  }
}

export class Participant {
  constructor(readonly id: string, readonly name?: string, public processRef?: string) {}
}
