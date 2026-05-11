import { FormElement, SectionElement, QuestionElement } from '../../model/form-elements';
import { QuestionPaperSchemaDefn } from '../../model/question-paper';
import { UtilsService } from '../../services/utils.service';

export class QuestionPage {

    isFirst: boolean = false;
    isLast: boolean = false;
    isPreview: boolean = false;

    sections = new Array<SectionElement>();
    constructor() {

    }
}

export interface ISplitToPages {
    getSplit(defn: QuestionPaperSchemaDefn): Array<QuestionPage>;
    getReviewPage(defn: QuestionPaperSchemaDefn): QuestionPage;

}


export class DefaultQuestionPaperPagination implements ISplitToPages {
    getSplit(defn: QuestionPaperSchemaDefn): Array<QuestionPage> {
        let pages = new Array<QuestionPage>();
        let section_index = 0;

        for (let s of defn.sections) {
            let lastElement: FormElement = null;
            let q_index = 0;
            for (let q of s.questions) {
                if (q.isQuestion()) {
                    let page = this.constructPage(s, lastElement, q);
                    pages.push(page);
                    lastElement = q;
                }
                q_index++;
            }

            if (lastElement != s.questions[s.questions.length - 1]) {
                let page = this.constructPage(s, lastElement, s.questions[s.questions.length - 1]);
                pages.push(page);
                lastElement = s.questions[s.questions.length - 1];
            }
            section_index++;
        }

        if (pages.length > 0) {
            pages[0].isFirst = true;
            pages[pages.length - 1].isLast = true;
        }

        return pages;
    }


    getReviewPage(defn: QuestionPaperSchemaDefn): QuestionPage {

        let onlyPage = new QuestionPage();

        for (let s of defn.sections) {
            let page: QuestionPage = this.constructPage(s, null, s.questions[s.questions.length - 1]);

            for (let secOfPage of page.sections) {
                onlyPage.sections.push(secOfPage)
            }
        }
        onlyPage.isPreview = true;
        return onlyPage;

    }


    private constructPage(s: SectionElement, eleStart: FormElement, eleEnd: FormElement) {
        let indexStart = 0;
        if (eleStart != null) {
            indexStart = s.questions.findIndex(x => x == eleStart);
            indexStart++;
        }

        let indexEnd = s.questions.findIndex(x => x == eleEnd);

        let page = new QuestionPage();

        let sectionForAttempt = new SectionElement(UtilsService.jsonCopy(s))
        sectionForAttempt.questions = new Array<QuestionElement>();

        let i = indexStart;
        while (i <= indexEnd) {
            sectionForAttempt.questions.push(FormElement.parseFormElement(UtilsService.jsonCopy(s.questions[i])))
            i++;
        }

        page.sections.push(sectionForAttempt);
        return page;
    }

}





