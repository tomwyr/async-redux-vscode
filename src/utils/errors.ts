export const errors = {
  notProjectWorkspace: new Error(
    "Current workspace is not a valid Dart project",
  ),
  pathNotSelected: new Error("File selecetion was cancelled"),
  selectionNotInProject: new Error(
    "Selected file path is outside of current project workspace",
  ),
  unknownProjectName: new Error(
    "Project pubspec.yaml file does not contain valid `name` entry",
  ),
}
