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
import BpmnVisu from '../component/BpmnVisu';
import { DropFileUserInterface } from '../component/ui_ux/DropFileUserInterface';

export const bpmnVisu = new BpmnVisu(window.document.getElementById('graph'));

// callback function for opening | dropping the file to be loaded
function readAndLoadFile(f: File): void {
  const reader = new FileReader();
  reader.onload = () => {
    bpmnVisu.load(reader.result as string);
  };
  reader.readAsText(f);
}

// TODO: move to UI initializer
new DropFileUserInterface(window, 'drop-container', 'graph', readAndLoadFile);

// TODO: make File Open Button a self contained component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleFileSelect(evt: any): void {
  const f = evt.target.files[0];
  readAndLoadFile(f);
}

document.getElementById('bpmn-file').addEventListener('change', handleFileSelect, false);
document.getElementById('file-selector').classList.remove('hidden');

////////////////////////////////////////////////////////////////////////////////
// if bpmn passed as request parameter, try to load it directly
////////////////////////////////////////////////////////////////////////////////
function log(header: string, message: unknown, ...optionalParams: unknown[]): void {
  // eslint-disable-next-line no-console
  console.info(header + ' ' + message, ...optionalParams);
}

function logStartup(message?: string, ...optionalParams: unknown[]): void {
  log('[DEMO STARTUP]', message, ...optionalParams);
}

// TODO is this the best way to run this function on page load?
(function() {
  const log = logStartup;
  log("Checking if 'BPMN auto loading from url parameter' is requested");
  const parameters = new URLSearchParams(window.location.search);
  const bpmnParameterValue = parameters.get('bpmn');
  if (bpmnParameterValue) {
    const bpmn = decodeURIComponent(bpmnParameterValue);
    log('BPMN auto loading');
    bpmnVisu.load(bpmn);
    log('BPMN auto loading completed');
  } else {
    log('No BPMN auto loading');
  }
})();
