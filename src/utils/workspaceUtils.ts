/**
 * Copyright 2019 Red Hat, Inc. and others.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { RelativePattern, Uri, WorkspaceFolder, commands, window, workspace } from "vscode";
import { PROJECT_LABELS_COMMAND_ID, ProjectLabel } from '../definitions/constants';

/**
 * Returns a promise resolving to `true` only if the project located in `workspaceFolder`
 * is a Quarkus project
 * @param workspaceFolder
 */
export async function containsQuarkusProject(workspaceFolder: WorkspaceFolder): Promise<boolean> {
  // TODO this function must be improved. It only checks if a file named
  // pom.xml or build.gradle exists under the provided workspaceFolder

  return (await getFilePathsFromWorkspace(workspaceFolder, '**/pom.xml')).length > 0 ||
    (await getFilePathsFromWorkspace(workspaceFolder, '**/build.gradle')).length > 0;
}

export async function getFilePathsFromWorkspace(workspaceFolder: WorkspaceFolder, glob: string): Promise<Uri[]> {
  return await getFilePathsFromWorkspacePath(workspaceFolder.uri.fsPath, glob);
}

export async function getFilePathsFromWorkspacePath(workspacePath: string, glob: string): Promise<Uri[]> {
  return await workspace.findFiles(new RelativePattern(workspacePath, glob));
}

export function getTargetWorkspace(): WorkspaceFolder {

  const workspaceFolders: WorkspaceFolder[]|undefined = workspace.workspaceFolders;

  if (!workspaceFolders) {
    throw 'No workspace folders are opened.';
  }

  if (workspaceFolders.length === 1) {
    return workspace.workspaceFolders[0];
  }

  // try to return workspace folder containing currently opened file
  const currentDoc = window.activeTextEditor.document.uri;
  if (currentDoc && workspace.getWorkspaceFolder(currentDoc)) {
    return workspace.getWorkspaceFolder(currentDoc);
  }

  // TODO maybe implement an input box to determine which workspace folder to debug in
  return workspace.workspaceFolders[0]; // dummy return statement
}

export interface ProjectLabelInfo {
  uri: string;
  labels: ProjectLabel[];
}

/**
 * Returns a `Thenable` which resolves to `true` if current workspace
 * contains a Quarkus project. Resovles to `false` otherwise.
 */
export async function checkQuarkusProjectExistsWorkspace(): Promise<boolean> {
  return (await getWorkspaceProjectLabels(ProjectLabel.Quarkus)).length > 0;
}

/**
 * Returns an array of `ProjectTypeInfo` containing information for each project
 * in the current workspace
 *
 * @param projectLabel optioanlly specify what project label to retrieve
 */
export async function getWorkspaceProjectLabels(projectLabel?: ProjectLabel): Promise<ProjectLabelInfo[]> {
  const result: ProjectLabelInfo[] = await commands.executeCommand("java.execute.workspaceCommand", PROJECT_LABELS_COMMAND_ID);
  if (!projectLabel) return result;
  return result.filter((projectLabelInfo: ProjectLabelInfo) => {
    return projectLabelInfo.labels.includes(projectLabel);
  });
}