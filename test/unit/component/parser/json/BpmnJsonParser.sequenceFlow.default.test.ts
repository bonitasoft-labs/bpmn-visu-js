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
import { parseJsonAndExpectOnlyEdgesAndFlowNodes, verifyEdge } from './JsonTestUtils';
import { SequenceFlowKind } from '../../../../../src/model/bpmn/edge/SequenceFlowKind';
import each from 'jest-each';
import Waypoint from '../../../../../src/model/bpmn/edge/Waypoint';
import { TProcess } from '../../../../../src/component/parser/xml/bpmn-json-model/baseElement/rootElement/rootElement';

describe('parse bpmn as json for default sequence flow', () => {
  each([
    ['exclusiveGateway'],
    ['inclusiveGateway'],
    ['task'],
    ['userTask'],
    ['serviceTask'],
    ['receiveTask'],
    ['subProcess'],
    // TODO: To uncomment when we support complex gateway
    //['complexGateway'],
    // TODO: To uncomment when we support manualTask
    //['manualTask'],
    // TODO: To uncomment when we support scriptTask
    //['scriptTask'],
    // TODO: To uncomment when we support sendTask
    //['sendTask'],
    // TODO: To uncomment when we support businessRuleTask
    //['businessRuleTask'],
  ]).it(`should convert as Edge, when an sequence flow (defined as default in %s) is an attribute (as object) of 'process' (as object)`, sourceKind => {
    const json = {
      definitions: {
        targetNamespace: '',
        process: {
          id: 'Process_1',
          sequenceFlow: {
            id: 'sequenceFlow_id_0',
            sourceRef: 'source_id_0',
            targetRef: 'targetRef_RLk',
          },
        },
        BPMNDiagram: {
          id: 'BpmnDiagram_1',
          BPMNPlane: {
            id: 'BpmnPlane_1',
            BPMNShape: {
              id: 'shape_source_id_0',
              bpmnElement: 'source_id_0',
              Bounds: { x: 362, y: 232, width: 36, height: 45 },
            },
            BPMNEdge: {
              id: 'edge_sequenceFlow_id_0',
              bpmnElement: 'sequenceFlow_id_0',
              waypoint: [{ x: 10, y: 10 }],
            },
          },
        },
      },
    };
    (json.definitions.process as TProcess)[`${sourceKind}`] = { id: 'source_id_0', default: 'sequenceFlow_id_0' };

    const model = parseJsonAndExpectOnlyEdgesAndFlowNodes(json, 1, 1);

    verifyEdge(model.edges[0], {
      edgeId: 'edge_sequenceFlow_id_0',
      bpmnElementId: 'sequenceFlow_id_0',
      bpmnElementName: undefined,
      bpmnElementSourceRefId: 'source_id_0',
      bpmnElementTargetRefId: 'targetRef_RLk',
      bpmnElementSequenceFlowKind: SequenceFlowKind.DEFAULT,
      waypoints: [new Waypoint(10, 10)],
    });
  });

  it(`should convert as Edge, when an sequence flow (defined as default in callActivity) is an attribute (as object) of 'process' (as array)`, () => {
    const json = {
      definitions: {
        targetNamespace: '',
        process: [
          {
            id: 'Process_1',
            callActivity: { id: 'source_id_0', default: 'sequenceFlow_id_0', calledElement: 'Process_2' },
            sequenceFlow: {
              id: 'sequenceFlow_id_0',
              sourceRef: 'source_id_0',
              targetRef: 'targetRef_RLk',
            },
          },
          { id: 'Process_2' },
        ],
        BPMNDiagram: {
          id: 'BpmnDiagram_1',
          BPMNPlane: {
            id: 'BpmnPlane_1',
            BPMNShape: {
              id: 'shape_source_id_0',
              bpmnElement: 'source_id_0',
              Bounds: { x: 362, y: 232, width: 36, height: 45 },
              isExpanded: true,
            },
            BPMNEdge: {
              id: 'edge_sequenceFlow_id_0',
              bpmnElement: 'sequenceFlow_id_0',
              waypoint: [{ x: 10, y: 10 }],
            },
          },
        },
      },
    };

    const model = parseJsonAndExpectOnlyEdgesAndFlowNodes(json, 1, 1);

    verifyEdge(model.edges[0], {
      edgeId: 'edge_sequenceFlow_id_0',
      bpmnElementId: 'sequenceFlow_id_0',
      bpmnElementName: undefined,
      bpmnElementSourceRefId: 'source_id_0',
      bpmnElementTargetRefId: 'targetRef_RLk',
      bpmnElementSequenceFlowKind: SequenceFlowKind.DEFAULT,
      waypoints: [new Waypoint(10, 10)],
    });
  });

  it(`should NOT convert, when an sequence flow (defined as default) is an attribute of 'process' and attached to a flow node where is NOT possible in BPMN Semantic`, () => {
    const json = {
      definitions: {
        targetNamespace: '',
        process: {
          id: 'Process_1',
          parallelGateway: { id: 'gateway_id_0', default: 'sequenceFlow_id_0' },
          sequenceFlow: {
            id: 'sequenceFlow_id_0',
            sourceRef: 'gateway_id_0',
            targetRef: 'targetRef_RLk',
          },
        },
        BPMNDiagram: {
          id: 'BpmnDiagram_1',
          BPMNPlane: {
            id: 'BpmnPlane_1',
            BPMNShape: {
              id: 'shape_gateway_id_0',
              bpmnElement: 'gateway_id_0',
              Bounds: { x: 362, y: 232, width: 36, height: 45 },
            },
            BPMNEdge: {
              id: 'edge_sequenceFlow_id_0',
              bpmnElement: 'sequenceFlow_id_0',
              waypoint: [{ x: 10, y: 10 }],
            },
          },
        },
      },
    };

    const model = parseJsonAndExpectOnlyEdgesAndFlowNodes(json, 1, 1);

    verifyEdge(model.edges[0], {
      edgeId: 'edge_sequenceFlow_id_0',
      bpmnElementId: 'sequenceFlow_id_0',
      bpmnElementName: undefined,
      bpmnElementSourceRefId: 'gateway_id_0',
      bpmnElementTargetRefId: 'targetRef_RLk',
      bpmnElementSequenceFlowKind: SequenceFlowKind.NORMAL,
      waypoints: [new Waypoint(10, 10)],
    });
  });
});
