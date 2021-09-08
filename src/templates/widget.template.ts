export function getWidgetTemplate(widgetName: string): string {
  return `import 'package:flutter/material.dart';

class ${widgetName} extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Container();
}
`
}
