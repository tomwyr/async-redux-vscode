import * as changeCase from "change-case"

export function getWidgetTemplate(
  widgetName: string,
  viewModelName: string,
  injectViewModel: boolean,
): string {
  const snakeCaseViewModelName = changeCase.snake(viewModelName)

  const contructorAndFields = injectViewModel
    ? getContructorWithViewModel(widgetName, viewModelName)
    : getDefaultConstructor(widgetName)

  let imports = "import 'package:flutter/material.dart';"
  if (injectViewModel) {
    imports += `\n\nimport '${snakeCaseViewModelName}.dart';`
  }

  return `${imports}

class ${widgetName} extends StatelessWidget {
  ${contructorAndFields}

  @override
  Widget build(BuildContext context) => Container();
}
`
}

function getDefaultConstructor(widgetName: string) {
  return `const ${widgetName}({Key? key}) : super(key: key);`
}

function getContructorWithViewModel(widgetName: string, viewModelName: string) {
  return `${widgetName}({
    Key? key,
    required this.viewModel,
  }) : super(key: key);
  
  final ${viewModelName} viewModel;`
}
