import { EvaluationResult } from 'form-builder';

export class SaveEvaluationResult {
	public marks_scored!: number;
	public evaluation_results!: EvaluationResult;
	public is_eval_complete!: boolean;
}