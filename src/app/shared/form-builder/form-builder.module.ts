import { NgModule } from '@angular/core';
import { AttemptModule } from './lib/attempt/attempt.module';
import { DesignModule } from './lib/design/design.module';
import { EvaluateModule } from './lib/evaluate/evaluate.module';

@NgModule({
  imports: [DesignModule, AttemptModule, EvaluateModule],
  exports: [DesignModule, AttemptModule, EvaluateModule],
})
export class FormBuilderModule {}
