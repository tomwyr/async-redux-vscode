export function getWidgetTemplate(widgetName: string): string {
  return `import 'package:flutter/material.dart';

class ${widgetName} extends StatelessWidget {
  const ${widgetName}({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) => Container();
}
`;
}
