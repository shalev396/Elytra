import { Aspects, Stack, Tags, type App, type IAspect } from 'aws-cdk-lib';
import type { IConstruct } from 'constructs';
import { stackTags, type Stage } from './constants.js';

/**
 * The app's only tagging: called once on the App, it tags every stack and every resource that can
 * carry tags — in every stack, including ones added later — with exactly Project and Stage.
 * Nothing is tagged individually.
 *
 * Two mechanisms because of the `@aws-cdk/core:explicitStackTags` flag (cdk.json): Tags.of()
 * reaches every resource but no longer the stack object itself, so an aspect sets the stack tags.
 * The `Name` tags some constructs add on their own (e.g. certificates) are removed.
 */
export function tagApp(app: App, stage: Stage): void {
  const tags = stackTags(stage);

  for (const [key, value] of Object.entries(tags)) {
    Tags.of(app).add(key, value);
  }
  Tags.of(app).remove('Name');

  const tagStacks: IAspect = {
    visit(node: IConstruct): void {
      if (!Stack.isStack(node)) return;
      for (const [key, value] of Object.entries(tags)) node.tags.setTag(key, value);
    },
  };
  Aspects.of(app).add(tagStacks);
}
